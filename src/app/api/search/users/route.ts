import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const viewerFid = searchParams.get('viewer_fid');
    const limit = searchParams.get('limit') || '10';

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!NEYNAR_API_KEY) {
      throw new Error('NEYNAR_API_KEY is not configured');
    }

    // Build the URL with optional viewer_fid
    let apiUrl = `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (viewerFid) {
      apiUrl += `&viewer_fid=${viewerFid}`;
    }

    // Use Neynar's user search endpoint
    const neynarResponse = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
    });

    if (!neynarResponse.ok) {
      const errorText = await neynarResponse.text();
      console.error('Neynar API error:', neynarResponse.status, errorText);
      throw new Error(`Neynar API error: ${neynarResponse.status} ${neynarResponse.statusText}`);
    }

    const searchResults = await neynarResponse.json();

    interface NeynarSearchUser {
      fid: number;
      username: string;
      display_name: string;
      pfp?: { url?: string };
      pfp_url?: string;
      power_badge?: boolean;
    }

    // Transform the results to match our FriendData interface
    // Neynar returns users directly in the result object
    const users = (searchResults.result?.users || searchResults.users || []) as NeynarSearchUser[];
    
    // Extract FIDs from search results
    const searchFids = users.map((user) => user.fid);
    console.log(`[Search] Checking FIDs:`, searchFids);
    
    // Query database to check which users have Fartree profiles
    const { query: dbQuery } = await import('~/lib/db');
    const profilesResult = await dbQuery(
      `
      SELECT 
        p.fid,
        p.username,
        p.display_name,
        p.bio,
        p.avatar_url,
        p.updated_at,
        COUNT(pl.id) as link_count
      FROM profiles p
      LEFT JOIN profile_links pl ON p.id = pl.profile_id AND pl.is_visible = true
      WHERE p.fid = ANY($1::bigint[])
      GROUP BY p.id, p.fid, p.username, p.display_name, p.bio, p.avatar_url, p.updated_at
      `,
      [searchFids]
    );
    console.log(`[Search] Found ${profilesResult.rows.length} profiles:`, profilesResult.rows.map(p => ({ fid: p.fid, username: p.username })));

    interface FartreeProfile {
      fid: number;
      link_count: string;
      bio?: string;
      updated_at: string;
    }

    // Enrich search results with Fartree data
    const transformedUsers = users.map((user) => {
      const fartreeProfile = profilesResult.rows.find((p: FartreeProfile) => p.fid === user.fid);
      
      return {
        fid: user.fid,
        username: user.username,
        display_name: user.display_name,
        pfp_url: user.pfp?.url || user.pfp_url,
        power_badge: user.power_badge || false,
        follower_count: 0,
        following_count: 0,
        has_fartree: !!fartreeProfile,
        fartree_data: fartreeProfile ? {
          link_count: parseInt(fartreeProfile.link_count) || 0,
          bio: fartreeProfile.bio,
          updated_at: fartreeProfile.updated_at,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      count: transformedUsers.length,
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

