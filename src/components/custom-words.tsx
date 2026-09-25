'use client';
import { useState } from 'react';
import { Plus, X, Tags, ChevronDown, Lock } from 'lucide-react';
import { cleanCustomWords, MAX_TERM_LENGTH, MAX_WORDS_PER_TERM, UNLOCKED_CUSTOM_WORDS } from '@/data/custom-words';
export default function CustomWords({words,allowance,unlocked,onChange}:{words:string[];allowance:number;unlocked:boolean;onChange:(words:string[])=>void}){
 const [open,setOpen]=useState(false);const [draft,setDraft]=useState('');const [hint,setHint]=useState('');
 const full=words.length>=allowance;
 function add(){const term=draft.replace(/\s+/g,' ').trim();if(!term)return;if(term.split(' ').length>MAX_WORDS_PER_TERM){setHint(`Keep each entry to ${MAX_WORDS_PER_TERM} words or fewer.`);return;}if(words.some(w=>w.toLowerCase()===term.toLowerCase())){setHint('That word is already on your list.');return;}if(full){setHint(`You’ve used all ${allowance} custom words.`);return;}onChange(cleanCustomWords([...words,term]));setDraft('');setHint('');}
 return <div className="custom-words"><button type="button" className="custom-words-toggle" aria-expanded={open} aria-controls="custom-words-panel" onClick={()=>setOpen(o=>!o)}><Tags size={13}/>Custom words<span className="custom-words-count">{Math.min(words.length,allowance)}/{allowance}</span><ChevronDown size={13} className={open?'':'closed'}/></button>
 {open&&<div id="custom-words-panel" className="custom-words-panel"><p>Add names or terms you’ll say, like your name, your project or technical jargon. They help AssemblyAI spell them correctly.</p>
 {words.length>0&&<ul className="custom-words-list">{words.map((w,i)=><li key={w} className={i>=allowance?'inactive':''} title={i>=allowance?'Not sent: over your current allowance':undefined}>{i>=allowance&&<Lock size={10}/>}{w}<button type="button" aria-label={`Remove ${w}`} onClick={()=>onChange(words.filter(x=>x!==w))}><X size={11}/></button></li>)}</ul>}
 <form className="custom-words-form" onSubmit={e=>{e.preventDefault();add();}}><input aria-label="Add a custom word" placeholder={full?'Allowance reached':'e.g. Vocalis, Kubernetes, Adaeze'} value={draft} maxLength={MAX_TERM_LENGTH} disabled={full} onChange={e=>{setDraft(e.target.value);setHint('');}}/><button type="submit" disabled={full||!draft.trim()}><Plus size={13}/>Add</button></form>
 <small className="custom-words-hint" role="status">{hint||(unlocked?`Unlocked: up to ${allowance} words while your session unlock is active.`:`Free: ${allowance} words. Redeem any session unlock with points for up to ${UNLOCKED_CUSTOM_WORDS}.`)}</small></div>}</div>;
}
