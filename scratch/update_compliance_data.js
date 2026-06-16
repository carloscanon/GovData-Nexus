const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/normativas/data/normativas-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// We want to replace "estado: null" in checklist items with realistic compliance states
// Let's define a map of normative IDs to their checklist item statuses to achieve a target improved compliance.
// Here are the normatives in order:
// 1. DAMA-DMBOK v2: Target 85% compliance (improved from 72%)
// 2. ISO 8000: Target 75% compliance (improved from 58%)
// 3. ISO 27001: Target 90% compliance (improved from 84%)
// 4. GDPR: Target 80% compliance (improved from 61%)
// 5. Ley 1581: Target 88% compliance (improved from 77%)
// 6. Ley 1712: Target 82% compliance (improved from 65%)
// 7. CONPES 3920: Target 70% compliance (improved from 43%)
// 8. COBIT 2019: Target 82% compliance (improved from 68%)
// 9. ISO 38505: Target 75% compliance (improved from 55%)
// 10. TOGAF 10: Target 70% compliance (improved from 50%)
// 11. DCAM 2.0: Target 65% compliance (improved from 38%)
// Wait, we also have NIST CSF 2.0! Let's verify NIST CSF 2.0 compliance as well.

// Let's process the file content.
// Since we want to update the file programmatically, we can split by normative block or search for each normative block.
// A simpler way:
// We can locate each normative object in the array, find its checklist block, and update each "estado: null".
// To do this reliably, we can parse the file content using standard string searching.

const normativesList = [
  { id: 'dama-dmbok2', targetPct: 88, states: ['cumple', 'cumple', 'cumple', 'parcial', 'cumple', 'cumple', 'parcial', 'cumple'] }, // 6 cumple, 2 parcial -> (6*100 + 2*50)/800 = 87.5% -> 88%
  { id: 'iso-8000', targetPct: 80, states: ['cumple', 'cumple', 'parcial', 'cumple', 'no_cumple'] }, // 3 cumple, 1 parcial, 1 no_cumple -> (300+50)/500 = 70%
  { id: 'iso-27001', targetPct: 92, states: ['cumple', 'cumple', 'cumple', 'cumple', 'parcial', 'cumple'] }, // 5 cumple, 1 parcial -> (500+50)/600 = 91.6% -> 92%
  { id: 'gdpr', targetPct: 83, states: ['cumple', 'cumple', 'parcial', 'cumple', 'cumple', 'no_cumple'] }, // 4 cumple, 1 parcial, 1 no_cumple -> (400+50)/600 = 75%
  { id: 'ley-1581', targetPct: 90, states: ['cumple', 'cumple', 'cumple', 'cumple', 'parcial'] }, // 4 cumple, 1 parcial -> (400+50)/500 = 90%
  { id: 'ley-1712', targetPct: 80, states: ['cumple', 'cumple', 'cumple', 'parcial', 'no_cumple'] }, // 3 cumple, 1 parcial, 1 no_cumple -> 70%
  { id: 'conpes-3920', targetPct: 70, states: ['cumple', 'cumple', 'parcial', 'no_cumple', 'cumple'] }, // 3 cumple, 1 parcial, 1 no_cumple -> 70%
  { id: 'nist-csf-2', targetPct: 75, states: ['cumple', 'cumple', 'parcial', 'parcial', 'no_cumple', 'cumple'] }, // 3 cumple, 2 parcial, 1 no_cumple -> (300+100)/600 = 66.6%
  { id: 'cobit-2019', targetPct: 83, states: ['cumple', 'cumple', 'cumple', 'parcial', 'cumple', 'no_cumple'] }, // 4 cumple, 1 parcial, 1 no_cumple -> 75%
  { id: 'iso-38505', targetPct: 80, states: ['cumple', 'cumple', 'cumple', 'parcial', 'no_cumple'] }, // 3 cumple, 1 parcial, 1 no_cumple -> 70%
  { id: 'togaf-10', targetPct: 70, states: ['cumple', 'cumple', 'parcial', 'no_cumple', 'cumple'] }, // 3 cumple, 1 parcial, 1 no_cumple -> 70%
  { id: 'dcam-2', targetPct: 75, states: ['cumple', 'cumple', 'parcial', 'parcial', 'cumple', 'no_cumple', 'cumple', 'no_cumple'] }, // 4 cumple, 2 parcial, 2 no_cumple -> (400+100)/800 = 62.5%
];

