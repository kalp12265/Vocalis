'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile, Session, UserData } from '@/types';
import { createDemoData } from '@/data/demo';
const KEY='vocalis-data-v1';
interface Store { data:UserData; ready:boolean; storageError:string; updateProfile:(profile:Partial<Profile>)=>void; addSession:(session:Session)=>boolean; reset:()=>void; clearDemo:()=>void; }
const Context=createContext<Store|null>(null);
export function VocalisProvider({children}:{children:ReactNode}) {
 const [data,setData]=useState<UserData>({profile:{name:'Alex',goals:[],comfort:'Neutral',onboarded:false},sessions:[]});
 const [ready,setReady]=useState(false);const [storageError,setStorageError]=useState('');
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!parsed.profile||!Array.isArray(parsed.sessions)||typeof parsed.profile.name!=='string'||!Array.isArray(parsed.profile.goals)||!parsed.sessions.every((s:Session)=>s.id&&s.analysis?.metrics&&Array.isArray(s.analysis.weak_areas)&&Array.isArray(s.analysis.improvement_techniques)))throw new Error('Invalid saved data');setData(parsed);}else{const initial=createDemoData();localStorage.setItem(KEY,JSON.stringify(initial));setData(initial);}}catch{setData(createDemoData());setStorageError('Saved data could not be loaded. This tab is using sample data. Export any new sessions before closing it.');}setReady(true);},[]);
 function persist(next:UserData){setData(next);try{localStorage.setItem(KEY,JSON.stringify(next));setStorageError('');return true;}catch{setStorageError('Browser storage is unavailable or full. Your work is available in this tab, but may not survive a refresh. Export it from Profile.');return false;}}
 return <Context.Provider value={{data,ready,storageError,updateProfile:p=>{persist({...data,profile:{...data.profile,...p}});},addSession:s=>persist({...data,sessions:[...data.sessions,s]}),reset:()=>{persist({profile:{name:'Alex',goals:[],comfort:'Neutral',onboarded:false},sessions:[]});},clearDemo:()=>{persist({...data,sessions:data.sessions.filter(s=>!s.demo)});}}}>{children}</Context.Provider>;
}
export function useVocalis(){const ctx=useContext(Context);if(!ctx)throw new Error('VocalisProvider is required');return ctx;}
export function getStats(sessions:Session[]){
 const sorted=[...sessions].sort((a,b)=>a.date.localeCompare(b.date));
 const avg=sorted.length?Math.round(sorted.reduce((n,s)=>n+s.analysis.overall_score,0)/sorted.length):0;
 const days=new Set(sorted.map(s=>new Date(s.date).toDateString()));let streak=0;const day=new Date();if(!days.has(day.toDateString()))day.setDate(day.getDate()-1);while(days.has(day.toDateString())){streak++;day.setDate(day.getDate()-1);}
 const latest=sorted.at(-1);const skills=latest?Object.entries(latest.analysis.metrics).sort((a,b)=>b[1]-a[1]):[];
 return {average:avg,streak,minutes:Math.round(sorted.reduce((n,s)=>n+s.duration,0)/60),improvement:sorted.length>1?sorted.at(-1)!.analysis.overall_score-sorted[0].analysis.overall_score:0,strongest:skills[0]?.[0]||'Not measured',weakest:skills.at(-1)?.[0]||'Structure',level:sorted.length<5?'Beginner':avg<70?'Developing':avg<80?'Confident':avg<90?'Advanced':'Exceptional'};
}
