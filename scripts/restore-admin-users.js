/**
 * PowerCA - Restore Default Admin Users
 *
 * This script restores the default admin accounts:
 * - Superadmin account
 * - PCAadmin account
 *
 * Usage: node scripts/restore-admin-users.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default admin accounts
const adminAccounts = [
  {
    username: 'superadmin',
    email: 'superadmin@powerca.in',
    password: 'Powerca@25'
  },
  {
    username: 'PCAadmin',
    email: 'admin@powerca.in',
    password: 'Powerca@25'
  }
];

async function restoreAdminUsers() {
  console.log('🔐 PowerCA - Restore Default Admin Users\n');
  console.log(`📊 Database: ${supabaseUrl}\n`);
  console.log('👤 Creating admin accounts...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const admin of adminAccounts) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Insert admin user
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          {
            username: admin.username,
            email: admin.email,
            password_hash: hashedPassword,
            is_active: true
          }
        ])
        .select();

      if (error) {
        console.error(`❌ Error creating ${admin.username}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Created: ${admin.username} (${admin.email})`);
        console.log(`   Password: ${admin.password}\n`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error creating ${admin.username}:`, error.message);
      errorCount++;
    }
  }

  // Display summary
  console.log('='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully created: ${successCount} admin accounts`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  if (successCount > 0) {
    console.log('🎉 Default admin accounts restored successfully!');
    console.log('\n📝 Login Details:');
    console.log('   URL: http://localhost:3009/admin-login');
    console.log('\n   Superadmin:');
    console.log('   - Username: superadmin');
    console.log('   - Password: Powerca@25');
    console.log('\n   Admin:');
    console.log('   - Username: PCAadmin');
    console.log('   - Password: Powerca@25');
  }
}

// Run the script
restoreAdminUsers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
