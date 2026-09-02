const fs = require('fs');
let lines = fs.readFileSync('src/components/global-shortcuts.tsx', 'utf8').split('\n');
// Index 56 = line 57. Remove trailing \r for comparison and rewrite block.
lines[56] = '      if (!isTypingTarget(e.target)) {';
lines[57] = '        if (e.key === "1") router.push("/tasks");';
lines[58] = '        else if (e.key === "2") router.push("/habits");';
lines[59] = '        else if (e.key === "3") router.push("/notes");';
lines[60] = '        else if (e.key === "4") router.push("/settings");';
lines[61] = '      }';
fs.writeFileSync('src/components/global-shortcuts.tsx', lines.join('\n'));
console.log('Block fixed');
lines.forEach((l, i) => { if (i >= 55 && i <= 62) console.log((i + 1) + ': ' + l); });