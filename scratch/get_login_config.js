const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
    const { data, error } = await supabase
        .from('tenant_config')
        .select('*')
        .eq('tenant_id', 'global')
        .eq('config_key', 'govdata_login_config')
        .single();
        
    if (error) {
        console.error("Error fetching config:", error);
        return;
    }
    
    console.log("Config value:", JSON.stringify(data, null, 2));
}
main();
