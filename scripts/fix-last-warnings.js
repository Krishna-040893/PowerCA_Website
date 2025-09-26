#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Final fixes
const fixes = [
  {
    file: 'src/app/api/admin/hubspot/status/route.ts',
    line: 62,
    fix: (content) => {
      // Replace catch (_error) at line 62
      return content.replace(/} catch \(_error\) {/, '} catch {');
    }
  },
  {
    file: 'src/app/api/bookings/route.ts',
    line: 94,
    fix: (content) => {
      // Replace _fetchError
      return content.replace(/} catch \(_fetchError\) {/, '} catch {');
    }
  },
  {
    file: 'src/app/api/bookings/supabase/route.ts',
    line: 94,
    fix: (content) => {
      // Replace _fetchError
      return content.replace(/} catch \(_fetchError\) {/, '} catch {');
    }
  },
  {
    file: 'src/components/demo-booking.tsx',
    line: 88,
    fix: (content) => {
      // Replace const response with const _response
      const lines = content.split('\n');
      if (lines[87]) { // Line 88 is index 87
        lines[87] = lines[87].replace('const response', 'const _response');
      }
      return lines.join('\n');
    }
  },
  {
    file: 'src/templates/admin-page-template.tsx',
    line: 14,
    fix: (content) => {
      // Replace const data with const _data
      const lines = content.split('\n');
      if (lines[13]) { // Line 14 is index 13
        lines[13] = lines[13].replace('const data', 'const _data');
      }
      return lines.join('\n');
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
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Done!');