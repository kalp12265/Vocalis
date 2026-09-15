import { UserData } from '@/types';
import { analyzeLocally } from '@/services/analysis';
export const demoTranscript = 'I believe mountains offer something that beaches cannot: a real sense of perspective. First, being surrounded by something so much bigger than yourself helps everyday worries feel smaller. For example, last year I went hiking with a friend after a particularly stressful week. We spent two hours climbing, and when we reached the top, neither of us felt the need to check our phones. I think that says something important. Mountains ask you to make an effort, and the view feels earned. Of course, beaches are wonderful for relaxing. But for me, a mountain trip is not just a break from life. It is a reminder to look at life differently.';
export function createDemoData():UserData {
 const scores=[64,68,71,74,78];
 const topics=['What makes someone successful?','Tell me about a time you failed.','Is working from home better than working in an office?','What is one small thing that makes your day better?','Why are mountains better than beaches?'];
 const cats=['opinions','storytelling','opinions','everyday-life','everyday-life'];
 const transcripts=[
 'I think success is, um, about doing something that matters to you. A successful person does not necessarily have a lot of money. They might just be happy with their work and the people around them. I guess it is different for everyone. For me it means learning something new and having time for my family. Success is really about making your own choices and being happy with them.',
 'Last year I volunteered to organize an event at work. I was excited but I tried to handle everything myself. The invitations went out late and some people could not attend. I felt disappointed. However, I learned that asking for help is not a weakness. The next time I organized an event I gave everyone a clear task. It went much better because we worked as a team.',
 'I believe working from home is better for focused work because you can control your environment. For example, when I have a long document to write I get more done in a quiet room than in a busy office. However, an office makes it easier to connect with colleagues. The best approach is a balance. Use home for concentration and the office for collaboration.',
 'One small thing that makes my day better is a walk before breakfast. First, it gives me a few minutes without screens or notifications. For example, last week I noticed flowers growing through a crack in the pavement. That tiny detail made me slow down. Walking also helps me decide what really matters that day. Ultimately, it is not about exercise. It is about starting the day with attention instead of distraction.',demoTranscript];
 return {profile:{name:'Alex',goals:['Speaking confidence','Thinking on the spot'],comfort:'Somewhat uncomfortable',onboarded:false},sessions:scores.map((score,i)=>{
 const date=new Date();date.setDate(date.getDate()-(4-i));date.setHours(9+i,24,0,0);
 const analysis=analyzeLocally({transcript:transcripts[i],duration:60,topic:topics[i],category:cats[i],demo:true});
 analysis.overall_score=score; analysis.metrics={Clarity:score+5,Structure:score-4,Fluency:score+1,Vocabulary:score+7,Relevance:score+4,Spontaneity:score-7,Confidence:score+2,Conciseness:score-2};
 return {id:`demo-${i+1}`,date:date.toISOString(),category:cats[i],topic:topics[i],duration:60,transcript:transcripts[i],analysis,demo:true};
 })};
}
