import { createClient } from './server';

async function verifyTables() {
  const supabase = createClient();
  const requiredTables = ['roles', 'companies', 'chat_sessions', 'messages'];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.error(`❌ Table ${table} does not exist or is not accessible`);
        continue;
      }

      console.log(`✅ Table ${table} exists and is accessible`);
    } catch (error) {
      console.error(`❌ Error checking table ${table}:`, error);
    }
  }
}

verifyTables().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}); 