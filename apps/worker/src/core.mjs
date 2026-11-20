export function chooseSegments(raw, duration, count) {
  if (!Array.isArray(raw)) throw new Error('Analysis did not return a clip list.');
  const candidates = raw.filter(s => s && Number.isFinite(s.start) && Number.isFinite(s.end) && s.start >= 0 && s.end <= duration && s.end - s.start >= 5 && s.end - s.start <= 90 && typeof s.title === 'string' && typeof s.reason === 'string' && Number.isFinite(s.score) && s.score >= 0 && s.score <= 100)
    .sort((a,b) => b.score - a.score);
  const selected = [];
  for (const item of candidates) {
    if (selected.some(other => item.start < other.end && other.start < item.end)) continue;
    selected.push({start:item.start,end:item.end,title:item.title.slice(0,120),reason:item.reason.slice(0,300),score:item.score});
    if (selected.length === count) break;
  }
  if (!selected.length) throw new Error('Analysis returned no usable clip moments.');
  return selected;
}
function time(seconds) {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;
}
export function subtitles(words, segment) {
  const valid = words.filter(w => Number.isFinite(w.start) && Number.isFinite(w.end) && w.end > w.start && w.start < segment.end && w.end > segment.start && typeof w.word === 'string');
  const blocks=[];
  for (let i=0; i<valid.length; i+=5) {
    const group=valid.slice(i,i+5), start=Math.max(0,group[0].start-segment.start), end=Math.min(segment.end-segment.start,group[group.length-1].end-segment.start);
    const text=group.map(w=>w.word.replace(/[\r\n{}\\<>]/g,'').trim()).filter(Boolean).join(' ');
    if (text && end>start) blocks.push(`${blocks.length+1}\n${time(start)} --> ${time(end)}\n${text}\n`);
  }
  return blocks.join('\n');
}
export function normaliseWords(words, offset) {
  if (!Array.isArray(words)) return [];
  return words.filter(w => w && typeof w.word==='string' && Number.isFinite(w.start) && Number.isFinite(w.end) && w.end>w.start).map(w=>({word:w.word,start:w.start+offset,end:w.end+offset}));
}

// Each extraction covers the same source timeline, with a two-second overlap.
export function planChunks(duration, size = 600, overlap = 2) {
  if (!Number.isFinite(duration) || duration <= 0 || size <= overlap || overlap < 0) throw new Error('Invalid chunk settings.');
  const chunks=[];
  for (let start=0; start<duration; start+=size-overlap) {
    const end=Math.min(duration,start+size);
    chunks.push({start,end});
    if(end===duration) break;
  }
  return chunks;
}
// Split each overlap at its midpoint. The ownership window prevents words in
// both transcription responses from appearing twice, even with shifted timings.
export function mergeChunkWords(chunks, transcripts) {
  if (chunks.length !== transcripts.length) throw new Error('Missing chunk transcript.');
  const merged=[];
  for (let i=0;i<chunks.length;i++) {
    const lower=i===0 ? 0 : (chunks[i-1].end+chunks[i].start)/2;
    const upper=i===chunks.length-1 ? Infinity : (chunks[i].end+chunks[i+1].start)/2;
    for(const word of normaliseWords(transcripts[i],chunks[i].start)) {
      const middle=(word.start+word.end)/2;
      if(middle>=lower && middle<upper && word.start>=0 && word.end<=chunks[i].end+0.1) merged.push(word);
    }
  }
  return merged.sort((a,b)=>a.start-b.start || a.end-b.end);
}
export function supportedContainer(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 12) return false;
  // ISO base media (MP4/MOV) or EBML (Matroska/WebM). ffprobe verifies streams.
  return (bytes[4]===0x66 && bytes[5]===0x74 && bytes[6]===0x79 && bytes[7]===0x70) ||
    (bytes[0]===0x1a && bytes[1]===0x45 && bytes[2]===0xdf && bytes[3]===0xa3);
}
