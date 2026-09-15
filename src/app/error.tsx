'use client';
import { AlertCircle, RotateCw } from 'lucide-react';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main className="empty-state" style={{maxWidth:600,margin:'70px auto'}}><span className="icon-box orange"><AlertCircle/></span><h3>A small pause. Not the end of your progress.</h3><p>This page couldn’t load. Your saved sessions are still in this browser. Try loading it again.</p><button className="button button-primary" style={{marginTop:24}} onClick={reset}>Try again <RotateCw size={15}/></button></main>;}
