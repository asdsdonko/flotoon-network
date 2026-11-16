import {cookies} from 'next/headers';
import {serverDb} from './supabase';
export async function authorized(){const token=(await cookies()).get('flotoon_session')?.value;if(!token)return false;try{const {data,error}=await serverDb().auth.getUser(token);return !error&&!!data.user}catch{return false}}
