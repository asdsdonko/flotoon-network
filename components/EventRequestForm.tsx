'use client';
import {useState} from 'react';
export default function EventRequestForm(){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');
  const form=e.currentTarget;
  const body=Object.fromEntries(new FormData(form).entries());
  try{const r=await fetch('/api/event-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw Error(j.error||'Request failed');setDone(true);form.reset();setMessage('Request submitted! An RA will review it.')}catch(e){setMessage((e as Error).message)}finally{setBusy(false)}
 }
 return <div className="request-section"><button type="button" className="request-toggle" onClick={()=>setOpen(!open)}>{open?'− CLOSE REQUEST FORM':'+ REQUEST AN EVENT'}</button>{open&&<form className="request-form" onSubmit={submit}><h3>GOT SOMETHING COMING UP?</h3><p>Submit an event for RA approval. Requests do not appear publicly until approved.</p><div className="request-fields"><label>YOUR NAME *<input name="requester" required maxLength={100}/></label><label>EMAIL (OPTIONAL)<input name="email" type="email" maxLength={180}/></label><label>EVENT NAME *<input name="title" required maxLength={140}/></label><label>DATE *<input name="event_date" type="date" required/></label><label>TIME<input name="time" placeholder="e.g. 7–9 PM" maxLength={100}/></label><label>LOCATION<input name="location" maxLength={180}/></label></div><label>DETAILS<textarea name="description" maxLength={2000} rows={3}/></label><div style={{display:'none'}} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><button className="request-submit" type="submit" disabled={busy}>{busy?'SENDING...':'SUBMIT FOR APPROVAL →'}</button>{message&&<p role="status">{message}</p>}{done&&<button type="button" onClick={()=>{setDone(false);setMessage('')}}>SUBMIT ANOTHER</button>}</form>}</div>
}
