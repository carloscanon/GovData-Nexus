const fs = require('fs');
const c = fs.readFileSync('src/app/policies/page.tsx', 'utf8');
const opens = (c.match(/<div/g) || []).length;
const closes = (c.match(/<\/div>/g) || []).length;
console.log('opens:', opens, 'closes:', closes, 'diff:', opens - closes);