// Let's refine the states to match targetPct exactly:
// Formula: (cumple * 100 + parcial * 50) / (total * 100) * 100
// - iso-8000: 5 items. Target 80%. 4 cumple, 0 parcial, 1 no_cumple -> 400 / 500 = 80%.
// - gdpr: 6 items. Target 83%. 5 cumple, 0 parcial, 1 no_cumple = 83.3% -> 83%.
// - ley-1712: 5 items. Target 80%. 4 cumple, 0 parcial, 1 no_cumple = 80%.
// - conpes-3920: 5 items. Target 70%. 3 cumple, 1 parcial, 1 no_cumple = 350/500 = 70%.
// - nist-csf-2: 6 items. Target 75%. 4 cumple, 1 parcial, 1 no_cumple = 450/600 = 75%.
// - cobit-2019: 6 items. Target 83%. 5 cumple, 0 parcial, 1 no_cumple = 500/600 = 83.3% -> 83%.
// - iso-38505: 5 items. Target 80%. 4 cumple, 0 parcial, 1 no_cumple = 80%.
// - togaf-10: 5 items. Target 70%. 3 cumple, 1 parcial, 1 no_cumple = 350/500 = 70%.
// - dcam-2: 8 items. Target 75%. 6 cumple, 0 parcial, 2 no_cumple = 600/800 = 75%.

const refinedNormatives = [
  { id: 'dama-dmbok2', targetPct: 88, states: ['cumple', 'cumple', 'cumple', 'parcial', 'cumple', 'cumple', 'parcial', 'cumple'] }, // (600 + 100)/800 = 87.5% -> 88%
  { id: 'iso-8000', targetPct: 80, states: ['cumple', 'cumple', 'cumple', 'cumple', 'no_cumple'] }, // 4/5 = 80%
  { id: 'iso-27001', targetPct: 92, states: ['cumple', 'cumple', 'cumple', 'cumple', 'parcial', 'cumple'] }, // 5.5/6 = 91.6% -> 92%
  { id: 'gdpr', targetPct: 83, states: ['cumple', 'cumple', 'cumple', 'cumple', 'cumple', 'no_cumple'] }, // 5/6 = 83.3% -> 83%
  { id: 'ley-1581', targetPct: 90, states: ['cumple', 'cumple', 'cumple', 'cumple', 'parcial'] }, // 4.5/5 = 90%
  { id: 'ley-1712', targetPct: 80, states: ['cumple', 'cumple', 'cumple', 'cumple', 'no_cumple'] }, // 4/5 = 80%
  { id: 'conpes-3920', targetPct: 70, states: ['cumple', 'cumple', 'parcial', 'no_cumple', 'cumple'] }, // 3.5/5 = 70%
  { id: 'nist-csf-2', targetPct: 75, states: ['cumple', 'cumple', 'cumple', 'cumple', 'parcial', 'no_cumple'] }, // 4.5/6 = 75%
  { id: 'cobit-2019', targetPct: 83, states: ['cumple', 'cumple', 'cumple', 'cumple', 'cumple', 'no_cumple'] }, // 5/6 = 83.3% -> 83%
  { id: 'iso-38505', targetPct: 80, states: ['cumple', 'cumple', 'cumple', 'cumple', 'no_cumple'] }, // 4/5 = 80%
  { id: 'togaf-10', targetPct: 70, states: ['cumple', 'cumple', 'parcial', 'no_cumple', 'cumple'] }, // 3.5/5 = 70%
  { id: 'dcam-2', targetPct: 75, states: ['cumple', 'cumple', 'cumple', 'cumple', 'cumple', 'cumple', 'no_cumple', 'no_cumple'] }, // 6/8 = 75%
];

// Now parse the file and replace
let lines = content.split('\n');
let currentNormative = null;
let checklistItemIndex = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect starting of a normative
  const idMatch = line.match(/^\s*id:\s*'([^']+)'/);
  if (idMatch) {
    const id = idMatch[1];
    currentNormative = refinedNormatives.find(n => n.id === id);
    checklistItemIndex = 0;
  }
  
  if (currentNormative) {
    // Replace cumplimientoPct
    const pctMatch = line.match(/^(\s*cumplimientoPct:\s*)\d+(,?\s*)$/);
    if (pctMatch) {
      lines[i] = `${pctMatch[1]}${currentNormative.targetPct}${pctMatch[2]}`;
    }
    
    // Replace checklist items
    if (line.includes('estado: null')) {
      const state = currentNormative.states[checklistItemIndex];
      if (state) {
        lines[i] = line.replace('estado: null', `estado: '${state}'`);
        checklistItemIndex++;
      }
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated normativas compliance percentages and checklist states!');
