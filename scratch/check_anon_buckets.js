const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function test() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log('Buckets list:', data);
  console.log('Error:', error);
  
  const { data: bucketData, error: getError } = await supabase.storage.getBucket('governance-docs');
  console.log('governance-docs bucket:', bucketData);
  console.log('governance-docs error:', getError);
}

test();
