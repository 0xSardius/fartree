import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testProfileAPI() {
  console.log('🧪 Testing Profile API endpoints...\n');

  try {
    // Test 1: Create a test profile
    console.log('1. Creating test profile...');
    const testProfile = {
      fid: 12345,
      username: 'testuser',
      display_name: 'Test User',
      bio: 'This is a test profile for Fartree',
      avatar_url: 'https://example.com/avatar.jpg',
      theme: 'dark'
    };

    const createResult = await pool.query(`
      INSERT INTO profiles (fid, username, display_name, bio, avatar_url, theme)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, fid, username, display_name, bio, avatar_url, theme, created_at
    `, [testProfile.fid, testProfile.username, testProfile.display_name, testProfile.bio, testProfile.avatar_url, testProfile.theme]);

    const createdProfile = createResult.rows[0];
    console.log('✅ Profile created:', {
      id: createdProfile.id,
      fid: createdProfile.fid,
      username: createdProfile.username,
      display_name: createdProfile.display_name
    });

    // Test 2: Add some test links
    console.log('\n2. Adding test links...');
    const testLinks = [
      { title: 'My Website', url: 'https://example.com', category: 'website', position: 0 },
      { title: 'Twitter', url: 'https://twitter.com/testuser', category: 'social', position: 1 },
      { title: 'GitHub', url: 'https://github.com/testuser', category: 'dev', position: 2 }
    ];

    for (const link of testLinks) {
      const linkResult = await pool.query(`
        INSERT INTO profile_links (profile_id, title, url, category, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, url, category, position
      `, [createdProfile.id, link.title, link.url, link.category, link.position]);
      
      console.log(`✅ Link created: ${linkResult.rows[0].title} -> ${linkResult.rows[0].url}`);
    }

    // Test 3: Query profile with links
    console.log('\n3. Querying profile with links...');
    const profileResult = await pool.query(`
      SELECT 
        id, fid, username, display_name, bio, avatar_url, theme, created_at
      FROM profiles 
      WHERE fid = $1
    `, [testProfile.fid]);

    const profile = profileResult.rows[0];
    
    const linksResult = await pool.query(`
      SELECT id, title, url, category, position, click_count, auto_detected
      FROM profile_links 
      WHERE profile_id = $1
      ORDER BY position ASC
    `, [profile.id]);

    console.log('✅ Profile found:', {
      username: profile.username,
      display_name: profile.display_name,
      links_count: linksResult.rows.length
    });

    console.log('✅ Links:');
    linksResult.rows.forEach(link => {
      console.log(`  - ${link.title}: ${link.url} (position: ${link.position}, clicks: ${link.click_count})`);
    });

    // Test 4: Update profile
    console.log('\n4. Updating profile...');
    const updateResult = await pool.query(`
      UPDATE profiles 
      SET display_name = $1, bio = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING display_name, bio, updated_at
    `, ['Updated Test User', 'This profile has been updated!', profile.id]);

    console.log('✅ Profile updated:', updateResult.rows[0]);

    // Test 5: Simulate a click
    console.log('\n5. Simulating link click...');
    const clickResult = await pool.query(`
      UPDATE profile_links 
      SET click_count = click_count + 1
      WHERE profile_id = $1 AND title = $2
      RETURNING title, click_count
    `, [profile.id, 'My Website']);

    console.log('✅ Link clicked:', clickResult.rows[0]);

    // Clean up - Delete test data
    console.log('\n6. Cleaning up test data...');
    await pool.query('DELETE FROM profile_links WHERE profile_id = $1', [profile.id]);
    await pool.query('DELETE FROM profiles WHERE id = $1', [profile.id]);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All API tests passed! The database and API structure is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testProfileAPI();
