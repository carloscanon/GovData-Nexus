const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL')).split('=')[1].trim();
const key = env.split('\n').find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')).split('=')[1].trim();

const fetchTable = async (t) => {
  const r = await fetch(url + '/rest/v1/' + t + '?select=id,tenant_id&limit=3', {
    headers: { apikey: key, 'Authorization': 'Bearer ' + key }
  });
  const d = await r.json();
  console.log(t + ':', JSON.stringify(d));
};

Promise.all([
  fetchTable('policy_standards'),
  fetchTable('policy_workflows'),
  fetchTable('policy_procedures'),
  fetchTable('policy_controls'),
]);
