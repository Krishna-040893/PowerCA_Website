// Check all tables in Supabase database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('Checking database tables...\n');

    // Query to get all tables in the public schema
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

    if (error) {
      // Try alternative method
      console.log('Trying alternative method to get tables...\n');

      // List of expected tables based on migrations
      const expectedTables = [
        'profiles',
        'bookings',
        'registrations',
        'registration_forms',
        'professional_registrations',
        'student_registrations',
        'payments',
        'payment_orders',
        'subscriptions',
        'admin_users',
        'affiliate_applications',
        'affiliate_registrations',
        'affiliate_profiles',
        'affiliate_customers',
        'affiliate_referrals',
        'affiliate_referral_payments'
      ];

      console.log('Expected tables based on migrations:');
      for (const table of expectedTables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`✓ ${table} - ${count} rows`);
        } else {
          console.log(`✗ ${table} - Does not exist or error: ${error.message}`);
        }
      }
    } else {
      console.log('Found tables:');
      data.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTables();
