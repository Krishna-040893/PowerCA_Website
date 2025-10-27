// Clear all data from database tables (EXCEPT admin_users)
// WARNING: This will permanently delete all data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Tables to clear (in order - child tables first to avoid foreign key constraints)
const tablesToClear = [
  // Affiliate related (clear child tables first)
  'affiliate_referral_payments',
  'affiliate_referrals',
  'affiliate_customers',
  'affiliate_profiles',
  'affiliate_registrations',
  'affiliate_applications',

  // Payment related
  'payment_orders',
  'subscriptions',
  'payments',

  // Registration related
  'professional_registrations',
  'student_registrations',
  'registration_forms',
  'registrations',

  // Other tables
  'bookings',
  'profiles'

  // NOTE: admin_users is NOT in this list - it will be preserved
];

async function clearDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the following tables:');
  tablesToClear.forEach(table => console.log(`   - ${table}`));
  console.log('\n✓ Preserving: admin_users\n');

  console.log('Starting in 3 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  let successCount = 0;
  let errorCount = 0;

  for (const table of tablesToClear) {
    try {
      console.log(`Clearing ${table}...`);

      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.error(`  ✗ Error clearing ${table}:`, error.message);
        errorCount++;
      } else {
        console.log(`  ✓ ${table} cleared successfully`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ✗ Exception clearing ${table}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Database Clear Summary:');
  console.log('='.repeat(50));
  console.log(`✓ Successfully cleared: ${successCount} tables`);
  console.log(`✗ Errors: ${errorCount} tables`);
  console.log(`✓ Preserved: admin_users table`);
  console.log('='.repeat(50) + '\n');

  // Verify admin_users is still intact
  const { count, error } = await supabase
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  if (!error) {
    console.log(`✓ admin_users verified: ${count} row(s) preserved\n`);
  }

  // Show final row counts
  console.log('Final row counts:');
  for (const table of [...tablesToClear, 'admin_users']) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    console.log(`  ${table}: ${count || 0} rows`);
  }
}

clearDatabase().catch(console.error);
