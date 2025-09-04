import { NextRequest, NextResponse } from 'next/server';
import { query } from '~/lib/db';

// Helper function to get user from Farcaster API (you could also use Neynar)
async function getFarcasterUser(fid: number) {
  try {
    // Using the free Farcaster API endpoint
    const response = await fetch(`https://api.farcaster.xyz/v2/user?fid=${fid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user from Farcaster API');
    }
    const data = await response.json();
    return data.result?.user;
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return null;
  }
}

// GET /api/auth/me - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    // For now, we'll simulate getting the FID from the Mini App context
    // In a real implementation, you'd verify the Quick Auth JWT here
    
    // TODO: Replace this with actual Quick Auth JWT verification
    // const authorization = request.headers.get('authorization');
    // if (!authorization?.startsWith('Bearer ')) {
    //   return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    // }
    
    // For development, let's use a test FID
    const testFid = 6841; // Replace with actual FID from JWT
    
    // Check if user exists in our database
    let profile = await query(
      'SELECT * FROM profiles WHERE fid = $1',
      [testFid]
    );

    if (profile.rows.length === 0) {
      // User doesn't exist in our DB, let's fetch from Farcaster and create profile
      const farcasterUser = await getFarcasterUser(testFid);
      
      if (farcasterUser) {
        const createResult = await query(`
          INSERT INTO profiles (fid, username, display_name, bio, avatar_url, theme)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          testFid,
          farcasterUser.username || `user${testFid}`,
          farcasterUser.displayName || farcasterUser.username || `User ${testFid}`,
          farcasterUser.profile?.bio?.text || null,
          farcasterUser.pfp?.url || null,
          'dark' // Default theme
        ]);
        
        profile = createResult;
      } else {
        // Fallback if Farcaster API fails
        const createResult = await query(`
          INSERT INTO profiles (fid, username, display_name, theme)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [testFid, `user${testFid}`, `User ${testFid}`, 'dark']);
        
        profile = createResult;
      }
    }

    const user = profile.rows[0];

    // Also fetch user's links
    const linksResult = await query(`
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE profile_id = $1 AND is_visible = true
      ORDER BY position ASC, created_at ASC
    `, [user.id]);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        links: linksResult.rows
      }
    });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
