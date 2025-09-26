const fs = require('fs');
const path = require('path');

// Map of specific files and fixes
const specificFixes = [
  {
    file: 'src/app/(marketing)/pricing/page.tsx',
    fixes: [
      { from: 'import { RazorpayErrorResponse }', to: 'import { RazorpayErrorResponse as _RazorpayErrorResponse }' }
    ]
  },
  {
    file: 'src/app/affiliate/account/page.tsx',
    fixes: [
      { from: 'const referralLink =', to: 'const _referralLink =' }
    ]
  },
  {
    file: 'src/app/api/bookings/simple-route.ts',
    fixes: [
      { from: 'const { _name, _email, _phone, _firmName, date, time, _message }', to: 'const { date, time }' }
    ]
  },
  {
    file: 'src/app/api/bookings/supabase/route.ts',
    fixes: [
      { from: 'const customerEmailResult =', to: 'const _customerEmailResult =' },
      { from: 'const teamEmailResult =', to: 'const _teamEmailResult =' }
    ]
  },
  {
    file: 'src/app/api/payment/webhook/route.ts',
    fixes: [
      { from: 'async function handlePaymentSuccess(order:', to: 'async function handlePaymentSuccess(_order:' }
    ]
  },
  {
    file: 'src/templates/admin-page-template.tsx',
    fixes: [
      { from: 'const { data }', to: 'const { _data }' }
    ]
  },
  {
    file: 'src/app/api/admin/auth/logout/route.ts',
    fixes: [
      { from: 'export async function POST(request: Request)', to: 'export async function POST(_request: Request)' }
    ]
  },
  {
    file: 'src/app/api/affiliate/details/route.ts',
    fixes: [
      { from: 'export async function GET(request: Request)', to: 'export async function GET(_request: Request)' }
    ]
  },
  {
    file: 'src/app/api/affiliate/generate-id/route.ts',
    fixes: [
      { from: 'export async function POST(request: Request)', to: 'export async function POST(_request: Request)' }
    ]
  },
  {
    file: 'src/app/api/affiliate/profile/route.ts',
    fixes: [
      { from: 'export async function GET(request: Request)', to: 'export async function GET(_request: Request)' }
    ]
  },
  {
    file: 'src/app/api/affiliate/referral-status/route.ts',
    fixes: [
      { from: 'export async function GET(req: Request)', to: 'export async function GET(_req: Request)' }
    ]
  },
  {
    file: 'src/app/api/affiliate/referrals/route.ts',
    fixes: [
      { from: 'export async function GET(request: Request)', to: 'export async function GET(_request: Request)' },
      { from: 'referral_source,', to: 'referral_source: _referral_source,' }
    ]
  }
];

let totalFixed = 0;

specificFixes.forEach(({ file, fixes }) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  fixes.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(from, to);
      fileFixed++;
    }
  });

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${fileFixed} issue(s) in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\nTotal issues fixed: ${totalFixed}`);