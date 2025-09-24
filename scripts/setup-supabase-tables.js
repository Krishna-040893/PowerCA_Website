const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createRegistrationsTable() {
  console.log('Testing Supabase connection and registrations table...');

  // Skip RPC and directly test table access
  console.log('\n📋 SQL to create registrations table (run this in Supabase dashboard if table doesn\'t exist):');
  console.log('Go to: https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/sql/new');
  console.log(`
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  professional_type VARCHAR(50),
  membership_no VARCHAR(50),
  registration_no VARCHAR(50),
  institute_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_username ON registrations(username);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Enable all access for service role" ON registrations
  FOR ALL USING (true);
  `);

  // Test if table exists
  console.log('\nTesting if registrations table exists...');
  const { data: testData, error: testError } = await supabase
    .from('registrations')
    .select('*')
    .limit(1);

  if (testError) {
    if (testError.message.includes('table') && testError.message.includes('not')) {
      console.log('❌ Table does not exist. Please create it manually in Supabase dashboard.');
      console.log('\nTo create the table:');
      console.log('1. Go to: https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/sql/new');
      console.log('2. Copy and paste the SQL above');
      console.log('3. Click "Run" to execute the query');
    } else {
      console.log('Error:', testError.message);
    }
  } else {
    console.log('✅ Registrations table exists and is accessible!');

    // Insert a test registration
    console.log('\nInserting test registration...');
    const testReg = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      phone: '1234567890',
      password: 'testpass123',
      role: 'chartered_accountant',
      professional_type: 'CA',
      membership_no: 'CA123456',
      registration_no: 'REG123',
      institute_name: 'Test Institute'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('registrations')
      .insert([testReg])
      .select();

    if (insertError) {
      console.log('❌ Error inserting test data:', insertError.message);
    } else {
      console.log('✅ Test registration inserted successfully!');
      console.log('Inserted data:', insertData[0]);

      // Count total registrations
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      console.log(`\n📊 Total registrations in database: ${count}`);
    }
  }
}

// Run the setup
createRegistrationsTable().catch(console.error);