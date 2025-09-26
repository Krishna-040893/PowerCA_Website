const fs = require('fs');
const path = require('path');

// List of files with unused error variables from lint output
const filesToFix = [
  'src/app/(auth)/register/page.tsx',
  'src/app/(auth)/register/student/page.tsx',
  'src/app/(marketing)/contact/page.tsx',
  'src/app/(marketing)/pricing/page.tsx',
  'src/app/admin/registrations/registrations-table.tsx',
  'src/app/affiliate/account/page.tsx',
  'src/app/affiliate/profile/create/page.tsx',
  'src/app/api/admin/bookings/[id]/route.ts',
  'src/app/api/admin/promote-affiliate/route.ts',
  'src/app/api/affiliate/create-referral/route.ts',
  'src/app/api/affiliate/details/route.ts',
  'src/app/api/affiliate/track-referral/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/booking/route.ts',
  'src/app/api/bookings/route.ts',
  'src/app/api/bookings/simple-route.ts',
  'src/app/api/bookings/simple/route.ts',
  'src/app/api/bookings/supabase/route.ts',
  'src/app/api/email/route.ts',
  'src/app/api/payment/webhook/route.ts',
  'src/app/api/registrations/route.ts',
  'src/components/admin/admin-layout.tsx',
  'src/components/admin/admin-login.tsx',
  'src/lib/hubspot-service.ts',
  'src/lib/resend.ts',
  'src/middleware.ts',
];

// Patterns to fix
const patterns = [
  // catch (error) -> catch (_error)
  { pattern: /catch\s*\(\s*error\s*\)/g, replacement: 'catch (_error)' },
  // catch (e) -> catch (_e)
  { pattern: /catch\s*\(\s*e\s*\)/g, replacement: 'catch (_e)' },
  // } catch (fetchError) -> } catch (_fetchError)
  { pattern: /catch\s*\(\s*fetchError\s*\)/g, replacement: 'catch (_fetchError)' },
  { pattern: /catch\s*\(\s*testError\s*\)/g, replacement: 'catch (_testError)' },
  { pattern: /catch\s*\(\s*refError\s*\)/g, replacement: 'catch (_refError)' },
  { pattern: /catch\s*\(\s*profileError\s*\)/g, replacement: 'catch (_profileError)' },
];

let totalFixed = 0;

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileFixed = 0;

  patterns.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileFixed += matches.length;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${fileFixed} issues in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\nTotal issues fixed: ${totalFixed}`);