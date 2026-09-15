import Link from 'next/link';
import { Mic, ArrowRight } from 'lucide-react';
export default function NotFound(){return <main className="empty-state" style={{maxWidth:550,margin:'100px auto',padding:50}}><span className="icon-box orange"><Mic/></span><h3>Let’s find your next speaking moment.</h3><p>This page isn’t part of your practice space. Your next prompt is just one click away.</p><Link href="/practice" className="button button-primary">Back to practice <ArrowRight size={16}/></Link></main>;}
