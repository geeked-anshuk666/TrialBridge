import './globals.css';
import './orbit.css';
import './webgl-orb.css';

export const metadata = {
  title: 'TrialBridge - Private clinical trial discovery',
  description: 'Discover clinical trials in plain language.'
};

export default function Layout({children}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
