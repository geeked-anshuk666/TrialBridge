import './globals.css';
import './orbit.css';
import './webgl-orb.css';
import OrbMount from './orb-mount';
import {DM_Serif_Display, Manrope} from 'next/font/google';
const display=DM_Serif_Display({subsets:['latin'],weight:'400',variable:'--font-display'});
const body=Manrope({subsets:['latin'],variable:'--font-body'});
export const metadata={title:'TrialBridge — Possibility, made legible',description:'Discover clinical trials in plain language.'};
export default function Layout({children}){return <html lang="en" className={`${display.variable} ${body.variable}`}><body>{children}<OrbMount/></body></html>}
