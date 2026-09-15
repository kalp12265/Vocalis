'use client';
import { useEffect, useRef } from 'react';
export function useDialogAccessibility(open:boolean,onClose:()=>void){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
 if(!open)return;
 const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
 const dialog=document.querySelector<HTMLElement>('[role="dialog"], [role="alertdialog"]');
 const getFocusable=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]')||[]).filter(el=>el.getClientRects().length>0);
 getFocusable()[0]?.focus();
 function onKey(event:KeyboardEvent){if(event.key==='Escape'){event.preventDefault();close.current();return;}if(event.key!=='Tab')return;const elements=getFocusable();const first=elements[0],last=elements.at(-1);if(event.shiftKey&&(document.activeElement===first||!dialog?.contains(document.activeElement))){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||!dialog?.contains(document.activeElement))){event.preventDefault();first?.focus();}}
 document.addEventListener('keydown',onKey);
 return()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=overflow;previous?.focus();};
 },[open]);
}
