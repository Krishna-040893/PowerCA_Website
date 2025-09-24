// Check the actual columns in registrations table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableColumns() {
  console.log('Checking registrations table columns...\n');

  // Try to fetch one row to see the structure
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching table:', error);

    // Try to get table info another way
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'registrations' })
      .catch(() => ({ data: null, error: 'RPC not available' }));

    if (tableInfo) {
      console.log('Table columns:', tableInfo);
    }
  } else {
    if (data && data.length > 0) {
      console.log('Columns found in registrations table:');
      console.log(Object.keys(data[0]));
      console.log('\nSample data structure:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('Table exists but is empty. Trying to insert minimal data to check columns...');

      // Try minimal insert to see what columns are required
      const testData = {
        name: 'Test',
        email: `test${Date.now()}@test.com`,
        username: `test${Date.now()}`,
        phone: '1234567890',
        role: 'Student'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('registrations')
        .insert([testData])
        .select();

      if (insertError) {
        console.log('\nMinimal insert failed with:', insertError.message);
        console.log('This gives us hints about required columns.');
      } else {
        console.log('\nMinimal insert succeeded! Columns that work:');
        console.log(Object.keys(testData));

        // Clean up test data
        if (insertData && insertData[0]) {
          await supabase
            .from('registrations')
            .delete()
            .eq('id', insertData[0].id);
        }
      }
    }
  }
}

checkTableColumns();