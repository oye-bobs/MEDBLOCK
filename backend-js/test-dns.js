const dns = require('dns');

const hostnames = [
  'db.udrscpekldzyntzwtmtf.supabase.co',
  'db.kzeribhblnqsreiicjlt.supabase.co',
  'aws-0-eu-central-1.pooler.supabase.com'
];

console.log('Testing DNS resolution...');

hostnames.forEach(hostname => {
  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.log(`❌ ${hostname}: FAILED (${err.code})`);
    } else {
      console.log(`✅ ${hostname}: RESOLVED to ${address}`);
    }
  });
});
