'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Zap, X, Check, Lock, Timer, Flame, ArrowRight, ShoppingBag, Clock3 } from 'lucide-react';
import { useVocalis } from '@/hooks/use-vocalis';
import { useUnlock } from '@/hooks/use-unlock';
import { useDialogAccessibility } from '@/hooks/use-dialog';
import { getRewards, LEVELS, SESSION_POINTS, UNLOCK_TIERS, POINT_PACKS, MIN_SCORING_SECONDS, CHAOS_CHALLENGE, getChaosChallenge } from '@/data/rewards';
export default function RewardsBadge(){
 const {data,redeemUnlock}=useVocalis();const unlock=useUnlock();const [open,setOpen]=useState(false);const [tab,setTab]=useState<'earn'|'shop'>('earn');const [celebrate,setCelebrate]=useState(0);const [packNotice,setPackNotice]=useState('');
 useDialogAccessibility(open,()=>setOpen(false));
 const rewards=getRewards(data.sessions,data.rewards?.spent||0);const chaos=getChaosChallenge(data.sessions);
 function redeem(minutes:number){if(redeemUnlock(minutes)){setCelebrate(minutes);setTimeout(()=>setCelebrate(0),1600);}}
 function close(){setOpen(false);setPackNotice('');}
 return <div className="rewards"><button className={`rewards-trigger ${unlock.active?'unlocked':''}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>open?close():setOpen(true)}><Zap size={14} fill="currentColor"/><span><b>{rewards.balance}</b> pts</span>{unlock.active&&<span className="rewards-timer"><Timer size={11}/>{unlock.minutes}m · {unlock.label}</span>}</button>
 {open&&<><button className="idea-vote-backdrop" aria-label="Close rewards" onClick={close}/><div className="idea-vote-card rewards-card" role="dialog" aria-modal="true" aria-labelledby="rewards-title">
 <div className="idea-vote-head"><div><span className="idea-vote-eyebrow">⚡ Speak. Earn. Unlock.</span><h2 id="rewards-title">Your speaking points</h2></div><button className="icon-button" aria-label="Close" onClick={close}><X size={16}/></button></div>
 <div className="rewards-balance"><strong className={celebrate?'pop':''}>{rewards.balance}</strong><span>points to spend<small>{rewards.earned} earned in total</small></span>{unlock.active&&<span className="rewards-active"><Timer size={12}/>{unlock.minutes} min unlocked<b>{unlock.label}</b></span>}</div>
 <h3 className="rewards-subhead">Unlock longer sessions · 1 hour</h3>
 <ul className="rewards-tiers">{UNLOCK_TIERS.map(tier=>{const short=tier.cost-rewards.balance;const current=unlock.active&&unlock.minutes===tier.minutes;return <li key={tier.minutes} className={`${current?'active':''} ${celebrate===tier.minutes?'celebrate':''}`}><span className="rewards-tier-time"><Clock3 size={13}/>{tier.minutes} min</span><small>{current?<>Active · <b>{unlock.label}</b> left</>:unlock.active&&tier.minutes<unlock.minutes?'Adds an hour to your unlock':`All categories for 1 hour`}</small><button className="rewards-redeem" disabled={short>0} onClick={()=>redeem(tier.minutes)}>{short>0?<><Lock size={11}/>{short} more</>:<>{current?'+1 hr':'Unlock'} · {tier.cost}</>}</button></li>;})}</ul>
 {unlock.active&&<Link href="/practice" className="rewards-go" onClick={close}>Start a {unlock.minutes}-minute session <ArrowRight size={12}/></Link>}
 <div className="segmented rewards-tabs" role="tablist"><button role="tab" aria-selected={tab==='earn'} className={tab==='earn'?'active':''} onClick={()=>setTab('earn')}>Earn points</button><button role="tab" aria-selected={tab==='shop'} className={tab==='shop'?'active':''} onClick={()=>setTab('shop')}><ShoppingBag size={11}/>Get more points</button></div>
 {tab==='earn'?<>
 <div className="rewards-earn">{LEVELS.map(level=><div key={level} className={level==='Chaotic'?'chaos':''}><span className={`difficulty ${level.toLowerCase()}`}><i/>{level}</span><b>+{SESSION_POINTS[level]}{level==='Chaotic'&&<Flame size={11}/>}</b></div>)}</div>
 <p className="rewards-note">Chaos pays best. Sessions under {MIN_SCORING_SECONDS} seconds and demos don’t earn points.</p>
 <div className={`rewards-daily ${chaos.complete?'complete':''}`}><Flame size={14}/><span><b>Daily chaos challenge</b>{CHAOS_CHALLENGE.attempts} Chaotic sessions of {CHAOS_CHALLENGE.minSeconds/60}+ min · {chaos.complete?'claimed today':`${chaos.done}/${CHAOS_CHALLENGE.attempts} today`}</span><b>+{CHAOS_CHALLENGE.bonus}</b></div>
 <h3 className="rewards-subhead">Level completion bonuses</h3>
 <ul className="rewards-levels">{rewards.levels.map(l=><li key={l.level} className={l.complete?'complete':''}><span className={`rewards-check ${l.level.toLowerCase()}`}>{l.complete?<Check size={11}/>:null}</span><span>{l.level}<small>{l.done}/{l.total} prompts</small></span><div className={`level-meter-track ${l.level.toLowerCase()}`}><i style={{width:`${l.total?Math.round(l.done/l.total*100):0}%`}}/></div><b>+{l.bonus}</b></li>)}</ul>
 </>:<>
 <ul className="rewards-packs">{POINT_PACKS.map(pack=><li key={pack.id} className={pack.tag?'featured':''}>{pack.tag&&<em>{pack.tag}</em>}<strong><Zap size={13} fill="currentColor"/>{pack.points.toLocaleString('en-US')}</strong><small>points</small><button className="rewards-buy" onClick={()=>setPackNotice(`Payments are coming soon. The ${pack.points.toLocaleString('en-US')}-point pack isn’t on sale yet, so nothing was charged.`)}>{pack.price}</button></li>)}</ul>
 <p className="rewards-note" role="status">{packNotice||'Top up to unlock longer sessions any time. Checkout is coming soon.'}</p>
 </>}
 </div></>}</div>;
}
