#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Components that need to be fixed (imported with underscore but used in JSX)
const componentsToFix = [
  'Mail', 'Lock', 'Phone', 'CardHeader', 'CardTitle', 'CardDescription',
  'Building', 'Globe', 'Users', 'UserCheck', 'Filter', 'Edit', 'Clock',
  'CheckCircle', 'TrendingUp', 'XCircle', 'ArrowUp', 'ArrowDown',
  'DollarSign', 'Smartphone', 'X', 'Link', 'ArrowRight', 'Badge', 'Button'
];

// Files to process
const filesToProcess = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true
});

let totalFixed = 0;

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file contains JSX (rough heuristic)
  if (!content.includes('return (') && !content.includes('return <') && !content.includes('=> (') && !content.includes('=> <')) {
    return; // Skip non-JSX files
  }

  componentsToFix.forEach(component => {
    // Check if component is used in JSX
    const jsxPattern = new RegExp(`<${component}[\\s/>]`, 'g');
    if (content.match(jsxPattern)) {
      // Fix the import - remove underscore prefix
      const importPattern = new RegExp(
        `(import\\s*{[^}]*)(\\s+${component}\\s+as\\s+_${component})([^}]*}\\s*from)`,
        'g'
      );

      if (content.match(importPattern)) {
        content = content.replace(importPattern, `$1 ${component}$3`);
        modified = true;
        console.log(`Fixed ${component} import in ${path.basename(filePath)}`);
      }

      // Also check for underscore prefix in import without 'as'
      const underscoreImport = new RegExp(
        `(import\\s*{[^}]*)(\\s+_${component})([^}]*}\\s*from)`,
        'g'
      );

      if (content.match(underscoreImport)) {
        content = content.replace(underscoreImport, `$1 ${component}$3`);
        modified = true;
        console.log(`Fixed _${component} import in ${path.basename(filePath)}`);
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);