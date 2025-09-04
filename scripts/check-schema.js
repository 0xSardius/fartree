import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  console.log('🔍 Checking database schema...\n');
  
  // Check profiles table
  console.log('=== PROFILES TABLE ===');
  const profilesResult = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    ORDER BY ordinal_position
  `);
  
  if (profilesResult.rows.length === 0) {
    console.log('❌ Profiles table not found');
  } else {
    profilesResult.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const defaultVal = row.column_default ? ` default: ${row.column_default}` : '';
      console.log(`  - ${row.column_name}: ${row.data_type} ${nullable}${defaultVal}`);
    });
  }
  
  // Check profile_links table
  console.log('\n=== PROFILE_LINKS TABLE ===');
  const linksResult = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'profile_links' 
    ORDER BY ordinal_position
  `);
  
  if (linksResult.rows.length === 0) {
    console.log('❌ Profile_links table not found');
  } else {
    linksResult.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const defaultVal = row.column_default ? ` default: ${row.column_default}` : '';
      console.log(`  - ${row.column_name}: ${row.data_type} ${nullable}${defaultVal}`);
    });
  }
  
  console.log('\n✅ Database schema check complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await pool.end();
}
