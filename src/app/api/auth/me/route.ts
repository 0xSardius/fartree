import { NextRequest, NextResponse } from 'next/server';
import { query } from '~/lib/db';
import { getNeynarUser } from '~/lib/neynar';
import { createClient } from '@farcaster/quick-auth';

// Helper function to auto-detect and create social links from Neynar data
async function autoDetectSocialLinks(profileId: string, neynarUser: any) {
  const linksToCreate = [];
  
  // Add X (Twitter) if verified
  if (neynarUser.verified_accounts) {
    const xAccount = neynarUser.verified_accounts.find((acc: any) => acc.platform === 'x');
    if (xAccount) {
      linksToCreate.push({
        title: 'X (Twitter)',
        url: `https://x.com/${xAccount.username}`,
        category: 'social',
        auto_detected: true
      });
    }
  }
  
  // Add primary ETH address if available
  if (neynarUser.verified_addresses?.primary?.eth_address) {
    const ethAddress = neynarUser.verified_addresses.primary.eth_address;
    linksToCreate.push({
      title: 'ETH Address',
      url: `https://etherscan.io/address/${ethAddress}`,
      category: 'crypto',
      auto_detected: true
    });
  }
  
  // Add primary SOL address if available
  if (neynarUser.verified_addresses?.primary?.sol_address) {
    const solAddress = neynarUser.verified_addresses.primary.sol_address;
    linksToCreate.push({
      title: 'SOL Address',
      url: `https://solscan.io/account/${solAddress}`,
      category: 'crypto',
      auto_detected: true
    });
  }
  
  // Create the links in database
  for (let i = 0; i < linksToCreate.length; i++) {
    const link = linksToCreate[i];
    
    // Check if link already exists to avoid duplicates
    const existingLink = await query(
      'SELECT id FROM profile_links WHERE profile_id = $1 AND url = $2',
      [profileId, link.url]
    );
    
    if (existingLink.rows.length === 0) {
      await query(`
        INSERT INTO profile_links (profile_id, title, url, category, position, auto_detected)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [profileId, link.title, link.url, link.category, i, link.auto_detected]);
    }
  }
  
  console.log(`Auto-detected ${linksToCreate.length} social links for profile ${profileId}`);
}

// Helper function to extract FID from Quick Auth JWT
async function extractFidFromJWT(authHeader: string): Promise<number | null> {
  try {
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    // Use the official Quick Auth client to verify the JWT
    const client = createClient();
    
    try {
      const payload = await client.verifyJwt({
        token,
        domain: process.env.NEXT_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_URL).hostname : 'localhost:3000',
      });
      
      console.log('✅ JWT verified successfully, FID:', payload.sub);
      return payload.sub; // The FID is in the 'sub' field
      
    } catch (jwtError: any) {
      // In development, JWT verification often fails due to domain mismatch
      // But we can still decode the token to get the FID (without verification)
      if (process.env.NODE_ENV === 'development') {
        try {
          // Decode JWT without verification to get the FID
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            if (payload.sub) {
              console.log('🔧 Development mode: Using FID from unverified JWT:', payload.sub);
              return parseInt(payload.sub);
            }
          }
        } catch (decodeError) {
          console.error('Failed to decode JWT in development:', decodeError);
        }
        // If decoding fails, return null instead of test FID
        console.log('⚠️ Development mode: Could not extract FID from JWT');
        return null;
      }
      
      // In production, log the actual error
      console.error('❌ JWT verification failed:', jwtError?.shortMessage || jwtError?.message || jwtError);
      return null;
    }
    
  } catch (error) {
    console.error('Error extracting FID from JWT:', error);
    return null;
  }
}

// GET /api/auth/me - Get current authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get FID from Quick Auth JWT
    const authorization = request.headers.get('authorization');
    let fid: number | null = null;
    
    if (authorization) {
      fid = await extractFidFromJWT(authorization);
      console.log('✅ Found FID from JWT:', fid);
    }
    
    // If no JWT token, user is not authenticated
    if (!fid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated - please sign in with Farcaster' 
        },
        { status: 401 }
      );
    }
    
    // Check if user exists in our database
    let profile = await query(
      'SELECT * FROM profiles WHERE fid = $1',
      [fid]
    );

    if (profile.rows.length === 0) {
      // User doesn't exist in our DB, let's fetch from Neynar and create profile
      console.log('Creating new profile for FID:', fid);
      const neynarUser = await getNeynarUser(fid);
      
      if (neynarUser) {
        console.log('Got Neynar user data:', { 
          username: neynarUser.username, 
          displayName: neynarUser.display_name,
          bio: neynarUser.profile?.bio?.text?.substring(0, 50) + '...'
        });
        
        const createResult = await query(`
          INSERT INTO profiles (fid, username, display_name, bio, avatar_url, theme)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          fid,
          neynarUser.username || `user${fid}`,
          neynarUser.display_name || neynarUser.username || `User ${fid}`,
          neynarUser.profile?.bio?.text || null,
          neynarUser.pfp_url || null,
          'dark' // Default theme
        ]);
        
        profile = createResult;
        
        // Auto-detect and create social links from Neynar data
        await autoDetectSocialLinks(profile.rows[0].id, neynarUser);
      } else {
        console.log('Neynar user fetch failed, creating basic profile for FID:', fid);
        // Fallback if Neynar API fails
        const createResult = await query(`
          INSERT INTO profiles (fid, username, display_name, theme)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [fid, `user${fid}`, `User ${fid}`, 'dark']);
        
        profile = createResult;
      }
    } else {
      console.log('Found existing profile for FID:', fid);
      
      // Optionally refresh profile data from Neynar (e.g., every 24 hours)
      const existingUser = profile.rows[0];
      const lastUpdated = new Date(existingUser.updated_at);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate > 24) {
        console.log('Profile is stale, refreshing from Neynar...');
        const neynarUser = await getNeynarUser(fid);
        
        if (neynarUser) {
          const updateResult = await query(`
            UPDATE profiles 
            SET username = $2, display_name = $3, bio = $4, avatar_url = $5, updated_at = CURRENT_TIMESTAMP
            WHERE fid = $1
            RETURNING *
          `, [
            fid,
            neynarUser.username || existingUser.username,
            neynarUser.display_name || existingUser.display_name,
            neynarUser.profile?.bio?.text || existingUser.bio,
            neynarUser.pfp_url || existingUser.avatar_url
          ]);
          
          profile = updateResult;
          console.log('Profile refreshed from Neynar');
          
          // Also refresh auto-detected links
          await autoDetectSocialLinks(existingUser.id, neynarUser);
        }
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
