import json, os, subprocess, base64, sys, numpy as np, soundfile as sf
SR=48000; FPS=30
ORDER=['A_landing_onboarding_topics','B_demo_feedback','C_coach','D_progress_hackathon','E1_slide4','E2_graphic','E3_slide5','E4_graphic2','F1_landing','F2_slide7','F3_landing_bottom','G_logo']
only=set(a for a in sys.argv[1:] if not a.startswith('--'))
TWO_Q='--two-questions' in sys.argv
def load(path):
    a,sr=sf.read(path,dtype='float32'); 
    if a.ndim>1: a=a.mean(1)
    return rs(a,sr)
def rs(a,sr):
    if sr==SR: return a
    n=int(len(a)*SR/sr); return np.interp(np.linspace(0,len(a)-1,n),np.arange(len(a)),a).astype(np.float32)
def fade(a,ms=12,head=True,tail=True):
    n=min(int(SR*ms/1000),len(a)//2); a=a.copy()
    if n>0:
        if head: a[:n]*=np.linspace(0,1,n)
        if tail: a[-n:]*=np.linspace(1,0,n)
    return a
def norm(a,rms=0.085,peak=0.9):
    v=a[np.abs(a)>0.01]; 
    if len(v)==0: return a
    g=rms/np.sqrt((v**2).mean()); g=min(g,peak/np.abs(a).max()); return a*g
def last_pause(a,after,before,minlen=0.22,thr=0.012):
    # returns time (s) of the middle of the last quiet gap within [after,before]
    w=int(SR*0.02); env=np.array([np.abs(a[i:i+w]).max() for i in range(0,len(a)-w,w)]); q=env<thr
    best=None; i=0
    while i<len(q):
        if q[i]:
            j=i
            while j<len(q) and q[j]: j+=1
            t0,t1=i*0.02,j*0.02
            if t1-t0>=minlen and t0>=after and t1<=before: best=(t0,t1)
            i=j
        else: i+=1
    return best

clips=[]; events=[]  # events: (global_time, samples)
g=0.0
for name in ORDER:
    d=f'clips/{name}'; m=json.load(open(f'{d}/meta.json')); fr=json.load(open(f'{d}/frames.json'))
    end=m['marks'].get('end',m['duration']); cuts=sorted(m.get('cuts',[])); ev=[]  # local events (t, samples)
    for s in m['says']:
        if s['key'].startswith('_'): continue
        ev.append((s['t']+0.0, norm(load(f"audio/{s['key']}.wav"))))
    if name=='B_demo_feedback':
        cuts=[[m['marks']['rec_stop']+1.0,c[1]] if abs(c[0]-m['marks']['rec_stop']-1.6)<0.1 else c for c in cuts]; cuts.append([m['marks']['transcribed']+2.0,m['marks']['transcribed']+3.2])
        ev.append((m['marks']['rec_live']+1.45, norm(load('audio/mic_demo.wav'))))
    if name=='G_logo': end=min(end,m['says'][0]['t']+7.82+2.3)
    if name=='E4_graphic2': end-=1.2
    if name=='C_coach':
        ck=m['marks']['coach_click']; ws=m['ws']; chunks=json.load(open(f'{d}/agent_audio.json'))
        users=[w for w in ws if w['type']=='input.speech.started']
        ev.append((users[0]['t']-0.75, norm(load('audio/mic_q1.wav'))))
        if TWO_Q: ev.append((users[1]['t']-0.75, norm(load('audio/mic_q2.wav'))))
        print('  q1/q2 placed at',users[0]['t']-0.75-ck,users[1]['t']-0.75-ck,'after click')
        starts=[w['t'] for w in ws if w['type']=='reply.started']; 
        for i,st in enumerate(starts):
            nx=starts[i+1] if i+1<len(starts) else 1e9
            cs=[c for c in chunks if st<=c['t']<nx]
            if not cs: continue
            pcm=np.frombuffer(b''.join(base64.b64decode(c['data']) for c in cs),dtype='<i2').astype(np.float32)/32768
            a=rs(pcm,24000); t0=cs[0]['t']+0.08
            intr=[u['t'] for u in users if st<u['t']<nx]
            if intr:
                lim=intr[0]-0.85-t0   # stop before the user's question starts
                a=a[:max(0,int(lim*SR))]
                lp=last_pause(a,1.0,len(a)/SR)
                if lp and len(a)/SR-lp[0]<3.5 and i>0: a=a[:int((lp[0]+0.12)*SR)]
                if i==1 and not TWO_Q: end=min(end,t0+len(a)/SR+0.7,users[1]['t']-0.9)
            elif i==len(starts)-1 and not TWO_Q: continue
            elif i==len(starts)-1:
                lp=last_pause(a,6.0,len(a)/SR-1.0)
                if lp:
                    a=a[:int((lp[0]+0.15)*SR)]; cuts.append([t0+len(a)/SR+0.9, m['marks']['coach_done']+0.6]); print('  reply2 truncated to',len(a)/SR,'s')
            print(f'  agent reply {i}: t0={t0:.2f} len={len(a)/SR:.2f}')
            ev.append((t0, fade(norm(a,rms=0.075),30)))
    cuts=[c for c in sorted(cuts) if c[1]-c[0]>0.3 and c[0]<end]
    def mp(t):
        r=t
        for a,b in cuts:
            if t>=b: r-=(b-a)
            elif t>a: r-=(t-a)
        return r
    dur=mp(end)
    # frames -> concat list
    pts=[]
    for f in fr:
        if f['t']>=end: break
        incut=any(a<f['t']<b for a,b in cuts)
        if incut: continue
        pts.append((mp(f['t']),f['file']))
    out=f'build/{name}.mp4'
    if not only or name in only or not os.path.exists(out):
        with open(f'build/{name}.txt','w') as fh:
            for i,(t,f) in enumerate(pts):
                nt=pts[i+1][0] if i+1<len(pts) else dur
                fh.write(f"file '{f}'\nduration {max(0.001,nt-(0 if i==0 else t)):.4f}\n")
            fh.write(f"file '{pts[-1][1]}'\n")
        subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'build/{name}.txt','-vf',f'fps={FPS},scale=1920:1080:flags=lanczos,format=yuv420p','-t',f'{dur:.3f}','-c:v','libx264','-preset','medium','-crf','17','-an',out],check=True)
    real=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out]).decode())
    print(f'{name}: raw {end:.2f}s -> {real:.2f}s  (global {g:.2f})  cuts={[[round(x,1) for x in c] for c in cuts]}')
    for t,a in ev: events.append((g+mp(t),a,name))
    clips.append((name,out,real,g)); g+=real
