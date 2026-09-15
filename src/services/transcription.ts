interface SpeechResult { isFinal:boolean; 0:{transcript:string}; }
interface SpeechEvent { resultIndex:number; results:{length:number;[key:number]:SpeechResult}; }
interface Recognition { continuous:boolean; interimResults:boolean; lang:string; onresult:((event:SpeechEvent)=>void)|null; onerror:((event:{error:string})=>void)|null; onend:(()=>void)|null; start:()=>void; stop:()=>void; }
type SpeechWindow=Window & {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
export interface TranscriptionService { start(onText:(text:string)=>void,onError:(message:string)=>void):boolean;stop():void; }
export class BrowserTranscriptionService implements TranscriptionService {
 private recognition:Recognition|null=null;
 start(onText:(text:string)=>void,onError:(message:string)=>void){
 const w=window as SpeechWindow; const Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;
 if(!Constructor)return false;
 const recognition=new Constructor();recognition.continuous=true;recognition.interimResults=true;recognition.lang='en-US';
 recognition.onresult=(event)=>{let text='';for(let i=0;i<event.results.length;i++)text+=event.results[i][0].transcript+' ';onText(text.trim());};
 recognition.onerror=(event)=>{if(event.error!=='aborted')onError('Live transcription is unavailable. Your audio is still recording; you can add or correct the transcript afterward.');};
 this.recognition=recognition;try{recognition.start();return true;}catch{return false;}
 }
 stop(){if(this.recognition){this.recognition.onresult=null;this.recognition.onerror=null;this.recognition.stop();this.recognition=null;}}
}
export class ManualTranscriptionService implements TranscriptionService {start(){return false;}stop(){}}
/** Add another live provider here without changing the practice interface. */
export function createTranscriptionService():TranscriptionService {
 return process.env.NEXT_PUBLIC_STT_PROVIDER==='manual'?new ManualTranscriptionService():new BrowserTranscriptionService();
}
