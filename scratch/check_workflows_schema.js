const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
  console.log("Querying first row of policy_workflows...");
  const { data, error } = await supabase.from('policy_workflows').select('*').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);

  console.log("\nQuerying first row of data_policies...");
  const { data: polData, error: polErr } = await supabase.from('data_policies').select('*').limit(1);
  console.log("Data:", polData);
  console.log("Error:", polErr);
}

main();
