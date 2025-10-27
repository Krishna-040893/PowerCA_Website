const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createInvoicesBucket() {
  console.log('🚀 Creating invoices storage bucket...\n');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      console.log('\n📝 Manual setup required:');
      console.log('Go to: Supabase Dashboard > Storage > Create a new bucket');
      console.log('Bucket name: invoices');
      console.log('Public: Yes');
      return;
    }

    const invoicesBucket = buckets.find(b => b.id === 'invoices');

    if (invoicesBucket) {
      console.log('✅ Invoices bucket already exists!');
      console.log('Bucket details:', {
        id: invoicesBucket.id,
        name: invoicesBucket.name,
        public: invoicesBucket.public
      });
      return;
    }

    // Create the bucket
    console.log('📦 Creating invoices bucket...');
    const { data, error } = await supabase.storage.createBucket('invoices', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf']
    });

    if (error) {
      console.error('❌ Error creating bucket:', error.message);
      console.log('\n📝 Manual setup required:');
      console.log('Go to: Supabase Dashboard > Storage > Create a new bucket');
      console.log('Bucket name: invoices');
      console.log('Public: Yes');
      console.log('Allowed MIME types: application/pdf');
      console.log('File size limit: 10MB');
      return;
    }

    console.log('✅ Invoices bucket created successfully!');
    console.log('Bucket:', data);

    // Verify bucket was created
    const { data: verifyBuckets } = await supabase.storage.listBuckets();
    const created = verifyBuckets.find(b => b.id === 'invoices');

    if (created) {
      console.log('\n✅ Verification successful! Bucket is ready to use.');
    } else {
      console.log('\n⚠️  Warning: Could not verify bucket creation');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to: Supabase Dashboard > Storage');
    console.log('2. Click "Create a new bucket"');
    console.log('3. Name: invoices');
    console.log('4. Make it public: Yes');
    console.log('5. Set allowed MIME types: application/pdf');
  }
}

createInvoicesBucket();
