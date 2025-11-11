/**
 * PowerCA - Clear Test Data Script
 *
 * This script safely deletes all test data from Supabase tables
 * while preserving table structures and constraints.
 *
 * Usage: node scripts/clear-test-data.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tables to clear (in order)
const tables = [
  'affiliate_referrals',
  'affiliate_customers',
  'affiliate_payments',
  'affiliate_profiles',
  'affiliate_registrations',
  'payment_orders',
  'payments',
  'subscriptions',
  'professional_registrations',
  'student_registrations',
  'registration_forms',
  'registrations',
  'contacts',
  'newsletter_subscribers',
  'renewal_notifications',
  'blog_posts',
  'monitoring_events',
  'admin_users'
];

/**
 * Ask for user confirmation
 */
function askConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DELETE ALL DATA from the following tables:\n' +
      tables.map(t => `   - ${t}`).join('\n') +
      '\n\n❓ Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

/**
 * Get row count for a table
 */
async function getRowCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Table might not exist, return 0
      return 0;
    }

    return count || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Clear data from a table
 */
async function clearTable(tableName) {
  try {
    const rowCount = await getRowCount(tableName);

    if (rowCount === 0) {
      console.log(`⏭️  ${tableName}: No data to clear`);
      return { success: true, deleted: 0 };
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error(`❌ Error clearing ${tableName}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${tableName}: Cleared ${rowCount} rows`);
    return { success: true, deleted: rowCount };
  } catch (error) {
    console.error(`❌ Error clearing ${tableName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🗑️  PowerCA Test Data Cleanup Tool\n');
  console.log(`📊 Database: ${supabaseUrl}`);
  console.log(`📋 Tables to clear: ${tables.length}\n`);

  // Ask for confirmation
  const confirmed = await askConfirmation();

  if (!confirmed) {
    console.log('\n❌ Operation cancelled by user.');
    process.exit(0);
  }

  console.log('\n🚀 Starting cleanup process...\n');

  let totalDeleted = 0;
  let successCount = 0;
  let errorCount = 0;

  // Clear each table
  for (const table of tables) {
    const result = await clearTable(table);

    if (result.success) {
      successCount++;
      totalDeleted += result.deleted || 0;
    } else {
      errorCount++;
    }
  }

  // Display summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Cleanup Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully cleared: ${successCount} tables`);
  console.log(`❌ Errors: ${errorCount} tables`);
  console.log(`🗑️  Total rows deleted: ${totalDeleted}`);
  console.log('='.repeat(50) + '\n');

  if (errorCount === 0) {
    console.log('✨ All test data has been cleared successfully!');
  } else {
    console.log('⚠️  Some tables encountered errors. Please check the logs above.');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
