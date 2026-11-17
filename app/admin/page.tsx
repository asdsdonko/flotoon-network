import AdminClient from './ui';import {authorized} from '../../lib/auth';
export const dynamic='force-dynamic';
export default async function Admin(){return <AdminClient initiallyLoggedIn={await authorized()}/>}
