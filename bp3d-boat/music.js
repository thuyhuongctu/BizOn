import { SONG_TITLE, LYRICS as L1 } from './lyrics.js';
import { LYRICS_2 } from './lyrics-2.js';
// Music player + lyrics panel for the 3D scene. Remembers playback position.
const LYRICS = L1 + '\n' + LYRICS_2;

export function mountMusic(src) {
  const KEY = 'bps3d-song-pos-v4';
  const a = new Audio(src); a.loop = true; a.preload = 'metadata';
  a.addEventListener('loadedmetadata', () => { const t = +localStorage.getItem(KEY); if (t && t < a.duration) a.currentTime = t; });
  setInterval(() => { if (!a.paused) localStorage.setItem(KEY, a.currentTime.toFixed(1)); }, 1000);
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:6;display:flex;flex-direction:column;gap:8px;align-items:flex-start;max-width:calc(100vw - 32px);font:700 13px/1.3 system-ui,sans-serif';
  const panel = document.createElement('div');
  panel.style.cssText = 'display:none;width:min(360px,calc(100vw - 32px));max-height:min(52vh,460px);overflow:auto;background:rgba(255,253,246,.94);color:#033337;border-radius:18px;padding:16px 18px;box-shadow:0 12px 30px rgba(3,51,55,.25);font:500 13px/1.6 system-ui,sans-serif;white-space:pre-line';
  panel.innerHTML = '<b style="font-size:15px;display:block;margin-bottom:6px">' + SONG_TITLE + '</b>' +
    LYRICS.split('\n').map(l => /^[\[(].*[\])]$/.test(l) ? `<span style="display:block;margin-top:10px;font-size:11px;font-weight:800;opacity:.55">${l}</span>` : l).join('\n');
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:6px;align-items:center;background:rgba(3,51,55,.82);color:#fff;border-radius:99px;padding:5px 12px 5px 5px;backdrop-filter:blur(8px)';
  const btn = document.createElement('button');
  btn.style.cssText = 'width:38px;height:38px;border:0;border-radius:50%;background:#fda127;color:#033337;font:800 15px system-ui;cursor:pointer;flex:none';
  const title = document.createElement('span'); title.textContent = SONG_TITLE; title.style.cssText = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
  const lyr = document.createElement('button'); lyr.textContent = 'Lời bài hát';
  lyr.style.cssText = 'border:0;border-radius:99px;padding:6px 10px;background:rgba(255,255,255,.16);color:#fff;font:inherit;cursor:pointer;flex:none;white-space:nowrap';
  const sync = () => { btn.textContent = a.paused ? '▶' : '❚❚'; };
  btn.onclick = () => { a.paused ? a.play() : a.pause(); };
  a.addEventListener('play', sync); a.addEventListener('pause', sync); sync();
  lyr.onclick = () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
  row.append(btn, title, lyr); box.append(panel, row); document.body.append(box);
  return a;
}
