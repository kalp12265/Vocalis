'use client';
import { useEffect, useState } from 'react';
import { Rocket, Trophy, Timer, Swords, Gavel, Heart, X } from 'lucide-react';
import { useDialogAccessibility } from '@/hooks/use-dialog';
const KEY='vocalis-idea-votes';
const ideas=[{id:'hackathon-pitch',icon:Trophy,color:'orange',title:'Hackathon Pitch Training',detail:'Pitch your own project in 1, 3 or 5 minutes and get judge-style feedback.',tag:'Coming soon'},{id:'pro-long-talks',icon:Timer,color:'purple',title:'10+ minute talks',detail:'Extended presentations and keynotes for Pro speakers.',tag:'Pro'},{id:'ai-debate',icon:Swords,color:'blue',title:'Debate an AI opponent',detail:'Argue live against an AI that pushes back on every point.',tag:'Crazy idea'},{id:'judge-panel',icon:Gavel,color:'green',title:'Shark-tank judge panel',detail:'Face a panel of tough AI judges who grill your pitch.',tag:'Crazy idea'}];
export default function IdeaVote(){
 const [open,setOpen]=useState(false);const [votes,setVotes]=useState<string[]>([]);const [burst,setBurst]=useState('');
 useDialogAccessibility(open,()=>setOpen(false));
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(saved))setVotes(saved.filter((v:unknown)=>typeof v==='string'));}catch{}},[]);
 function toggle(id:string){const next=votes.includes(id)?votes.filter(v=>v!==id):[...votes,id];setVotes(next);if(!votes.includes(id)){setBurst(id);setTimeout(()=>setBurst(b=>b===id?'':b),700);}try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}}
 return <div className="idea-vote"><button className={`idea-vote-trigger ${votes.length?'':'fresh'}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(o=>!o)}><Rocket size={14}/><span>Vote what’s next</span>{votes.length>0&&<b className="idea-vote-count">{votes.length}</b>}</button>
 {open&&<><button className="idea-vote-backdrop" aria-label="Close feature voting" onClick={()=>setOpen(false)}/><div className="idea-vote-card" role="dialog" aria-modal="true" aria-labelledby="idea-vote-title"><div className="idea-vote-head"><div><span className="idea-vote-eyebrow">🚀 Help shape Vocalis</span><h2 id="idea-vote-title">What should we build next?</h2><p>Vote for as many ideas as you like.</p></div><button className="icon-button" aria-label="Close" onClick={()=>setOpen(false)}><X size={16}/></button></div>
 <ul className="idea-vote-list">{ideas.map(idea=>{const voted=votes.includes(idea.id);return <li key={idea.id} className={voted?'voted':''}><span className={`icon-box ${idea.color}`}><idea.icon size={17}/></span><div><strong>{idea.title}<em className={idea.tag==='Crazy idea'?'crazy':''}>{idea.tag}</em></strong><small>{idea.detail}</small></div><button className={`idea-vote-button ${voted?'voted':''} ${burst===idea.id?'burst':''}`} aria-pressed={voted} aria-label={`${voted?'Remove vote for':'Vote for'} ${idea.title}`} onClick={()=>toggle(idea.id)}><Heart size={15} fill={voted?'currentColor':'none'}/>{voted?'Voted':'Vote'}</button></li>;})}</ul>
 <p className="idea-vote-foot">{votes.length?`Thanks! You’ve backed ${votes.length} idea${votes.length===1?'':'s'}. 💛`:'Your votes help us decide what to build first.'}</p></div></>}</div>;
}
