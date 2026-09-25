'use client';
import { useEffect, useState } from 'react';
import { useVocalis } from '@/hooks/use-vocalis';
import { UNLOCK_MINUTES } from '@/data/rewards';
export function formatCountdown(ms:number){const total=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;return `${h?`${h}:`:''}${String(m).padStart(h?2:1,'0')}:${String(s).padStart(2,'0')}`;}
// Ticks once a second while a timed unlock is running, and stops when it expires.
export function useUnlock(){
 const {data}=useVocalis();const until=Date.parse(data.rewards?.unlockedUntil||'');const [now,setNow]=useState(()=>Date.now());
 const remaining=Number.isFinite(until)?until-now:0;const active=remaining>0;
 useEffect(()=>{setNow(Date.now());if(!Number.isFinite(until)||until<=Date.now())return;const interval=setInterval(()=>{const t=Date.now();setNow(t);if(t>=until)clearInterval(interval);},1000);return()=>clearInterval(interval);},[until]);
 return {active,remaining,label:formatCountdown(remaining),minutes:data.rewards?.unlockedMinutes||UNLOCK_MINUTES};
}
