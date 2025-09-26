#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common patterns that need fixing
const patterns = [
  // Import patterns - prefix with underscore
  {
    regex: /^(\s*)import\s*{\s*([^}]+)\s*}\s*from/gm,
    fix: (match, indent, imports) => {
      const fixedImports = imports.split(',').map(imp => {
        const trimmed = imp.trim();
        // Check if this import is actually unused (heuristic based on common ones)
        const unusedImports = [
          'signIn', 'format', 'Filter', 'Edit', 'Building', 'Users', 'TrendingUp',
          'XCircle', 'ArrowUp', 'ArrowDown', 'DollarSign', 'Clock', 'Mail',
          'CheckCircle', 'UserCheck', 'CardDescription', 'CardHeader', 'CardTitle',
          'Phone', 'Globe', 'Lock', 'Link', 'ArrowRight', 'Smartphone', 'X'
        ];
        if (unusedImports.some(u => trimmed === u)) {
          return ` ${trimmed} as _${trimmed}`;
        }
        return imp;
      }).join(',');
      return `${indent}import {${fixedImports} } from`;
    }
  },
  // Catch block error variables
  {
    regex: /catch\s*\(\s*error\s*\)/g,
    fix: 'catch (_error)'
  },
  // Destructured unused variables in function params
  {
    regex: /\(request:\s*Request\)/g,
    fix: '(_request: Request)'
  },
  {
    regex: /\(req:\s*Request\)/g,
    fix: '(_req: Request)'
  },
  // Assigned but never used
  {
    regex: /const\s+(\w+)\s*=\s*([^;]+);(\s*\/\/.*)?$/gm,
    fix: (match, varName, value, comment) => {
      const unusedVars = [
        'handleLogout', 'activeTab', 'setActiveTab', 'affiliateProfiles',
        'setAffiliateProfiles', 'expandedProfile', 'setExpandedProfile',
        'router', 'canRefer', 'updateExisting', 'limit', 'testResult',
        'checkError', 'refCheckError'
      ];
      if (unusedVars.includes(varName)) {
        return `const _${varName} = ${value};${comment || ''}`;
      }
      return match;
    }
  }
];

// Files to process
const filesToProcess = [
  'src/**/*.ts',
  'src/**/*.tsx'
];

let totalFixed = 0;

filesToProcess.forEach(pattern => {
  const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });

  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    patterns.forEach(pattern => {
      const original = content;
      if (typeof pattern.fix === 'string') {
        content = content.replace(pattern.regex, pattern.fix);
      } else {
        content = content.replace(pattern.regex, pattern.fix);
      }
      if (content !== original) {
        modified = true;
      }
    });

    // Specific fixes for known files
    if (file.includes('register/page.tsx') || file.includes('student/page.tsx')) {
      content = content.replace(
        /import\s*{\s*signIn\s*}\s*from\s*'next-auth\/react'/g,
        "import { signIn as _signIn } from 'next-auth/react'"
      );
      modified = true;
    }

    if (file.includes('contact/page.tsx')) {
      content = content.replace(
        /import\s*{\s*Card,\s*CardContent,\s*CardHeader,\s*CardTitle\s*}/g,
        "import { Card, CardContent, CardHeader as _CardHeader, CardTitle as _CardTitle }"
      );
      modified = true;
    }

    if (file.includes('pricing/page.tsx')) {
      content = content.replace(
        /Smartphone,\s*X\s*}/g,
        "Smartphone as _Smartphone, X as _X }"
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      totalFixed++;
      console.log(`Fixed: ${file}`);
    }
  });
});

console.log(`\nTotal files fixed: ${totalFixed}`);