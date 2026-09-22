import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
export async function POST(request:Request) {
 const apiKey=process.env.ASSEMBLYAI_API_KEY;
 if(!apiKey)return NextResponse.json({error:'Server-side transcription is not configured.'},{status:501});
 let transcriptId:string;let words:string[];
 try{
 const body=await request.json();
 if(typeof body.transcriptId!=='string'||!body.transcriptId)return NextResponse.json({error:'No transcript to search.'},{status:400});
 if(!Array.isArray(body.words)||!body.words.every((w:unknown)=>typeof w==='string'))return NextResponse.json({error:'Enter at least one word or phrase to search for.'},{status:400});
 transcriptId=body.transcriptId;
 words=body.words.map((w:string)=>w.trim()).filter(Boolean).slice(0,10);
 if(!words.length)return NextResponse.json({error:'Enter at least one word or phrase to search for.'},{status:400});
 }catch{return NextResponse.json({error:'The search request could not be read.'},{status:400});}
 try{
 const client=new AssemblyAI({apiKey});
 const {matches}=await client.transcripts.wordSearch(transcriptId,words);
 return NextResponse.json({matches:matches.map(m=>({text:m.text,count:m.count,timestamps:m.timestamps}))});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Search failed. Please try again.'},{status:502});}
}
