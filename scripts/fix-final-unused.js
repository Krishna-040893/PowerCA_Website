#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Specific files to fix
const fixes = [
  {
    file: 'src/app/api/payment/verify/route.ts',
    fix: (content) => {
      // Fix RazorpayErrorResponse
      return content.replace('RazorpayErrorResponse', '_RazorpayErrorResponse');
    }
  },
  {
    file: 'src/app/api/payment/webhook/route.ts',
    fix: (content) => {
      // Fix order parameter
      return content.replace(/\(order:/g, '(_order:');
    }
  },
  {
    file: 'src/app/api/admin/hubspot/status/route.ts',
    fix: (content) => {
      // Fix response variable
      return content.replace(/const response = /g, 'const _response = ');
    }
  },
  {
    file: 'src/lib/admin-auth-helper.ts',
    fix: (content) => {
      // Fix _error in catch
      return content.replace(/catch\s*\(\s*_error\s*\)/, 'catch');
    }
  },
  {
    file: 'src/templates/admin-page-template.tsx',
    fix: (content) => {
      // Fix data variable
      return content.replace(/const data = /g, 'const _data = ');
    }
  },
  {
    file: 'src/app/api/affiliate/details/route.ts',
    fix: (content) => {
      // Fix _fetchError
      return content.replace(/_fetchError/g, '_err');
    }
  },
  {
    file: 'src/app/api/affiliate/user-info/route.ts',
    fix: (content) => {
      // Fix _fetchError
      return content.replace(/_fetchError/g, '_err');
    }
  }
];

fixes.forEach(({ file, fix }) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = fix(content);
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Fixed: ${file}`);
    }
  }
});

console.log('Done!');