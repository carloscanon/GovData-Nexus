fetch('https://vojsoqmhqorysapimutp.supabase.co/rest/v1/', {
  headers: {
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk'
  }
}).then(res => {
  console.log('Status:', res.status);
  for (const [key, val] of res.headers.entries()) {
    console.log(`${key}: ${val}`);
  }
}).catch(console.error);
