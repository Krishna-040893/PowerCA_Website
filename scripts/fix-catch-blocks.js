#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process
const filesToProcess = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true
});

let totalFixed = 0;
let totalCatchBlocks = 0;

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match catch blocks with unused error variables
  // Match: catch (_error) { ... } where _error is not used in the block
  const catchBlockRegex = /catch\s*\((\s*_[a-zA-Z_]+\s*)\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/g;

  content = content.replace(catchBlockRegex, (match, errorVar, blockContent) => {
    const varName = errorVar.trim();

    // Check if the error variable is used in the block content
    // Look for any reference to the variable
    const isUsed = blockContent.includes(varName);

    if (!isUsed) {
      // Replace catch (_error) with catch {}
      totalCatchBlocks++;
      modified = true;
      return `catch {${blockContent}}`;
    }

    return match;
  });

  // Also handle simpler catch patterns
  const simpleCatchRegex = /catch\s*\(\s*_[a-zA-Z_]+\s*\)\s*{\s*}/g;
  if (content.match(simpleCatchRegex)) {
    content = content.replace(simpleCatchRegex, 'catch { }');
    modified = true;
    totalCatchBlocks++;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log(`Fixed catch blocks in: ${path.basename(filePath)}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log(`Total catch blocks fixed: ${totalCatchBlocks}`);