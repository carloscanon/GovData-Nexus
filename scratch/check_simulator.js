const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
  console.log("Checking simulator_modules...");
  const mRes = await supabase.from('simulator_modules').select('*');
  console.log("Modules count:", mRes.data ? mRes.data.length : 0);
  console.log("Modules error:", mRes.error);
  if (mRes.data) {
    console.log("Modules:", mRes.data);
  }

  console.log("\nChecking simulator_steps...");
  const sRes = await supabase.from('simulator_steps').select('*');
  console.log("Steps count:", sRes.data ? sRes.data.length : 0);
  console.log("Steps error:", sRes.error);
}

main();
