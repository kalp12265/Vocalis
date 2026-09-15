import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { VocalisProvider } from '@/hooks/use-vocalis';
import './globals.css';
export const metadata:Metadata={title:'Vocalis — Speak Better. Think Faster.',description:'A little practice. A stronger voice. Practice spontaneous speaking in 60 seconds with personalized coaching and actionable feedback.'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body><VocalisProvider>{children}</VocalisProvider></body></html>;}
