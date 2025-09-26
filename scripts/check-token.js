require('dotenv').config({ path: '.env.local' });

console.log('Token exists:', !!process.env.HUBSPOT_PRIVATE_APP_TOKEN);
console.log('Token starts with:', process.env.HUBSPOT_PRIVATE_APP_TOKEN?.substring(0, 10) + '...');
console.log('Portal ID:', process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID);