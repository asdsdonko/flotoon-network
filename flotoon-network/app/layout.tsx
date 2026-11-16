import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'FloToon Network | West Florence Moore',description:'Your favorite network. Your favorite dorm.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
