import withPWA from 'next-pwa';
export default withPWA({dest:'public',disable:process.env.NODE_ENV==='development',reactStrictMode:true});
