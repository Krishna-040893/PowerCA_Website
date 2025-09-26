#!/usr/bin/env node

/**
 * Script to automatically fix common 'any' type patterns
 * Run: node scripts/fix-any-types.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Common type replacements
const TYPE_REPLACEMENTS = {
  // Error handling
  'catch (error: any)': 'catch (error)',
  'catch(error: any)': 'catch(error)',

  // Event handlers
  '(e: any)': '(e: React.ChangeEvent<HTMLInputElement>)',
  '(event: any)': '(event: React.MouseEvent<HTMLButtonElement>)',

  // API responses
  '.map((item: any)': '.map((item)',
  '.find((u: any)': '.find((u)',
  '.filter((item: any)': '.filter((item)',

  // Form data
  '(data: any)': '(data: Record<string, unknown>)',
  '(values: any)': '(values: Record<string, unknown>)',
}

// Files to process
const API_ROUTES = [
  'src/app/api/admin/clear-test-data/route.ts',
  'src/app/api/admin/hubspot/contacts/route.ts',
  'src/app/api/admin/hubspot/status/route.ts',
  'src/app/api/admin/test-payments/route.ts',
  'src/app/api/admin/test-referrals/route.ts',
  'src/app/api/affiliate/check-referral-limit/route.ts',
  'src/app/api/affiliate/referral-status/route.ts',
]

function fixErrorHandling(content) {
  // Fix error handling in catch blocks
  content = content.replace(/catch\s*\(\s*error\s*:\s*any\s*\)/g, 'catch (error)')

  // Add type assertion where error is used
  content = content.replace(
    /return createErrorResponse\(\s*ErrorType\.\w+,\s*error,/g,
    'return createErrorResponse(\n      ErrorType.$1,\n      error as Error,'
  )

  return content
}

function fixArrayMethods(content) {
  // Fix array method callbacks
  content = content.replace(/\.map\(\((\w+):\s*any\)/g, '.map(($1)')
  content = content.replace(/\.filter\(\((\w+):\s*any\)/g, '.filter(($1)')
  content = content.replace(/\.find\(\((\w+):\s*any\)/g, '.find(($1)')
  content = content.replace(/\.forEach\(\((\w+):\s*any\)/g, '.forEach(($1)')
  content = content.replace(/\.reduce\(\((\w+):\s*any,\s*(\w+):\s*any\)/g, '.reduce(($1, $2)')

  return content
}

function addTypeImports(content, filePath) {
  // Check if types are already imported
  if (!content.includes("import type") && !content.includes("@/types/api")) {
    // Find the last import statement
    const importMatch = content.match(/(^import[\s\S]*?)\n\n/m)
    if (importMatch && filePath.includes('/api/')) {
      content = content.replace(
        importMatch[0],
        `${importMatch[1]}\nimport type { ApiResponse, ApiError, DatabaseUpdateData } from '@/types/api'\n\n`
      )
    }
  }
  return content
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8')
    const originalContent = content

    // Apply fixes
    content = fixErrorHandling(content)
    content = fixArrayMethods(content)
    content = addTypeImports(content, filePath)

    // Apply direct replacements
    for (const [pattern, replacement] of Object.entries(TYPE_REPLACEMENTS)) {
      content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
    }

    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content)
      console.log(`✅ Fixed: ${path.basename(filePath)}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
    return false
  }
}

function findAnyTypes() {
  console.log('🔍 Finding files with "any" types...\n')

  const result = execSync('grep -r ": any" src --include="*.ts" --include="*.tsx" -l', {
    encoding: 'utf-8',
    stdio: 'pipe'
  }).trim()

  return result.split('\n').filter(Boolean)
}

function main() {
  console.log('🚀 Starting to fix "any" types...\n')

  let totalFixed = 0

  // Fix known API routes
  console.log('📁 Processing API routes...')
  for (const file of API_ROUTES) {
    if (fs.existsSync(file)) {
      if (processFile(file)) {
        totalFixed++
      }
    }
  }

  // Find and process other files
  console.log('\n📁 Finding other files with "any" types...')
  try {
    const files = findAnyTypes()
    console.log(`Found ${files.length} files with "any" types\n`)

    for (const file of files) {
      if (!API_ROUTES.includes(file) && !file.includes('node_modules')) {
        if (processFile(file)) {
          totalFixed++
        }
      }
    }
  } catch (error) {
    console.log('No more files with obvious "any" types found')
  }

  console.log(`\n✨ Fixed ${totalFixed} files!`)

  // Run type check
  console.log('\n🔧 Running TypeScript check...')
  try {
    execSync('npm run typecheck', { stdio: 'inherit' })
    console.log('✅ TypeScript compilation successful!')
  } catch (error) {
    console.log('⚠️ TypeScript has some issues - review manually')
  }

  // Show remaining any types
  console.log('\n📊 Checking remaining "any" types...')
  try {
    const remaining = execSync('npm run lint 2>&1 | grep "no-explicit-any" | wc -l', {
      encoding: 'utf-8',
      shell: true
    }).trim()
    console.log(`Remaining "any" warnings: ${remaining}`)
  } catch (error) {
    console.log('Could not count remaining warnings')
  }
}

if (require.main === module) {
  main()
}