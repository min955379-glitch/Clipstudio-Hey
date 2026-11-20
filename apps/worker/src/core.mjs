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
