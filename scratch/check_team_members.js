const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
  console.log("Checking team_members...");
  const tmRes = await supabase.from('team_members').select('*');
  console.log("Team members count:", tmRes.data ? tmRes.data.length : 0);
  if (tmRes.data) {
    console.log("Team members:", tmRes.data.map(m => ({ id: m.id, tenant_id: m.tenant_id, name: m.name, role: m.role })));
  }

  console.log("\nChecking tenant_users...");
  const tuRes = await supabase.from('tenant_users').select('*');
  console.log("Tenant users count:", tuRes.data ? tuRes.data.length : 0);
  if (tuRes.data) {
    console.log("Tenant users:", tuRes.data.map(u => ({ email: u.email, name: u.name, tenant_id: u.tenant_id })));
  }
}

main();
