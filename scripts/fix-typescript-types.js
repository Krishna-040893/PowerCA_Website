const fs = require('fs');
const path = require('path');

// Type definitions for common any types
const typeReplacements = [
  {
    files: ['src/app/admin/registrations/registrations-table.tsx'],
    replacements: [
      { from: 'any[]', to: 'Registration[]' }
    ]
  },
  {
    files: ['src/app/admin/test-dashboard/page.tsx'],
    replacements: [
      { from: ': any', to: ': Record<string, unknown>' }
    ]
  },
  {
    files: ['src/app/affiliate/profile/create/page.tsx'],
    replacements: [
      { from: ': any', to: ': Record<string, unknown>' }
    ]
  },
  {
    files: ['src/app/api/admin/hubspot/contacts/route.ts'],
    replacements: [
      { from: ': any', to: ': HubSpotContact' }
    ]
  },
  {
    files: ['src/app/api/admin/hubspot/status/route.ts'],
    replacements: [
      { from: ': any', to: ': Record<string, unknown>' }
    ]
  },
  {
    files: ['src/app/api/bookings/route.ts', 'src/app/api/bookings/supabase/route.ts'],
    replacements: [
      { from: 'Record<string, any>', to: 'Record<string, string | Date>' }
    ]
  },
  {
    files: ['src/lib/hubspot-service.ts'],
    replacements: [
      { from: ': any', to: ': unknown' }
    ]
  },
  {
    files: ['src/components/sections/bento-features.tsx'],
    replacements: [
      { from: ') => any', to: ') => React.ReactNode' }
    ]
  },
  {
    files: ['src/components/sections/features.tsx'],
    replacements: [
      { from: ': any', to: ': React.ReactNode' }
    ]
  }
];

let totalFixed = 0;

typeReplacements.forEach(({ files, replacements }) => {
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fileFixed = 0;

    replacements.forEach(({ from, to }) => {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, to);
        fileFixed += matches.length;
      }
    });

    if (fileFixed > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ${fileFixed} type issue(s) in ${file}`);
      totalFixed += fileFixed;
    }
  });
});

console.log(`\nTotal type issues fixed: ${totalFixed}`);