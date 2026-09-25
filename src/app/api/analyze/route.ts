import { NextResponse } from 'next/server';
import { getAnalysisProvider } from '@/services/analysis';
export async function POST(request:Request) {
 try {
 const body=await request.json();
 if(typeof body.transcript!=='string'||body.transcript.trim().split(/\s+/).length<5)return NextResponse.json({error:'Please add at least five words to your transcript before analyzing.'},{status:400});
 if(body.transcript.length>40000 || typeof body.topic!=='string'||body.topic.length>2000 || typeof body.category!=='string'||typeof body.duration!=='number'||!Number.isFinite(body.duration)||body.duration<1||body.duration>1200)return NextResponse.json({error:'This session could not be read. Please check your transcript and try again.'},{status:400});
 const analysis=await getAnalysisProvider().analyze({transcript:body.transcript,topic:body.topic,category:body.category,duration:body.duration,demo:body.demo===true});
 return NextResponse.json(analysis);
 } catch(error) {return NextResponse.json({error:error instanceof Error?error.message:'Analysis failed. Your transcript is safe—please try again.'},{status:502});}
}
