import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
const MAX_AUDIO_BYTES=25*1024*1024;
const TIMEOUT_MS=60000;
export async function POST(request:Request) {
 const apiKey=process.env.ASSEMBLYAI_API_KEY;
 if(!apiKey)return NextResponse.json({error:'Server-side transcription is not configured.'},{status:501});
 let audio:Blob;let topic='';
 try{
 const form=await request.formData();
 const file=form.get('audio');
 if(!(file instanceof Blob)||!file.size)return NextResponse.json({error:'No audio was received.'},{status:400});
 if(file.size>MAX_AUDIO_BYTES)return NextResponse.json({error:'This recording is too large to transcribe.'},{status:400});
 audio=file;
 const topicField=form.get('topic');
 if(typeof topicField==='string')topic=topicField.slice(0,300);
 }catch{return NextResponse.json({error:'The recording could not be read.'},{status:400});}
 try{
 const client=new AssemblyAI({apiKey});
 const buffer=Buffer.from(await audio.arrayBuffer());
 const transcript=await Promise.race([
 client.transcripts.transcribe({
 audio:buffer,
 language_detection:true,
 speaker_labels:true,
 format_text:true,
 // Contextual prompting: the practice topic helps the model recognize topic-specific words correctly.
 ...(topic?{prompt:`A person practicing a spoken response to this prompt: "${topic}"`}:{}),
 }),
 new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('Transcription is taking longer than expected. Please try again.')),TIMEOUT_MS)),
 ]);
 if(transcript.status==='error')return NextResponse.json({error:transcript.error||'Transcription failed.'},{status:502});
 const speakerCount=new Set((transcript.utterances||[]).map(u=>u.speaker)).size;
 return NextResponse.json({
 id:transcript.id,
 text:transcript.text||'',
 language_code:transcript.language_code||null,
 language_confidence:transcript.language_confidence,
 utterances:speakerCount>1?transcript.utterances!.map(u=>({speaker:u.speaker,text:u.text,start:u.start,end:u.end})):null,
 });
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Transcription failed. Your recording is safe—please try again.'},{status:502});}
}
