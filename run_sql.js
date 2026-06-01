const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const url = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL')).split('=')[1].trim();
const key = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')).split('=')[1].trim();

const sql = fs.readFileSync('security_tables.sql', 'utf8');

fetch(url + '/rest/v1/rpc/exec_sql', {
  method: 'POST',
  headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
}).then(async r => {
  const t = await r.text();
  console.log('Status:', r.status, t);
}).catch(e => console.error(e));
