import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { categories } from '@/data/topics';
import PracticeSession from '@/components/practice-session';
export default async function Page({params}:{params:Promise<{mode:string}>}){const {mode}=await params;if(!categories.some(c=>c.id===mode))notFound();return <Suspense fallback={<div className="loading-screen">Preparing your speaking moment…</div>}><PracticeSession key={mode} mode={mode}/></Suspense>;}
