const { chromium } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const B = 'https://vocalisai-jade.vercel.app';
const CURSOR = `(()=>{ if(window.__cur) return; const add=()=>{ if(!document.body||document.getElementById('__cur'))return; const c=document.createElement('div'); c.id='__cur'; c.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 2l14 11.2-6.3.9 3.6 7-2.7 1.3-3.5-7L5 19.8z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>'; c.style.cssText='position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))'; document.body.appendChild(c); const p=JSON.parse(sessionStorage.getItem('__curpos')||'null'); if(p) c.style.transform='translate('+(p.x-5)+'px,'+(p.y-2)+'px)'; }; window.__cur=true; document.addEventListener('DOMContentLoaded',add); add(); setInterval(add,300); window.addEventListener('mousemove',e=>{const c=document.getElementById('__cur'); if(c) c.style.transform='translate('+(e.clientX-5)+'px,'+(e.clientY-2)+'px)'; try{sessionStorage.setItem('__curpos',JSON.stringify({x:e.clientX,y:e.clientY}))}catch{}},true); window.addEventListener('mousedown',e=>{const r=document.createElement('div'); r.style.cssText='position:fixed;z-index:2147483646;pointer-events:none;border-radius:50%;border:3px solid #ea580c;width:16px;height:16px;left:'+(e.clientX-11)+'px;top:'+(e.clientY-11)+'px;opacity:.9;transition:all .45s ease-out'; document.body.appendChild(r); requestAnimationFrame(()=>{r.style.transform='scale(3.2)';r.style.opacity='0'}); setTimeout(()=>r.remove(),500);},true); })();`;
const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const DUR=JSON.parse(fs.readFileSync('audio/durations.json'));
async function scene(name, {mic, state, cursor=true, W=1280, H=720, dsf=1.5}, fn) {
  const args=[`--force-device-scale-factor=${dsf}`,`--window-size=${W},${H}`,'--hide-scrollbars','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required'];
  if (mic) args.push(`--use-file-for-fake-audio-capture=${path.resolve(mic)}%noloop`);
  const browser = await chromium.launch({ args });
  const ctx = await browser.newContext({ viewport:null, storageState: state && fs.existsSync(state) ? state : undefined, permissions:['microphone'] });
  if(cursor) await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  const dir = path.join('clips', name); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  const frames=[]; const marks={}; const says=[]; const cuts=[]; const ws=[]; let cdp=null, n=0, t0=null;
  const R = {
    page, B, marks, ws, says, cuts, DUR, W, H, pos:{x:W/2,y:H/2},
    say(key){ const t=R.now(); says.push({key,t}); console.log(`  [${name}] say ${key} @ ${t.toFixed(2)}`); return {t, end:t+DUR.dur[key], at:i=>t+DUR.off[key][i]}; },
    cut(a,b){ if(b-a>0.3){ cuts.push([a,b]); console.log(`  [${name}] cut ${a.toFixed(2)}-${b.toFixed(2)}`);} },
    end(){ R.mark('end'); },
    log(m){ console.log(`  [${name}] ${R.now().toFixed(2)} ${m}`); },
    now: () => (Date.now()-t0)/1000,
    mark: k => { marks[k]=R.now(); console.log(`  [${name}] mark ${k} @ ${marks[k].toFixed(2)}`); },
    async start() {
      cdp = await ctx.newCDPSession(page);
      cdp.on('Page.screencastFrame', async f => { const file=path.join(dir,`f${String(n++).padStart(6,'0')}.jpg`); frames.push({file, t:Date.now()}); fs.writeFile(file, Buffer.from(f.data,'base64'), ()=>{}); cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{}); });
      await page.mouse.move(R.pos.x,R.pos.y);
      await cdp.send('Page.startScreencast',{format:'jpeg',quality:93,everyNthFrame:2});
      t0 = Date.now(); frames.push({t:t0, start:true});
    },
    wait: ms => page.waitForTimeout(ms),
    async until(sec){ const d=sec-R.now(); if(d>0) await page.waitForTimeout(d*1000); },
    async move(x,y,ms=900){ const s={...R.pos}; const st=Date.now(); for(;;){ const f=Math.min(1,(Date.now()-st)/ms); const e=ease(f); await page.mouse.move(s.x+(x-s.x)*e, s.y+(y-s.y)*e); if(f>=1) break; await page.waitForTimeout(12);} R.pos={x,y}; },
    async center(loc){ const l=typeof loc==='string'?page.locator(loc).first():loc; await l.waitFor({state:'visible',timeout:20000}); let b=await l.boundingBox(); if(b.y<70||b.y+b.height>H-30){ const sy=await page.evaluate(()=>window.scrollY); await R.scrollTo(Math.max(0,sy+b.y+b.height/2-H/2),900); await page.waitForTimeout(150); b=await l.boundingBox(); } return {x:b.x+b.width/2,y:b.y+b.height/2,b}; },
    async hover(loc,ms=900){ const c=await R.center(loc); await R.move(c.x,c.y,ms); return c; },
    async click(loc,ms=900){ await R.hover(loc,ms); await page.waitForTimeout(220); await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up(); },
    async scrollTo(y,ms=1500){ const s=await page.evaluate(()=>window.scrollY); await page.evaluate(([s,y,ms])=>new Promise(res=>{ const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; const st=performance.now(); document.documentElement.style.scrollBehavior='auto'; const f=()=>{ const k=Math.min(1,(performance.now()-st)/ms); window.scrollTo(0,s+(y-s)*ease(k)); if(k<1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }),[s,y,ms]); },
    async scrollToEl(loc,offset=120,ms=1500){ const l=typeof loc==='string'?page.locator(loc).first():loc; await l.waitFor({state:'attached',timeout:20000}); const y=await l.evaluate(e=>e.getBoundingClientRect().top+window.scrollY); await R.scrollTo(Math.max(0,y-offset),ms); },
  };
  page.on('websocket', w => { w.on('framereceived', f => { try{ if(typeof f.payload==='string' && t0){ const m=JSON.parse(f.payload); if(m.type) ws.push({t:(Date.now()-t0)/1000, m}); } }catch{} }); });
  try { await fn(R); } finally {
    const end=Date.now();
    if (cdp) await cdp.send('Page.stopScreencast').catch(()=>{});
    await page.waitForTimeout(300);
    if (state) await ctx.storageState({path:state});
    await browser.close();
    if (t0) {
      const fr=frames.filter(f=>f.file);
      fs.writeFileSync(path.join(dir,'frames.json'),JSON.stringify(fr.map(f=>({file:path.resolve(f.file),t:Math.max(0,(f.t-t0)/1000)}))));
      const audio=ws.filter(x=>x.m.type==='reply.audio'); const meta=ws.filter(x=>x.m.type!=='reply.audio');
      fs.writeFileSync(path.join(dir,'meta.json'),JSON.stringify({name,duration:(end-t0)/1000,frames:fr.length,marks,says,cuts,ws:meta.map(x=>({t:x.t,type:x.m.type,text:x.m.text,status:x.m.status}))},null,1));
      if(audio.length) fs.writeFileSync(path.join(dir,'agent_audio.json'),JSON.stringify(audio.map(x=>({t:x.t,data:x.m.data}))));
      console.log(`[${name}] ${((end-t0)/1000).toFixed(1)}s, ${fr.length} frames, ${audio.length} agent audio chunks`);
    }
  }
}
module.exports={scene,B,DUR};
