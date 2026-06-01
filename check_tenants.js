const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const url = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL')).split('=')[1].trim();
const key = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY')).split('=')[1].trim();

// Check columns of tenant_users table
fetch(url + '/rest/v1/tenant_users?limit=1', {
  headers: { apikey: key, Authorization: 'Bearer ' + key }
}).then(async r => {
  const d = await r.json();
  if (Array.isArray(d) && d.length > 0) {
    console.log('tenant_users columns:', Object.keys(d[0]));
  } else {
    console.log('tenant_users response:', JSON.stringify(d));
  }
});
