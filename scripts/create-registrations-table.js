const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔧 Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTable() {
  console.log('\n📋 Creating registrations table with all fields from the form...\n');

  // Since we can't execute raw SQL via the JS client directly,
  // we'll provide the SQL that needs to be run
  const createTableSQL = `
-- Drop existing table if you want to recreate it (uncomment if needed)
-- DROP TABLE IF EXISTS registrations CASCADE;

-- Create the registrations table with all fields from the form
CREATE TABLE IF NOT EXISTS registrations (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic user information (all required)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  password VARCHAR(255) NOT NULL,

  -- Role information
  role VARCHAR(50) NOT NULL CHECK (role IN ('chartered_accountant', 'Professional', 'Student', 'Other')),

  -- Professional-specific fields (optional, for Professional role)
  professional_type VARCHAR(50),
  membership_no VARCHAR(6),

  -- Student-specific fields (optional, for Student role)
  registration_no VARCHAR(50),
  institute_name VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Ensure unique email and username
  CONSTRAINT unique_email UNIQUE (email),
  CONSTRAINT unique_username UNIQUE (username)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_username ON registrations(username);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_registrations_role ON registrations(role);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public users can insert their own registration" ON registrations;
DROP POLICY IF EXISTS "Service role has full access" ON registrations;
DROP POLICY IF EXISTS "Users can view their own registration" ON registrations;

-- Create RLS policies
-- Allow anyone to insert (register)
CREATE POLICY "Public users can insert their own registration" ON registrations
  FOR INSERT
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role has full access" ON registrations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow users to view their own registration
CREATE POLICY "Users can view their own registration" ON registrations
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON registrations TO service_role;
GRANT INSERT ON registrations TO anon;
GRANT SELECT ON registrations TO authenticated;
`;

  console.log('📄 SQL to create the registrations table:');
  console.log('================================================');
  console.log(createTableSQL);
  console.log('================================================\n');

  // Test if we can access the table
  console.log('🔍 Testing if registrations table exists...');

  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .limit(1);

  if (error && error.message.includes('relation "public.registrations" does not exist')) {
    console.log('\n❌ Table does not exist yet.\n');
    console.log('📝 INSTRUCTIONS TO CREATE THE TABLE:');
    console.log('=====================================');
    console.log('1. Go to your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/sql/new');
    console.log('');
    console.log('2. Copy the SQL above (between the lines)');
    console.log('');
    console.log('3. Paste it in the SQL editor');
    console.log('');
    console.log('4. Click the "Run" button');
    console.log('');
    console.log('5. You should see "Success. No rows returned"');
    console.log('');
    console.log('6. Go to Table Editor to verify:');
    console.log('   https://supabase.com/dashboard/project/gevwzzrztriktdazfbpw/editor');
    console.log('=====================================\n');

    // Save SQL to file for easy access
    const fs = require('fs');
    const path = require('path');
    const sqlFilePath = path.join(__dirname, '..', 'supabase', 'create-registrations-table-complete.sql');

    fs.writeFileSync(sqlFilePath, createTableSQL);
    console.log(`💾 SQL saved to: ${sqlFilePath}`);
    console.log('   You can copy this file content to Supabase SQL editor\n');

  } else if (error) {
    console.log('❓ Unexpected error:', error.message);
  } else {
    console.log('✅ Table already exists!');

    // Get table structure
    const { data: columns, error: columnsError } = await supabase
      .from('registrations')
      .select('*')
      .limit(0);

    if (!columnsError) {
      console.log('\n📊 Current table structure:');
      console.log('Fields in the table:', Object.keys(columns || {}));
    }

    // Count existing records
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📈 Total registrations in table: ${count || 0}`);
    }
  }
}

// Test inserting a sample registration
async function testInsert() {
  console.log('\n🧪 Testing insert into registrations table...');

  const testData = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    phone: '9876543210',
    password: 'TestPass123', // In production, this should be hashed
    role: 'chartered_accountant',
    professional_type: 'CA',
    membership_no: '123456',
    registration_no: null,
    institute_name: null
  };

  const { data, error } = await supabase
    .from('registrations')
    .insert([testData])
    .select();

  if (error) {
    console.log('❌ Insert failed:', error.message);
    if (error.message.includes('relation "public.registrations" does not exist')) {
      console.log('   → Table needs to be created first');
    }
  } else {
    console.log('✅ Test registration inserted successfully!');
    if (data && data[0]) {
      console.log('   ID:', data[0].id);
      console.log('   Name:', data[0].name);
      console.log('   Email:', data[0].email);
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Supabase Registrations Table Setup');
  console.log('==============================================\n');

  await createTable();

  // Only test insert if table exists
  const { error } = await supabase
    .from('registrations')
    .select('id')
    .limit(1);

  if (!error) {
    await testInsert();
  }

  console.log('\n✨ Setup process complete!');
}

main().catch(console.error);