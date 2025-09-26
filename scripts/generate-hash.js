// Script to generate bcrypt hash for admin password
// DO NOT hardcode passwords - use environment variables or prompts
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for password
function promptPassword() {
  return new Promise((resolve) => {
    // Check for environment variable first
    if (process.env.ADMIN_PASSWORD) {
      console.log('Using password from ADMIN_PASSWORD environment variable');
      resolve(process.env.ADMIN_PASSWORD);
      return;
    }

    // Otherwise prompt for password
    rl.question('Enter password to hash (will be hidden in production): ', (password) => {
      if (!password || password.length < 12) {
        console.error('Error: Password must be at least 12 characters long');
        rl.close();
        process.exit(1);
      }
      resolve(password);
    });
  });
}

async function generateHash() {
  try {
    const password = await promptPassword();
    const saltRounds = 12;

    console.log('\nGenerating hash...');
    const hash = bcrypt.hashSync(password, saltRounds);

    console.log('\n=== Generated Password Hash ===');
    console.log(hash);
    console.log('================================\n');

    console.log('Verifying hash...');
    console.log('Password matches:', bcrypt.compareSync(password, hash));

    console.log('\nTo use this hash:');
    console.log('1. Store it in your database admin_users table');
    console.log('2. Or set it as ADMIN_PASSWORD_HASH environment variable');
    console.log('\nNever commit plaintext passwords to version control!');

    rl.close();
  } catch (error) {
    console.error('Error generating hash:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the script
generateHash();