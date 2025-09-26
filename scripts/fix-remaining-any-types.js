const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/app/api/admin/hubspot/status/route.ts',
    replacements: [
      { from: 'catch (error: any)', to: 'catch (error)' }
    ]
  },
  {
    file: 'src/app/api/bookings/route.ts',
    replacements: [
      { from: 'Record<string, any>', to: 'Record<string, string | Date>' }
    ]
  },
  {
    file: 'src/app/api/bookings/supabase/route.ts',
    replacements: [
      { from: 'Record<string, any>', to: 'Record<string, string | Date>' }
    ]
  },
  {
    file: 'src/app/api/debug/registrations/route.ts',
    replacements: [
      { from: ': any', to: ': unknown' }
    ]
  },
  {
    file: 'src/app/api/test/check-referral/route.ts',
    replacements: [
      { from: ': any', to: ': unknown' }
    ]
  },
  {
    file: 'src/components/admin/admin-dashboard.tsx',
    replacements: [
      { from: ': any', to: ': React.ReactNode' }
    ]
  },
  {
    file: 'src/components/admin/admin-layout-old.tsx',
    replacements: [
      { from: ': any', to: ': React.ReactNode' }
    ]
  },
  {
    file: 'src/components/admin/admin-layout.tsx',
    replacements: [
      { from: ': any', to: ': React.ReactNode' }
    ]
  },
  {
    file: 'src/components/admin/EnhancedLeadInsights.tsx',
    replacements: [
      { from: ': any', to: ': HubSpotContact' }
    ]
  },
  {
    file: 'src/components/sections/bento-features.tsx',
    replacements: [
      { from: ': any', to: ': React.ReactNode' }
    ]
  },
  {
    file: 'src/components/seo/SEO.tsx',
    replacements: [
      { from: ': any', to: ': Record<string, string>' }
    ]
  },
  {
    file: 'src/lib/hubspot-service.ts',
    replacements: [
      { from: ': any', to: ': unknown' }
    ]
  }
];

let totalFixed = 0;

fixes.forEach(({ file, replacements }) => {
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
    console.log(`✓ Fixed ${fileFixed} any type(s) in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\nTotal any types fixed: ${totalFixed}`);