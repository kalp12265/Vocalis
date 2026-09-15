import { Analysis, AnalysisInput } from '@/types';
export async function requestAnalysis(input:AnalysisInput):Promise<Analysis>{
 try{const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(55000)});const body=await response.json();if(!response.ok)throw new Error(body.error||'Analysis is temporarily unavailable. Please try again.');return body;}catch(error){if(error instanceof TypeError)throw new Error('Could not connect. Check your connection and try again. Your transcript is still here.');throw error;}
}
export async function requestTopic(mode:string,previous=''):Promise<{prompt:string;side:string|null}>{const response=await fetch(`/api/topics?mode=${encodeURIComponent(mode)}&previous=${encodeURIComponent(previous)}`);if(!response.ok)throw new Error('Could not load a new prompt. Please try again.');return response.json();}