total=g; print('TOTAL',total, f'= {int(total//60)}:{total%60:05.2f}')
mix=np.zeros(int((total+1)*SR),dtype=np.float32)
for t,a,name in sorted(events,key=lambda e:e[0]):
    i=int(t*SR); a=fade(a,8); n=min(len(a),len(mix)-i); mix[i:i+n]+=a[:n]
mix=mix[:int(total*SR)]; mix=np.clip(mix,-0.98,0.98)
sf.write('build/audio.wav',mix,SR,subtype='PCM_16')
with open('build/all.txt','w') as fh:
    for n,o,r,_ in clips: fh.write(f"file '{os.path.abspath(o)}'\n")
json.dump([{'name':n,'start':round(s,2),'dur':round(r,2)} for n,o,r,s in clips],open('build/timeline.json','w'),indent=1)
fo=total-1.3
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','build/all.txt','-i','build/audio.wav','-vf',f'fade=t=in:st=0:d=0.6,fade=t=out:st={fo:.2f}:d=1.3','-af',f'loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st={fo:.2f}:d=1.3','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r',str(FPS),'-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','-shortest','build/Vocalis_Demo_Video.mp4'],check=True)
print(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,width,height,r_frame_rate','-of','default=nw=1','build/Vocalis_Demo_Video.mp4']).decode())
