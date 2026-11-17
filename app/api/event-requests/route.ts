import {NextResponse} from 'next/server';
import {authorized} from '../../../lib/auth';
import {serverDb} from '../../../lib/supabase';
export const runtime='nodejs';
const err=(message:string,status=400)=>NextResponse.json({error:message},{status});
const str=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const dateValid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00'))&&new Date(s+'T12:00:00').toISOString().slice(0,10)===s;
export async function POST(req:Request){
 try{
  const body=await req.json();
  if(body.website)return NextResponse.json({ok:true}); // Honeypot for simple bots
  const requester=str(body.requester,100),email=str(body.email,180),title=str(body.title,140),event_date=str(body.event_date,10);
  const time=str(body.time,100),location=str(body.location,180),description=str(body.description,2000);
  if(!requester||!title||!dateValid(event_date))return err('Name, event title, and valid date are required');
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return err('Invalid email');
  const {error}=await serverDb().from('event_requests').insert({requester,email,title,event_date,time,location,description});
  if(error)throw error;
  return NextResponse.json({ok:true},{status:201});
 }catch{return err('Could not submit request. Try again later.',500)}
}
export async function GET(){
 if(!await authorized())return err('Unauthorized',401);
 const {data,error}=await serverDb().from('event_requests').select('*').order('created_at',{ascending:false}).limit(200);
 if(error)return err('Could not load requests',500);
 return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});
}
