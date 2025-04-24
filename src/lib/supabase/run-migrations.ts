import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    // Add role_type to personas if it doesn't exist
    const { error: roleTypeError } = await supabase
      .from('personas')
      .update({ role_type: 'general' })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select();

    if (roleTypeError?.message?.includes('column "role_type" does not exist')) {
      const { error } = await supabase.rpc('alter_table', {
        table: 'personas',
        command: 'ALTER TABLE personas ADD COLUMN role_type VARCHAR(50) NOT NULL DEFAULT \'general\''
      });
      
      if (error) {
        console.error('Error adding role_type column:', error);
      } else {
        console.log('Successfully added role_type column to personas');
      }
    }

    // Add status to messages if it doesn't exist
    const { error: statusError } = await supabase
      .from('messages')
      .update({ status: 'pending' })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select();

    if (statusError?.message?.includes('column "status" does not exist')) {
      const { error } = await supabase.rpc('alter_table', {
        table: 'messages',
        command: 'ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT \'pending\''
      });
      
      if (error) {
        console.error('Error adding status column:', error);
      } else {
        console.log('Successfully added status column to messages');
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations(); 