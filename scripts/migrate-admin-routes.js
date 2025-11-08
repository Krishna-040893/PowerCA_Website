const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔄 Migrating admin API routes to NextAuth...\n');

// Find all admin API route files
const files = glob.sync('src/app/api/admin/**/*.ts', {
  cwd: process.cwd(),
  absolute: true
});

console.log(`Found ${files.length} admin API files to check\n`);

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Skip if already migrated
  if (content.includes('@/lib/auth/admin-session')) {
    console.log(`✓ Already migrated: ${path.relative(process.cwd(), file)}`);
    return;
  }

  // Skip if doesn't use admin auth
  if (!content.includes('requireAdminAuth')) {
    console.log(`⊘ No admin auth: ${path.relative(process.cwd(), file)}`);
    return;
  }

  const original = content;

  // 1. Update import statement
  content = content.replace(
    /import {requireAdminAuth  } from '@\/lib\/admin-auth-helper'/g,
    "import {requireAdminAuth, createUnauthorizedResponse  } from '@/lib/auth/admin-session'"
  );

  // 2. Remove runtime directive if present (NextAuth doesn't need it)
  content = content.replace(/export const runtime = 'nodejs'\n\n/g, '');
  content = content.replace(/export const runtime = 'nodejs'\n/g, '');

  // 3. Update all variations of auth check patterns

  // Pattern 1: with admin user assignment
  content = content.replace(
    /const auth = await requireAdminAuth\(request\)\s*\n\s*if \(!auth\.authorized\) {\s*\n\s*return auth\.error\s*\n\s*}\s*\n\s*(?:\/\/ Admin is authorized, proceed with the request\s*\n\s*)?const adminUser = auth\.admin/g,
    `const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const adminUser = session.user`
  );

  // Pattern 2: without admin user assignment
  content = content.replace(
    /const auth = await requireAdminAuth\(request\)\s*\n\s*if \(!auth\.authorized\) {\s*\n\s*return auth\.error\s*\n\s*}/g,
    `const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }`
  );

  // Pattern 3: Any remaining auth.authorized checks
  content = content.replace(
    /await requireAdminAuth\(request\)/g,
    'await requireAdminAuth()'
  );

  content = content.replace(
    /auth\.authorized/g,
    'session'
  );

  content = content.replace(
    /auth\.error/g,
    'createUnauthorizedResponse()'
  );

  content = content.replace(
    /auth\.admin/g,
    'session.user'
  );

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(process.cwd(), file)}`);
    updatedCount++;
    modified = true;
  }
});

console.log(`\n✨ Migration complete! Updated ${updatedCount} files.`);
