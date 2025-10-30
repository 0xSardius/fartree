import { NextResponse } from 'next/server';
import { query } from '~/lib/db';

export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Neynar API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!fid) {
      return NextResponse.json(
        { success: false, error: 'FID is required' },
        { status: 400 }
      );
    }

    // Fetch best friends from Neynar API
    const neynarResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/best_friends?fid=${fid}&limit=${limit}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!neynarResponse.ok) {
      throw new Error(`Neynar API error: ${neynarResponse.statusText}`);
    }

    interface NeynarUser {
      fid: number;
      username: string;
      display_name: string;
      pfp?: { url?: string };
      pfp_url?: string;
      follower_count?: number;
      following_count?: number;
      power_badge?: boolean;
    }

    const bestFriendsResponse = await neynarResponse.json() as { users: NeynarUser[] };

    if (!bestFriendsResponse?.users || bestFriendsResponse.users.length === 0) {
      return NextResponse.json({
        success: true,
        friends_with_fartree: [],
        friends_without_fartree: [],
        total_friends: 0,
        fartree_count: 0,
      });
    }

    // Extract FIDs from best friends - Neynar returns users directly, not nested
    const friendFids = bestFriendsResponse.users.map((user) => user.fid);
    console.log(`[Discover] Checking ${friendFids.length} friends for Fartree profiles:`, friendFids);
    console.log(`[Discover] FID types:`, friendFids.map(f => ({ fid: f, type: typeof f })));

    // First, check ALL profiles in database
    const allProfilesCheck = await query('SELECT fid, username FROM profiles LIMIT 10');
    console.log(`[Discover] Sample profiles in DB:`, allProfilesCheck.rows.map(p => ({ fid: p.fid, type: typeof p.fid, username: p.username })));

    // Query our database to see which friends have Fartree profiles
    // Cast FIDs to BIGINT explicitly to match database schema
    const profilesResult = await query(
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
      ORDER BY p.updated_at DESC
      `,
      [friendFids]
    );

    console.log(`[Discover] Found ${profilesResult.rows.length} Fartree profiles:`, 
      profilesResult.rows.map((p: FartreeProfile) => ({ fid: p.fid, username: p.username, links: p.link_count })));

    interface FartreeProfile {
      fid: number;
      username?: string;
      link_count: string;
      bio?: string;
      updated_at: string;
    }

    // Enrich friend data with Fartree profile info
    const enrichedFriends = bestFriendsResponse.users.map((friend) => {
      const fartreeProfile = profilesResult.rows.find((p: FartreeProfile) => p.fid === friend.fid);

      return {
        fid: friend.fid,
        username: friend.username,
        display_name: friend.display_name,
        pfp_url: friend.pfp?.url || friend.pfp_url, // Neynar returns pfp.url
        follower_count: friend.follower_count,
        following_count: friend.following_count,
        power_badge: friend.power_badge,
        // Fartree-specific data
        has_fartree: !!fartreeProfile,
        fartree_data: fartreeProfile ? {
          link_count: parseInt(fartreeProfile.link_count) || 0,
          bio: fartreeProfile.bio,
          updated_at: fartreeProfile.updated_at,
        } : null,
      };
    });

    // Separate friends with and without Fartrees
    const friendsWithFartree = enrichedFriends.filter((f) => f.has_fartree);
    const friendsWithoutFartree = enrichedFriends.filter((f) => !f.has_fartree);

    console.log(`[Discover] Result: ${friendsWithFartree.length} with Fartree, ${friendsWithoutFartree.length} without`);

    return NextResponse.json({
      success: true,
      friends_with_fartree: friendsWithFartree,
      friends_without_fartree: friendsWithoutFartree,
      total_friends: enrichedFriends.length,
      fartree_count: friendsWithFartree.length,
    });

  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch friends' 
      },
      { status: 500 }
    );
  }
}

