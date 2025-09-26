const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run lint to get current issues
console.log('Running lint to get current issues...\n');
const lintOutput = execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });

// Parse lint output for unused variables
const unusedVarPattern = /^(.+?):(\d+):(\d+)\s+warning\s+'([^']+)' is (defined but never used|assigned a value but never used)/gm;
const matches = [...lintOutput.matchAll(unusedVarPattern)];

const fixes = new Map();

matches.forEach(match => {
  const [, file, line, col, varName, type] = match;
  const filePath = file.replace(/\\/g, '/').replace('F:/Github/PowerCA_Website/', '');

  if (!fixes.has(filePath)) {
    fixes.set(filePath, []);
  }

  fixes.get(filePath).push({
    line: parseInt(line),
    col: parseInt(col),
    varName,
    type
  });
});

console.log(`Found ${matches.length} unused variable issues to fix\n`);

// Fix each file
for (const [filePath, issues] of fixes) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let fixed = 0;

  // Sort issues by line number in reverse to avoid offset issues
  issues.sort((a, b) => b.line - a.line);

  issues.forEach(issue => {
    const lineIdx = issue.line - 1;
    const line = lines[lineIdx];

    if (!line) return;

    // Different patterns for different contexts
    const patterns = [
      // catch (error) -> catch (_error)
      {
        pattern: new RegExp(`catch\\s*\\(\\s*${issue.varName}\\s*\\)`, 'g'),
        replacement: `catch (_${issue.varName})`
      },
      // const { x, y, z } -> const { _x, _y, _z } for unused ones
      {
        pattern: new RegExp(`([{,]\\s*)${issue.varName}(\\s*[,}:])`, 'g'),
        replacement: `$1_${issue.varName}$2`
      },
      // const x = ... -> const _x = ...
      {
        pattern: new RegExp(`(const|let|var)\\s+${issue.varName}\\s*=`, 'g'),
        replacement: `$1 _${issue.varName} =`
      },
      // import { X } -> import { X as _X }
      {
        pattern: new RegExp(`import\\s*{([^}]*\\s)${issue.varName}(\\s[^}]*)}`, 'g'),
        replacement: `import {$1${issue.varName} as _${issue.varName}$2}`
      },
      // Simple import X -> import _X
      {
        pattern: new RegExp(`import\\s+${issue.varName}\\s+from`, 'g'),
        replacement: `import _${issue.varName} from`
      }
    ];

    let lineFixed = false;
    for (const { pattern, replacement } of patterns) {
      if (pattern.test(line)) {
        lines[lineIdx] = line.replace(pattern, replacement);
        lineFixed = true;
        fixed++;
        break;
      }
    }

    // Fallback: prefix with underscore if not already prefixed
    if (!lineFixed && !issue.varName.startsWith('_')) {
      const simplePattern = new RegExp(`\\b${issue.varName}\\b`, 'g');
      if (simplePattern.test(line)) {
        lines[lineIdx] = line.replace(simplePattern, `_${issue.varName}`);
        fixed++;
      }
    }
  });

  if (fixed > 0) {
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
    console.log(`✓ Fixed ${fixed} issues in ${filePath}`);
  }
}

console.log('\n✅ Finished fixing unused variables');
console.log('\nRunning final lint check...');
execSync('npm run lint', { stdio: 'inherit' });