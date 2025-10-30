import { NextRequest, NextResponse } from 'next/server';
import { query } from '~/lib/db';

// GET /api/debug/check-profile?fid=123 - Check if a profile exists and is visible
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const username = searchParams.get('username');

    if (!fid && !username) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either fid or username parameter is required' 
        },
        { status: 400 }
      );
    }

    // Check if profile exists in database
    let profileResult;
    if (fid) {
      profileResult = await query(
        `
        SELECT 
          p.id,
          p.fid,
          p.username,
          p.display_name,
          p.bio,
          p.avatar_url,
          p.theme,
          p.created_at,
          p.updated_at,
          COUNT(pl.id) as total_links,
          COUNT(CASE WHEN pl.is_visible = true THEN 1 END) as visible_links
        FROM profiles p
        LEFT JOIN profile_links pl ON p.id = pl.profile_id
        WHERE p.fid = $1
        GROUP BY p.id
        `,
        [parseInt(fid)]
      );
    } else {
      profileResult = await query(
        `
        SELECT 
          p.id,
          p.fid,
          p.username,
          p.display_name,
          p.bio,
          p.avatar_url,
          p.theme,
          p.created_at,
          p.updated_at,
          COUNT(pl.id) as total_links,
          COUNT(CASE WHEN pl.is_visible = true THEN 1 END) as visible_links
        FROM profiles p
        LEFT JOIN profile_links pl ON p.id = pl.profile_id
        WHERE p.username = $1
        GROUP BY p.id
        `,
        [username]
      );
    }

    if (profileResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: fid 
          ? `No profile found for FID ${fid}` 
          : `No profile found for username ${username}`,
        debug: {
          search_by: fid ? 'fid' : 'username',
          search_value: fid || username,
        }
      });
    }

    const profile = profileResult.rows[0];

    // Get all links for this profile
    const linksResult = await query(
      `
      SELECT id, title, url, category, position, is_visible, click_count, created_at
      FROM profile_links
      WHERE profile_id = $1
      ORDER BY position ASC
      `,
      [profile.id]
    );

    return NextResponse.json({
      success: true,
      exists: true,
      profile: {
        id: profile.id,
        fid: profile.fid,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        theme: profile.theme,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        total_links: parseInt(profile.total_links),
        visible_links: parseInt(profile.visible_links),
      },
      links: linksResult.rows,
      debug: {
        would_show_in_discover: parseInt(profile.total_links) > 0 || parseInt(profile.visible_links) > 0,
        profile_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/profile/${profile.fid}`,
      }
    });

  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

