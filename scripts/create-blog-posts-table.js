const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBlogPostsTable() {
  console.log('🚀 Creating blog_posts table...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '035_create_blog_posts_table.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration SQL:');
  console.log('-----------------------------------');
  console.log(sqlContent);
  console.log('-----------------------------------\n');

  // Execute the migration using RPC
  try {
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`[${i + 1}/${statements.length}] Executing statement...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.log(`⚠️  Statement ${i + 1} error: ${error.message}`);
          // Continue with next statement
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error: ${err.message}`);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📝 Note: If there were errors, you may need to run the migration manually in Supabase dashboard:');
    console.log('Go to: https://supabase.com/dashboard → SQL Editor → Paste the migration SQL\n');

    // Test if table was created
    console.log('🔍 Testing blog_posts table...');
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Table test failed:', error.message);
      console.log('\n💡 Please run the migration manually in Supabase dashboard.');
    } else {
      console.log('✅ blog_posts table is ready!');
      console.log(`📊 Current posts count: ${data.length}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Please run the migration manually in Supabase dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard → SQL Editor');
    console.log('2. Paste the SQL from supabase/migrations/035_create_blog_posts_table.sql');
    console.log('3. Click "Run"\n');
  }
}

createBlogPostsTable();
