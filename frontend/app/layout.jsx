import './globals.css';
import './orbit.css';
import './webgl-orb.css';
import OrbMount from './orb-mount';

export const metadata = {
  title: 'TrialBridge - Private clinical trial discovery',
  description: 'Discover clinical trials in plain language.'
};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body>{children}<OrbMount /></body>
    </html>
  );
}
