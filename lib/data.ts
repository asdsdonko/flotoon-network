import {publicDb} from './supabase';
export type RA={id:string;name:string;role:string;email:string;slack:string;image_url:string;sort_order:number};
export type Event={id:string;title:string;event_date:string;time:string;location:string;description:string;image_url:string};
export type Album={id:string;title:string;image_url:string;photos:string[];created_at?:string};
export type Content={ras:RA[];events:Event[];albums:Album[];slackUrl:string};
export const demo:Content={ras:Array.from({length:11},(_,i)=>({id:`ra-${i+1}`,name:`RA ${i+1}`,role:'West Flo RA',email:'',slack:'',image_url:'',sort_order:i})),events:[],albums:[],slackUrl:''};
export async function getContent():Promise<Content>{const db=publicDb();if(!db)return demo;const [r,e,a,s]=await Promise.all([db.from('ras').select('*').order('sort_order'),db.from('events').select('*').order('event_date'),db.from('albums').select('*').order('created_at',{ascending:false}),db.from('settings').select('*').eq('key','slack_url').maybeSingle()]);return {ras:r.data?.length?r.data:demo.ras,events:e.data||[],albums:a.data||[],slackUrl:s.data?.value||''}}
