#!/usr/bin/env node

/**
 * Database Migration Script for Fartree
 * Runs the initial database schema setup
 */

import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Load environment variables
  config({ path: '.env.local' });

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('Please create a .env.local file with your Neon database URL');
    process.exit(1);
  }

  console.log('🚀 Starting database migration...');

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read and execute the SQL schema file
    const sqlFile = path.join(__dirname, '001_create_profiles_and_links_tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📋 Executing database schema...');
    await pool.query(sqlContent);
    console.log('✅ Database schema created successfully');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'profile_links')
      ORDER BY table_name;
    `);

    console.log('📊 Created tables:', result.rows.map(row => row.table_name));

    if (result.rows.length === 2) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.warn('⚠️ Not all expected tables were created');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);
