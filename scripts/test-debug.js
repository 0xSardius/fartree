#!/usr/bin/env node

/**
 * Comprehensive Debug Script for Fartree
 * Tests all critical systems and identifies issues
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

console.log('🔍 FARTREE DEBUG REPORT\n');
console.log('=' .repeat(60));

// 1. Check Environment Variables
console.log('\n📋 ENVIRONMENT VARIABLES:');
console.log('=' .repeat(60));

const requiredEnvVars = [
  'DATABASE_URL',
  'NEYNAR_API_KEY',
  'NEXT_PUBLIC_URL'
];

const optionalEnvVars = [
  'JWT_SECRET',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN'
];

let envIssues = 0;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NOT SET (REQUIRED)`);
    envIssues++;
  } else {
    const maskedValue = value.length > 20 
      ? value.substring(0, 15) + '...' + value.substring(value.length - 5)
      : '***';
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  } else {
    const maskedValue = '***';
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

// 2. Test Database Connection
console.log('\n\n🗄️  DATABASE CONNECTION:');
console.log('=' .repeat(60));

try {
  const { Pool } = await import('@neondatabase/serverless');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('Connecting to database...');
  const client = await pool.connect();
  console.log('✅ Database connection successful');
  
  // Check if tables exist
  console.log('\nChecking tables...');
  const tablesResult = await client.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
  `);
  
  const tables = tablesResult.rows.map(r => r.tablename);
  const requiredTables = ['profiles', 'profile_links'];
  
  requiredTables.forEach(table => {
    if (tables.includes(table)) {
      console.log(`✅ Table '${table}' exists`);
    } else {
      console.log(`❌ Table '${table}' MISSING`);
      envIssues++;
    }
  });
  
  // Check row counts
  if (tables.includes('profiles')) {
    const profileCount = await client.query('SELECT COUNT(*) FROM profiles');
    console.log(`   └─ ${profileCount.rows[0].count} profiles in database`);
  }
  
  if (tables.includes('profile_links')) {
    const linkCount = await client.query('SELECT COUNT(*) FROM profile_links');
    console.log(`   └─ ${linkCount.rows[0].count} links in database`);
  }
  
  client.release();
  await pool.end();
  
} catch (error) {
  console.log('❌ Database connection failed:', error.message);
  envIssues++;
}

// 3. Test Neynar API
console.log('\n\n🌐 NEYNAR API:');
console.log('=' .repeat(60));

try {
  const { NeynarAPIClient, Configuration } = await import('@neynar/nodejs-sdk');
  
  if (!process.env.NEYNAR_API_KEY) {
    console.log('❌ NEYNAR_API_KEY not set - skipping API test');
    envIssues++;
  } else {
    console.log('Testing Neynar API connection...');
    const config = new Configuration({ apiKey: process.env.NEYNAR_API_KEY });
    const client = new NeynarAPIClient(config);
    
    // Test with a known FID (Farcaster founder)
    const testFid = 3;
    console.log(`Fetching test user (FID: ${testFid})...`);
    
    const response = await client.fetchBulkUsers({ fids: [testFid] });
    const user = response.users[0];
    
    console.log('✅ Neynar API working');
    console.log(`   └─ Test user: @${user.username} (${user.display_name})`);
    console.log(`   └─ Verified accounts: ${user.verified_accounts?.length || 0}`);
    console.log(`   └─ Verified addresses: ETH=${!!user.verified_addresses?.eth_addresses?.length}, SOL=${!!user.verified_addresses?.sol_addresses?.length}`);
  }
} catch (error) {
  console.log('❌ Neynar API failed:', error.message);
  envIssues++;
}

// 4. Test Auto-Population Logic
console.log('\n\n🔍 AUTO-POPULATION TEST:');
console.log('=' .repeat(60));

try {
  const { NeynarAPIClient, Configuration } = await import('@neynar/nodejs-sdk');
  
  if (!process.env.NEYNAR_API_KEY) {
    console.log('❌ Skipping auto-population test (no API key)');
  } else {
    const config = new Configuration({ apiKey: process.env.NEYNAR_API_KEY });
    const client = new NeynarAPIClient(config);
    
    // Test with the configured test FID
    const testFid = 6841;
    console.log(`Testing auto-population for FID: ${testFid}`);
    
    const response = await client.fetchBulkUsers({ fids: [testFid] });
    const user = response.users[0];
    
    console.log('\n📝 Profile Data:');
    console.log(`   Username: @${user.username}`);
    console.log(`   Display Name: ${user.display_name}`);
    console.log(`   Bio: ${user.profile?.bio?.text?.substring(0, 50) || 'N/A'}...`);
    console.log(`   Avatar: ${user.pfp_url ? '✅' : '❌'}`);
    
    console.log('\n🔗 Auto-Detectable Links:');
    
    // X/Twitter
    const xAccount = user.verified_accounts?.find(acc => acc.platform === 'x');
    if (xAccount) {
      console.log(`   ✅ X/Twitter: @${xAccount.username} → https://x.com/${xAccount.username}`);
    } else {
      console.log(`   ⚠️  No X/Twitter account verified`);
    }
    
    // ETH Address
    if (user.verified_addresses?.eth_addresses?.length > 0) {
      const ethAddr = user.verified_addresses.eth_addresses[0];
      console.log(`   ✅ ETH Address: ${ethAddr.substring(0, 10)}... → https://etherscan.io/address/${ethAddr}`);
    } else {
      console.log(`   ⚠️  No ETH address verified`);
    }
    
    // SOL Address  
    if (user.verified_addresses?.sol_addresses?.length > 0) {
      const solAddr = user.verified_addresses.sol_addresses[0];
      console.log(`   ✅ SOL Address: ${solAddr.substring(0, 10)}... → https://solscan.io/account/${solAddr}`);
    } else {
      console.log(`   ⚠️  No SOL address verified`);
    }
    
    const linkCount = 
      (xAccount ? 1 : 0) + 
      (user.verified_addresses?.eth_addresses?.length || 0) +
      (user.verified_addresses?.sol_addresses?.length || 0);
    
    console.log(`\n   📊 Total auto-detectable links: ${linkCount}`);
    
    if (linkCount === 0) {
      console.log('   ⚠️  WARNING: This user has no auto-detectable links!');
      console.log('   💡 Try testing with a different FID that has verified accounts/addresses');
    }
  }
} catch (error) {
  console.log('❌ Auto-population test failed:', error.message);
}

// 5. Summary
console.log('\n\n📊 SUMMARY:');
console.log('=' .repeat(60));

if (envIssues === 0) {
  console.log('✅ All systems operational!');
  console.log('\n💡 If you\'re still having issues:');
  console.log('   1. Check browser console for client-side errors');
  console.log('   2. Check Next.js dev server logs');
  console.log('   3. Try clearing browser cache and reloading');
} else {
  console.log(`❌ Found ${envIssues} issue(s) that need attention`);
  console.log('\n🔧 Next steps:');
  console.log('   1. Fix the issues marked with ❌ above');
  console.log('   2. Run this script again to verify fixes');
  console.log('   3. If database tables are missing, run: npm run db:migrate');
}

console.log('\n' + '=' .repeat(60));
console.log('Debug report complete\n');
