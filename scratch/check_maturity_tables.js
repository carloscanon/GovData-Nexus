const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
  console.log("Checking maturity_assessments...");
  const ma = await supabase.from('maturity_assessments').select('*').limit(1);
  console.log("maturity_assessments error:", ma.error);

  console.log("\nChecking maturity_findings...");
  const mf = await supabase.from('maturity_findings').select('*').limit(1);
  console.log("maturity_findings error:", mf.error);

  console.log("\nChecking maturity_roadmaps...");
  const mr = await supabase.from('maturity_roadmaps').select('*').limit(1);
  console.log("maturity_roadmaps error:", mr.error);
}

main();
