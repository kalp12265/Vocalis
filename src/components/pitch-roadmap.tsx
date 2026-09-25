import { Trophy, Clock3, Lock } from 'lucide-react';
const lengths=[{time:'1 min',label:'Elevator pitch'},{time:'3 min',label:'Hackathon pitch'},{time:'5 min',label:'Pitch + demo walkthrough'},{time:'10+ min',label:'Extended presentation',pro:true}];
const focus=['Problem & solution clarity','Hook → problem → solution → demo → impact','Pacing against the clock','Confidence & filler words'];
export default function PitchRoadmap(){
 return <section className="panel pitch-roadmap" aria-labelledby="pitch-roadmap-title"><div className="pitch-roadmap-head"><span className="icon-box orange"><Trophy size={19}/></span><div><div className="pitch-roadmap-tags"><span className="pitch-soon">Coming soon</span><span>On the roadmap</span></div><h2 id="pitch-roadmap-title">Hackathon Pitch Training</h2><p>Pitch your own project idea like you’re in front of the judges. Describe what you’re building, set the clock, and get feedback built for pitching.</p></div></div>
 <div className="pitch-lengths">{lengths.map(l=><div key={l.time} className={`pitch-length ${l.pro?'pro':''}`}><strong><Clock3 size={13}/>{l.time}{l.pro&&<span className="pitch-pro"><Lock size={9}/>Pro</span>}</strong><small>{l.label}</small></div>)}</div>
 <ul className="pitch-focus">{focus.map(f=><li key={f}>{f}</li>)}</ul></section>;
}
