import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile, open } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { chooseSegments, mergeChunkWords, planChunks, supportedContainer, subtitles } from './core.mjs';

// Local-file MVP only. Never expose this CLI directly to untrusted network requests.
const [inputArg, outputArg, countArg='3'] = process.argv.slice(2);
const key=process.env.GROQ_API_KEY;
const transcriptionModel=process.env.GROQ_TRANSCRIPTION_MODEL || 'whisper-large-v3-turbo';
const analysisModel=process.env.GROQ_ANALYSIS_MODEL || 'llama-3.3-70b-versatile';
const count=Number(countArg);
if (!inputArg || !outputArg || !key || !Number.isInteger(count) || count<1 || count>5) {
  console.error('Usage: GROQ_API_KEY=… node src/index.mjs <local-video> <output-directory> [1-5 clips]'); process.exit(1);
}
const input=resolve(inputArg), output=resolve(outputArg);
function run(command,args, cwd, timeout=600000) {
  return new Promise((ok,fail)=>{
    const child=spawn(command,args,{cwd,stdio:['ignore','pipe','pipe']}); let stdout='',stderr='';
    child.stdout.on('data',d=>{stdout=(stdout+d).slice(-100000)});child.stderr.on('data',d=>{stderr=(stderr+d).slice(-100000)});
    const timer=setTimeout(()=>child.kill('SIGKILL'),timeout);
    child.on('error',()=>{clearTimeout(timer);fail(new Error(`${command} could not start. Ensure FFmpeg is installed.`))});
    child.on('close',code=>{clearTimeout(timer);code===0?ok(stdout):fail(new Error(`${command} failed. Check the input media and worker environment.`))});
  });
}
async function groq(path, body, json=false) {
  for(let attempt=0;attempt<3;attempt++) {
    let response;
    try { response=await fetch(`https://api.groq.com/openai/v1/${path}`,{method:'POST',headers:{Authorization:`Bearer ${key}`,...(json?{'Content-Type':'application/json'}:{})},body:json?JSON.stringify(body):body,signal:AbortSignal.timeout(120000)}); }
    catch { if(attempt===2) throw new Error('Could not reach Groq.'); await new Promise(r=>setTimeout(r,1000*2**attempt)); continue; }
    if(response.ok) return response.json();
    if((response.status===429||response.status>=500) && attempt<2){const retry=Number(response.headers.get('retry-after')); const wait=Number.isFinite(retry)&&retry>0?Math.min(retry*1000,30000):1000*2**attempt;await new Promise(r=>setTimeout(r,wait));continue}
    throw new Error(`Groq request failed (HTTP ${response.status}). Check key permissions, model access, and limits.`);
  }
  throw new Error('Groq is unavailable.');
}
let temp;
try {
  const info=await stat(input); if(!info.isFile() || info.size>1024**3) throw new Error('Choose a file under 1 GB.');
  const file=await open(input,'r'); const header=Buffer.alloc(16); try { await file.read(header,0,16,0); } finally { await file.close(); }
  if (!supportedContainer(header)) throw new Error('Unsupported video file. Choose MP4, MOV, MKV or WEBM.');
  temp=await mkdtemp(join(tmpdir(),'clipstudio-')); await mkdir(output,{recursive:true});
  if ((await readdir(output)).length) throw new Error('Output directory must be empty to avoid overwriting files.');
  console.log('Inspecting video…');
  const probe=JSON.parse(await run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type','-of','json',input],temp));
  const duration=Number(probe.format?.duration);if(!Number.isFinite(duration)||duration<=0) throw new Error('Could not determine video duration.');
  if(duration>7200) throw new Error('Video exceeds the two-hour limit.');
  if(!probe.streams?.some(s=>s.codec_type==='video')) throw new Error('The file does not contain video.');
  if(!probe.streams?.some(s=>s.codec_type==='audio')) throw new Error('The video has no audio to transcribe.');
  const chunks=planChunks(duration), transcripts=[];
  for(let i=0;i<chunks.length;i++){
    const chunk=chunks[i], path=join(temp,`chunk-${i}.mp3`);
    console.log(`Extracting and transcribing audio ${i+1}/${chunks.length}…`);
    await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(chunk.start),'-i',input,'-t',String(chunk.end-chunk.start),'-vn','-ac','1','-ar','16000','-c:a','libmp3lame','-b:a','32k',path],temp);
    const bytes=await readFile(path); const form=new FormData();
    form.append('file',new Blob([bytes],{type:'audio/mpeg'}),`chunk-${i}.mp3`);form.append('model',transcriptionModel);form.append('response_format','verbose_json');form.append('timestamp_granularities[]','word');
    const transcript=await groq('audio/transcriptions',form); transcripts.push(transcript.words);
    await rm(path,{force:true});
  }
  const words=mergeChunkWords(chunks,transcripts);
  if(!words.length) throw new Error('No word timestamps returned; cannot create captioned clips.');
  const transcript=words.map(w=>`${w.start.toFixed(1)} ${w.word}`).join(' ');
  if(transcript.length>90000) throw new Error('Transcript is too long for this MVP. Try a shorter video.');
  console.log('Finding moments…');
  const result=await groq('chat/completions',{model:analysisModel,temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:'Return only JSON with a clips array. Each clip has numeric start and end in seconds, title, reason, and numeric score from 0 to 100. Choose compelling non-overlapping segments between 15 and 60 seconds, within the video duration.'},{role:'user',content:`Choose up to ${count} clips from this ${duration.toFixed(1)} second video transcript with timestamped words:\n${transcript}`}]},true);
  let analysis;try {analysis=JSON.parse(result.choices?.[0]?.message?.content)} catch {throw new Error('AI analysis returned invalid JSON.');}
  const segments=chooseSegments(analysis.clips,duration,count), manifest=[];
  for(let i=0;i<segments.length;i++){
    const segment=segments[i], captions=subtitles(words,segment);if(!captions) throw new Error('A selected clip had no caption timestamps.');
    await writeFile(join(temp,'captions.srt'),captions,'utf8');const file=`clip-${String(i+1).padStart(2,'0')}.mp4`;
    console.log(`Rendering clip ${i+1}/${segments.length}…`);
    await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(segment.start),'-i',input,'-t',String(segment.end-segment.start),'-vf',"scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,subtitles=captions.srt:force_style='FontName=DejaVu Sans,FontSize=17,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Alignment=2,MarginV=70'",'-c:v','libx264','-preset','veryfast','-crf','23','-c:a','aac','-movflags','+faststart',join(output,file)],temp);
    manifest.push({...segment,file});
  }
  await writeFile(join(output,'manifest.json'),JSON.stringify({source:basename(input),duration,clips:manifest},null,2));console.log(`Done. ${manifest.length} clip(s) saved to ${output}`);
} catch(error) { console.error(error instanceof Error ? error.message : 'Worker failed.'); process.exitCode=1; }
finally { if(temp) await rm(temp,{recursive:true,force:true}); }
