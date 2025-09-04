#!/usr/bin/env node

/**
 * Simple database connection test
 */

import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testDatabase() {
  console.log('🧪 Testing database connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return false;
  }

  console.log('✅ DATABASE_URL found');

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connection successful!');
    console.log('🕐 Current time:', result.rows[0].current_time);
    console.log('🗄️ PostgreSQL version:', result.rows[0].postgres_version);

    // Test our tables exist
    console.log('📋 Checking if tables exist...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'links')
      ORDER BY table_name
    `);
    
    console.log('📊 Found tables:', tablesResult.rows.map(row => row.table_name));
    
    if (tablesResult.rows.length === 2) {
      console.log('✅ All required tables exist!');
    } else {
      console.log('⚠️ Missing tables. Expected: profiles, links');
    }

    // Test table structure
    console.log('🔍 Checking profiles table structure...');
    const profilesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Profiles table columns:');
    profilesStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });

    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

testDatabase()
  .then(success => {
    if (success) {
      console.log('🎉 Database test completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Database test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
