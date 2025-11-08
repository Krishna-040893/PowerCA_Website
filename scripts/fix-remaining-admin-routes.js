const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing remaining admin API routes...\n');

const files = glob.sync('src/app/api/admin/**/*.ts', {
  cwd: process.cwd(),
  absolute: true
});

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('auth.authorized') && !content.includes('auth.error') && !content.includes('auth.admin') && !content.includes('requireAdminAuth(request)')) {
    return;
  }

  const original = content;

  // Fix: requireAdminAuth(request) -> requireAdminAuth()
  content = content.replace(/requireAdminAuth\(request\)/g, 'requireAdminAuth()');

  // Fix: const auth = ... -> const session = ...
  content = content.replace(/const auth = await requireAdminAuth\(\)/g, 'const session = await requireAdminAuth()');

  // Fix: if (!auth.authorized) -> if (!session)
  content = content.replace(/if \(!auth\.authorized\)/g, 'if (!session)');

  // Fix: return auth.error -> return createUnauthorizedResponse()
  content = content.replace(/return auth\.error \|\| NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\)/g, 'return createUnauthorizedResponse()');
  content = content.replace(/return auth\.error/g, 'return createUnauthorizedResponse()');

  // Fix: auth.admin -> session.user
  content = content.replace(/const adminUser = auth\.admin/g, 'const adminUser = session.user');
  content = content.replace(/auth\.admin/g, 'session.user');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files!`);
