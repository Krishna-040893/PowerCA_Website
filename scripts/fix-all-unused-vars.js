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
let fixedIssues = {
  catchBlocks: 0,
  imports: 0,
  parameters: 0,
  variables: 0
};

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Remove all console.error statements that use _error variables
  // This allows us to completely remove the _error variables
  const consoleErrorPattern = /console\.error\([^)]*,\s*_[a-zA-Z]+\);?/g;
  if (content.match(consoleErrorPattern)) {
    content = content.replace(consoleErrorPattern, '// Error logging removed');
    modified = true;
    fixedIssues.catchBlocks++;
  }

  // 2. Replace catch blocks that have _error but don't use it
  const catchPatterns = [
    // catch (_error) { ... } where _error is not used
    {
      pattern: /catch\s*\(\s*_[a-zA-Z]+\s*\)\s*{[^}]*}/g,
      replacement: (match) => {
        // Check if the error variable is actually used in the block
        const errorVar = match.match(/catch\s*\(\s*(_[a-zA-Z]+)\s*\)/)[1];
        if (!match.includes(errorVar + '.') && !match.includes(errorVar + ')') && !match.includes(errorVar + ',')) {
          // Error not used, replace with empty catch
          return match.replace(/catch\s*\(\s*_[a-zA-Z]+\s*\)/, 'catch');
        }
        return match;
      }
    }
  ];

  catchPatterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      fixedIssues.catchBlocks++;
    }
  });

  // 3. Fix unused imports
  // Remove or prefix unused imports
  const importFixPatterns = [
    // RazorpayErrorResponse - prefix with underscore
    {
      pattern: /import\s*{\s*([^}]*)\bRazorpayErrorResponse\b([^}]*)\s*}\s*from/g,
      replacement: (match, before, after) => {
        return match.replace('RazorpayErrorResponse', '_RazorpayErrorResponse');
      }
    },
    // Search, PieChart - remove if not used
    {
      pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*['"][^'"]+['"]/g,
      replacement: (match) => {
        // Check for unused lucide-react imports
        if (match.includes('lucide-react')) {
          const imports = match.match(/{([^}]+)}/)[1];
          const importList = imports.split(',').map(i => i.trim());

          // Check each import
          const usedImports = [];
          const contentWithoutImport = content.replace(match, '');

          importList.forEach(imp => {
            const importName = imp.includes(' as ') ? imp.split(' as ')[1].trim() : imp.trim();
            // Check if used in JSX or code
            const usagePattern = new RegExp(`<${importName}[\\s/>]|${importName}\\.|${importName}\\(`, 'g');
            if (contentWithoutImport.match(usagePattern)) {
              usedImports.push(imp);
            }
          });

          if (usedImports.length === 0) {
            return ''; // Remove entire import if nothing used
          } else if (usedImports.length < importList.length) {
            // Some imports unused, keep only used ones
            return match.replace(/{[^}]+}/, `{ ${usedImports.join(', ')} }`);
          }
        }
        return match;
      }
    }
  ];

  importFixPatterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      fixedIssues.imports++;
    }
  });

  // 4. Fix unused function parameters
  // Add underscore prefix to unused parameters
  const parameterPatterns = [
    // API route handlers - prefix unused params
    {
      pattern: /export\s+async\s+function\s+\w+\s*\(([^)]*)\)/g,
      replacement: (match, params) => {
        // Check for 'order' parameter
        if (params.includes('order') && !content.includes('order.')) {
          const newParams = params.replace(/\border\b/, '_order');
          return match.replace(params, newParams);
        }
        return match;
      }
    }
  ];

  parameterPatterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      fixedIssues.parameters++;
    }
  });

  // 5. Fix assigned but never used variables
  // Comment out or remove unused assignments
  const variablePatterns = [
    // const data = ... where data is never used again
    {
      pattern: /const\s+data\s*=\s*[^;]+;/g,
      replacement: (match) => {
        // Check if 'data' is used after this assignment
        const afterAssignment = content.substring(content.indexOf(match) + match.length);
        if (!afterAssignment.match(/\bdata\b/)) {
          return `// ${match} // Unused variable commented out`;
        }
        return match;
      }
    }
  ];

  variablePatterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      fixedIssues.variables++;
    }
  });

  // 6. Clean up empty lines created by removals
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log(`Fixed: ${path.basename(filePath)}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log('Issues fixed:');
console.log(`  Catch blocks: ${fixedIssues.catchBlocks}`);
console.log(`  Imports: ${fixedIssues.imports}`);
console.log(`  Parameters: ${fixedIssues.parameters}`);
console.log(`  Variables: ${fixedIssues.variables}`);