import {NextResponse} from 'next/server';
import {authorized} from '../../../../lib/auth';
import {serverDb} from '../../../../lib/supabase';
export async function POST(req:Request){
 if(!await authorized())return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const {id,action}=await req.json();
  if(typeof id!=='string'||!['approve','reject'].includes(action))return NextResponse.json({error:'Invalid request'},{status:400});
  // Database RPC atomically approves and publishes, preventing duplicate events on repeated clicks.
  const {data,error}=await serverDb().rpc('review_flotoon_event_request',{request_id:id,decision:action});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true,eventId:data});
 }catch{return NextResponse.json({error:'Review failed'},{status:500})}
}
