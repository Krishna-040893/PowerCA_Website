/**
 * PowerCA - Update Email Addresses Script
 *
 * This script updates all occurrences of support@powerca.in and noreply@powerca.in
 * to contact@powerca.in throughout the codebase.
 *
 * Usage: node scripts/update-email-addresses.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const filesToUpdate = [
  'src/app/api/auth/forgot-password/route.ts',
  'src/lib/invoice-generator.ts',
  'src/app/Contact page/components/ContactForm.tsx',
  'src/app/(marketing)/contact/page.tsx',
  'src/components/layout/footer.tsx',
  'src/lib/email-templates/payment-confirmation.tsx',
  'src/lib/invoice-tbs-template.ts',
  'src/app/payment-failed/page.tsx',
  'src/app/Contact page/imports/ContactPage.tsx',
  'src/app/Pricing Page/imports/PricingPage.tsx'
];

let totalReplacements = 0;
let filesUpdated = 0;

console.log('🔄 PowerCA Email Address Update Script\n');
console.log('Updating all email addresses to contact@powerca.in...\n');

for (const filePath of filesToUpdate) {
  const fullPath = join(projectRoot, filePath);

  try {
    let content = readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;

    // Replace support@powerca.in with contact@powerca.in
    const supportMatches = (content.match(/support@powerca\.in/g) || []).length;
    content = content.replace(/support@powerca\.in/g, 'contact@powerca.in');
    fileReplacements += supportMatches;

    // Only write if content changed
    if (content !== originalContent) {
      writeFileSync(fullPath, content, 'utf8');
      filesUpdated++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${filePath}`);
      console.log(`   Replaced ${fileReplacements} occurrence(s)\n`);
    } else {
      console.log(`⏭️  ${filePath} - Already up to date\n`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('='.repeat(50));
console.log('📊 Summary');
console.log('='.repeat(50));
console.log(`✅ Files updated: ${filesUpdated}`);
console.log(`🔄 Total replacements: ${totalReplacements}`);
console.log('='.repeat(50) + '\n');

if (filesUpdated > 0) {
  console.log('✨ Email addresses updated successfully!');
  console.log('\n📝 Next Steps:');
  console.log('1. Review the changes');
  console.log('2. Test email functionality');
  console.log('3. Configure Resend to receive emails at contact@powerca.in');
} else {
  console.log('✅ All files already up to date!');
}
