const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
    const { data: users, error } = await supabase
        .from('tenant_users')
        .select('*')
        .ilike('name', '%Carlos%');
        
    if (error) {
        console.error("Error fetching users:", error);
        return;
    }
    
    console.log("Found users containing 'Carlos':");
    users.forEach(u => {
        console.log(`- Name: ${u.name}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Password: ${u.password}`);
        console.log(`  Tenant ID: ${u.tenant_id}`);
        console.log(`  Role: ${u.role}`);
        console.log("-----------------------------------");
    });
}
main();
