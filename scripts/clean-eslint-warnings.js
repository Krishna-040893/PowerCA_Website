#!/usr/bin/env node

/**
 * Automated ESLint Warning Cleanup Script
 * Run: node scripts/clean-eslint-warnings.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' })
    return output
  } catch (error) {
    if (!silent) {
      log(`Error running command: ${command}`, 'red')
    }
    return null
  }
}

// Main cleanup functions
function getWarningCount() {
  const output = runCommand('npm run lint 2>&1 | tail -5', true)
  if (output) {
    const match = output.match(/(\d+) problems/)
    return match ? parseInt(match[1]) : 0
  }
  return 0
}

function fixAutoFixableIssues() {
  log('\n🔧 Running auto-fix for all fixable issues...', 'blue')
  runCommand('npm run lint:fix')
  log('✅ Auto-fix complete!', 'green')
}

function findAndReplaceConsoleStatements() {
  log('\n🔍 Finding console statements...', 'blue')

  const files = runCommand('grep -r "console\\." src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null', true)

  if (!files) {
    log('No console statements found!', 'green')
    return
  }

  const fileList = files.trim().split('\n').filter(Boolean)
  log(`Found ${fileList.length} files with console statements`, 'yellow')

  fileList.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8')

    // Check if logger is already imported
    const hasLogger = content.includes("import { logger }")

    // Replace console.log with logger.debug
    content = content.replace(/console\.log\(/g, 'logger.debug(')
    content = content.replace(/console\.error\(/g, 'logger.error(')
    content = content.replace(/console\.warn\(/g, 'logger.warn(')
    content = content.replace(/console\.info\(/g, 'logger.info(')

    // Add logger import if needed and changes were made
    if (!hasLogger && content.includes('logger.')) {
      // Find the last import statement
      const importMatch = content.match(/(^import[\s\S]*?)\n\n/m)
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          `${importMatch[1]}\nimport { logger } from '@/lib/logger'\n\n`
        )
      }
    }

    fs.writeFileSync(file, content)
  })

  log(`✅ Replaced console statements in ${fileList.length} files`, 'green')
}

function findUnusedVariables() {
  log('\n🔍 Finding unused variables...', 'blue')

  const output = runCommand(
    'npm run lint 2>&1 | grep "no-unused-vars\\|@typescript-eslint/no-unused-vars" | head -20',
    true
  )

  if (!output) {
    log('No unused variables found!', 'green')
    return
  }

  const lines = output.trim().split('\n').filter(Boolean)
  log(`Found ${lines.length} unused variable warnings (showing first 20)`, 'yellow')

  console.log('\nTo fix these:')
  console.log('1. Remove the variable/import if not needed')
  console.log('2. Prefix with underscore if intentionally unused: _variableName')
  console.log('3. Use the variable in your code\n')
}

function generateReport() {
  log('\n📊 Generating ESLint report...', 'blue')

  const warningTypes = {
    'no-explicit-any': 0,
    'no-unused-vars': 0,
    'no-console': 0,
    'no-alert': 0,
    'no-non-null-assertion': 0,
    'exhaustive-deps': 0
  }

  const output = runCommand('npm run lint 2>&1', true)

  if (output) {
    Object.keys(warningTypes).forEach(type => {
      const regex = new RegExp(type, 'g')
      const matches = output.match(regex)
      warningTypes[type] = matches ? matches.length : 0
    })
  }

  log('\n📈 Warning Summary:', 'bright')
  console.table(warningTypes)

  return warningTypes
}

function showMenu() {
  console.clear()
  log('================================', 'bright')
  log('   ESLint Warning Cleanup Tool  ', 'bright')
  log('================================', 'bright')

  const currentCount = getWarningCount()
  log(`\nCurrent warnings: ${currentCount}`, currentCount > 0 ? 'yellow' : 'green')

  console.log(`
Choose an action:

1. Run auto-fix for all fixable issues
2. Replace console statements with logger
3. Find unused variables
4. Generate detailed report
5. Run all cleanup tasks
0. Exit
`)
}

async function main() {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const question = (query) => new Promise((resolve) => rl.question(query, resolve))

  let running = true
  while (running) {
    showMenu()
    const choice = await question('Enter your choice (0-5): ')

    switch (choice.trim()) {
      case '1':
        fixAutoFixableIssues()
        break
      case '2':
        findAndReplaceConsoleStatements()
        break
      case '3':
        findUnusedVariables()
        break
      case '4':
        generateReport()
        break
      case '5':
        log('\n🚀 Running all cleanup tasks...', 'bright')
        fixAutoFixableIssues()
        findAndReplaceConsoleStatements()
        findUnusedVariables()
        generateReport()
        log('\n✅ All cleanup tasks complete!', 'green')
        break
      case '0':
        running = false
        log('\n👋 Goodbye!', 'blue')
        break
      default:
        log('\n❌ Invalid choice. Please try again.', 'red')
    }

    if (running) {
      await question('\nPress Enter to continue...')
    }
  }

  rl.close()
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Error: ${error.message}`, 'red')
    process.exit(1)
  })
}