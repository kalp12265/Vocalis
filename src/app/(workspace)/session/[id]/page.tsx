import SessionResults from '@/components/session-results';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <SessionResults id={id}/>;}
