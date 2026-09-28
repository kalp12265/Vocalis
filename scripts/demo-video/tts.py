import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
N = json.load(open("narration.json"))
VOICE="am_michael"
out={}; offs={}
def trim(s, thr=0.004):
    idx=np.where(np.abs(s)>thr)[0]
    return s if len(idx)==0 else s[max(0,idx[0]-600):idx[-1]+1800]
for key, paras in N.items():
    parts=[]; sr=24000; pos=0; offs[key]=[]
    mic = key.startswith("mic")
    for i,p in enumerate(paras):
        s, sr = k.create(p, voice=VOICE, speed=1.0 if mic else 1.12, lang="en-us")
        s = trim(s.astype(np.float32))
        offs[key].append(round(pos/sr,2))
        parts.append(s); pos+=len(s)
        if i < len(paras)-1:
            g=int(sr*(0.35 if mic else 0.38)); parts.append(np.zeros(g, dtype=np.float32)); pos+=g
    a = np.concatenate(parts)
    a = a / max(1e-6, np.abs(a).max()) * 0.89
    sf.write(f"audio/{key}.wav", a, sr, subtype="PCM_16")
    out[key]=round(len(a)/sr,2); print(key, out[key], flush=True)
json.dump({"dur":out,"off":offs}, open("audio/durations.json","w"), indent=1)
print("narration total", sum(v for k2,v in out.items() if not k2.startswith("mic")))
