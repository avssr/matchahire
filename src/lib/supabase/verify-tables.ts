import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Mask the key when logging
const maskedKey = supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 10);
console.log('Environment variables loaded:');
console.log('URL:', supabaseUrl);
console.log('Key (masked):', maskedKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('\nStarting table verification...');

  // Check tables
  const requiredTables = ['roles', 'companies', 'chat_sessions', 'messages', 'personas'];
  for (const table of requiredTables) {
    try {
      console.log(`\nChecking table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table ${table} error:`, error);
        continue;
      }

      console.log(`✅ Table ${table} exists and is accessible`);
      if (data && data.length > 0) {
        console.log(`Sample data:`, data[0]);
      } else {
        console.log('Table is empty');
      }
    } catch (error) {
      console.error(`❌ Error checking table ${table}:`, error);
    }
  }

  // Check specific columns
  try {
    console.log('\nChecking specific columns...');
    
    // Check personas table columns
    const { data: personasData, error: personasError } = await supabase
      .from('personas')
      .select('role_type')
      .limit(1);

    if (personasError) {
      console.error('❌ Personas role_type check error:', personasError);
    } else {
      console.log('✅ Column "role_type" exists in personas table');
      if (personasData && personasData.length > 0) {
        console.log('Sample data:', personasData[0]);
      } else {
        console.log('No personas data found');
      }
    }

    // Check messages table columns
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('status')
      .limit(1);

    if (messagesError) {
      console.error('❌ Messages status check error:', messagesError);
    } else {
      console.log('✅ Column "status" exists in messages table');
      if (messagesData && messagesData.length > 0) {
        console.log('Sample data:', messagesData[0]);
      } else {
        console.log('No messages data found');
      }
    }
  } catch (error) {
    console.error('❌ Error checking columns:', error);
  }
}

// Run the verification
console.log('Starting verification process...');
verifyTables().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}); 