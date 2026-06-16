const fs = require('fs');
const filePath = 'src/app/policies/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Let's fix the duplicate block.
// In the duplicate block, we had a line containing "<select" followed by "<div>" without a closing tag.
// Let's search for:
// <select \n                       <div>
const targetRegex = /<select \s*\n\s*<div>/g;
if (targetRegex.test(content)) {
  console.log("Found target pattern! Replacing duplicate block...");
  
  // Let's find the first instance of the grid div
  const startPattern = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>`;
  const firstIdx = content.indexOf(startPattern);
  
  // We want to find the text starting from firstIdx up to the match of the targetRegex
  // Let's locate the index of the first targetRegex match
  targetRegex.lastIndex = 0;
  const match = targetRegex.exec(content);
  if (match) {
    const endIdx = match.index + match[0].length;
    const block = content.substring(firstIdx, endIdx);
    
    // Replace the block with the grid container
    const replacement = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>\n                      <div>`;
    content = content.replace(block, replacement);
    console.log("Duplicate block cleaned!");
  }
}

// 2. Let's replace any remaining teamMembers.map with companyUsers.map
const mapPattern = /\{teamMembers\.map/g;
if (mapPattern.test(content)) {
  content = content.replace(mapPattern, '{companyUsers.map');
  console.log("teamMembers mapping replaced with companyUsers!");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("File saved!");
