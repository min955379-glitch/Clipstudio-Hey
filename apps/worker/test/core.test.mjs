import test from 'node:test'; import assert from 'node:assert/strict';
import { chooseSegments, normaliseWords, subtitles } from '../src/core.mjs';
test('selects scored non-overlapping valid clips',()=>{const items=[{start:0,end:20,title:'a',reason:'r',score:60},{start:10,end:30,title:'b',reason:'r',score:90},{start:35,end:50,title:'c',reason:'r',score:70},{start:49,end:999,title:'bad',reason:'r',score:99}];assert.deepEqual(chooseSegments(items,60,3).map(x=>x.title),['b','c'])});
test('normalises chunk timing and clips caption boundaries',()=>{const words=normaliseWords([{word:'hello',start:1,end:2},{word:'world',start:2,end:3}],600);assert.equal(words[0].start,601);assert.match(subtitles(words,{start:601.5,end:603}),/00:00:00,000 --> 00:00:01,500\nhello world/) });
test('rejects invalid analysis',()=>assert.throws(()=>chooseSegments([{start:-1,end:5}],10,3)));
