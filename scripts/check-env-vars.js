// Check if all required environment variables are set
// Run this locally: node scripts/check-env-vars.js

require('dotenv').config({ path: '.env.local' });

const requiredVars = {
  // NextAuth
  'NEXTAUTH_URL': 'NextAuth base URL',
  'NEXTAUTH_SECRET': 'NextAuth encryption secret',

  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',

  // Razorpay
  'RAZORPAY_KEY_ID': 'Razorpay API key',
  'RAZORPAY_KEY_SECRET': 'Razorpay secret key',

  // Email (Resend)
  'RESEND_API_KEY': 'Resend API key',
  'EMAIL_FROM': 'Sender email address',
};

const optionalVars = {
  'RAZORPAY_WEBHOOK_SECRET': 'Razorpay webhook secret',
  'NEXT_PUBLIC_GA_ID': 'Google Analytics ID',
  'GOOGLE_CLIENT_ID': 'Google OAuth client ID',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth secret',
};

console.log('\n📋 ENVIRONMENT VARIABLES CHECK\n');
console.log('════════════════════════════════════════════════════════\n');

let missingCount = 0;
let setCount = 0;

console.log('✅ REQUIRED VARIABLES:\n');
Object.entries(requiredVars).forEach(([key, description]) => {
  const value = process.env[key];
  const isSet = value && value.length > 0 && value !== 'your-value-here';

  if (isSet) {
    console.log(`  ✓ ${key}`);
    console.log(`    ${description}`);
    console.log(`    Value: ${key.includes('SECRET') || key.includes('KEY') ? '***' + value.slice(-4) : value}\n`);
    setCount++;
  } else {
    console.log(`  ✗ ${key} - MISSING!`);
    console.log(`    ${description}\n`);
    missingCount++;
  }
});

console.log('\n⚙️  OPTIONAL VARIABLES:\n');
Object.entries(optionalVars).forEach(([key, description]) => {
  const value = process.env[key];
  const isSet = value && value.length > 0 && value !== 'your-value-here';

  if (isSet) {
    console.log(`  ✓ ${key}`);
    console.log(`    ${description}`);
    console.log(`    Value: ${key.includes('SECRET') || key.includes('KEY') ? '***' + value.slice(-4) : value}\n`);
  } else {
    console.log(`  ○ ${key} - Not set (optional)`);
    console.log(`    ${description}\n`);
  }
});

console.log('════════════════════════════════════════════════════════\n');
console.log(`📊 SUMMARY:\n`);
console.log(`  Required Variables: ${setCount}/${Object.keys(requiredVars).length} set`);
console.log(`  Missing Variables: ${missingCount}\n`);

if (missingCount > 0) {
  console.log('⚠️  WARNING: You have missing required variables!');
  console.log('   Your application may not work correctly.\n');
  console.log('   For Vercel deployment, set these in:');
  console.log('   Dashboard → Settings → Environment Variables\n');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!\n');
  console.log('   For Vercel deployment, make sure to set these in:');
  console.log('   Dashboard → Settings → Environment Variables\n');
  console.log('   Remember to update NEXTAUTH_URL to your production domain!\n');
}
