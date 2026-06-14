const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
    const { data: tenants } = await supabase.from('tenants').select('id, name');
    for (const t of tenants) {
        const { data: tu } = await supabase.from('tenant_users').select('name').eq('tenant_id', t.id);
        const { data: tm } = await supabase.from('team_members').select('name').eq('tenant_id', t.id);
        console.log(`Tenant: ${t.name} (${t.id})`);
        console.log(`  tenant_users: ${tu ? tu.length : 0} ->`, tu ? tu.map(u => u.name) : []);
        console.log(`  team_members: ${tm ? tm.length : 0} ->`, tm ? tm.map(m => m.name) : []);
    }
}
main();
