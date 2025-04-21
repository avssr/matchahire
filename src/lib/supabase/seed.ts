import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'src/lib/supabase/seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL into individual statements
    const statements = sql.split(';').filter(statement => statement.trim());

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
          throw error;
        }
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 