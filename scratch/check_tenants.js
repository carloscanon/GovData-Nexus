const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://vojsoqmhqorysapimutp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk'
);

async function main() {
  console.log('=== TENANTS EN SUPABASE ===');
  const { data: tenants, error } = await supabase.from('tenants').select('id, name, domain, status, subscription_plan').order('created_at');
  if (error) { console.error('Error:', error.message); return; }
  tenants.forEach(t => console.log(`ID: ${t.id} | Nombre: ${t.name} | Plan: ${t.subscription_plan} | Estado: ${t.status}`));

  console.log('\n=== TENANT USERS (email, role, tenant_id) ===');
  const { data: users, error: e2 } = await supabase.from('tenant_users').select('email, role, tenant_id, name');
  if (e2) { console.error('Error users:', e2.message); return; }
  users.forEach(u => console.log(`Email: ${u.email} | Rol: ${u.role} | TenantID: ${u.tenant_id} | Nombre: ${u.name}`));
}
main();
