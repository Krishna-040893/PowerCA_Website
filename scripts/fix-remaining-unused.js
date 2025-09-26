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

// Specific fixes for known issues
const specificFixes = {
  // Fix RazorpayErrorResponse import
  'src/app/api/payment/verify/route.ts': (content) => {
    return content.replace(
      'RazorpayErrorResponse',
      '_RazorpayErrorResponse'
    );
  },
  // Fix unused imports in admin layout
  'src/components/admin/admin-layout-old.tsx': (content) => {
    // Already fixed in previous run
    return content;
  },
  // Fix unused Search and PieChart imports
  'src/components/admin/admin-sidebar-layout.tsx': (content) => {
    content = content.replace(/,?\s*Search(?=\s*[,}])/, '');
    content = content.replace(/,?\s*PieChart(?=\s*[,}])/, '');
    return content;
  }
};

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Apply specific fixes
  const fileName = filePath.replace(/\\/g, '/');
  const relativePath = fileName.substring(fileName.indexOf('src/'));

  if (specificFixes[relativePath]) {
    const newContent = specificFixes[relativePath](content);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  // General fixes
  // 1. Fix unused 'data' assignments
  const dataAssignmentRegex = /const\s+data\s*=\s*await\s+[^;]+;(?!\s*[^}]*\bdata\b)/g;
  let matches = content.match(dataAssignmentRegex);
  if (matches) {
    matches.forEach(match => {
      // Check if data is used after this line
      const index = content.indexOf(match);
      const afterContent = content.substring(index + match.length);

      if (!afterContent.match(/\bdata\b/)) {
        // data is not used, prefix with underscore
        const newMatch = match.replace(/const\s+data\s*=/, 'const _data =');
        content = content.replace(match, newMatch);
        modified = true;
      }
    });
  }

  // 2. Fix unused function parameters like 'order'
  const functionRegex = /async\s+function\s+\w+\s*\(([^)]+)\)/g;
  content = content.replace(functionRegex, (match, params) => {
    // Check for unused params
    const paramList = params.split(',').map(p => p.trim());
    const newParamList = paramList.map(param => {
      const paramName = param.split(':')[0].trim();
      if (paramName === 'order' && !content.includes(`${paramName}.`)) {
        return param.replace(paramName, `_${paramName}`);
      }
      return param;
    });

    if (newParamList.join(', ') !== params) {
      modified = true;
      return match.replace(params, newParamList.join(', '));
    }
    return match;
  });

  // 3. Remove completely unused imports
  const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g;
  content = content.replace(importRegex, (match, imports, source) => {
    // Check if from lucide-react and has unused imports
    if (source.includes('lucide-react')) {
      const importList = imports.split(',').map(i => i.trim());
      const usedImports = [];

      importList.forEach(imp => {
        const importName = imp.includes(' as ')
          ? imp.split(' as ')[1].trim()
          : imp.trim();

        // Check if used in the file (excluding the import line itself)
        const contentWithoutImport = content.replace(match, '');
        const isUsed = contentWithoutImport.includes(importName);

        if (isUsed) {
          usedImports.push(imp);
        }
      });

      if (usedImports.length === 0) {
        modified = true;
        return ''; // Remove entire import
      } else if (usedImports.length < importList.length) {
        modified = true;
        return `import { ${usedImports.join(', ')} } from '${source}'`;
      }
    }

    return match;
  });

  // Clean up multiple empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log(`Fixed: ${path.basename(filePath)}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);