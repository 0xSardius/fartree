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

    // Transform the results to match our FriendData interface
    // Neynar returns users directly in the result object
    const users = searchResults.result?.users || searchResults.users || [];
    const transformedUsers = users.map((user: any) => ({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      power_badge: user.power_badge || false,
      // Search results won't have fartree_data initially
      fartree_data: null,
    }));

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

