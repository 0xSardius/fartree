import { NextRequest, NextResponse } from 'next/server'
import { query } from '~/lib/db'

/**
 * Debug endpoint to check if a profile exists and is loadable
 * Usage: /api/debug/profile-check?fid=123456
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fid = searchParams.get('fid')

    if (!fid) {
      return NextResponse.json({
        success: false,
        error: 'Missing fid parameter',
        usage: '/api/debug/profile-check?fid=123456'
      }, { status: 400 })
    }

    console.log(`[Debug] Checking profile for FID: ${fid}`)

    // Check if profile exists
    const profileResult = await query(
      'SELECT * FROM profiles WHERE fid = $1',
      [parseInt(fid)]
    )

    if (profileResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        exists: false,
        message: `No profile found for FID ${fid}`,
        debug: {
          fid: parseInt(fid),
          query_executed: 'SELECT * FROM profiles WHERE fid = $1',
          rows_returned: 0
        }
      })
    }

    const profile = profileResult.rows[0]

    // Get links count
    const linksResult = await query(
      'SELECT COUNT(*) as count FROM profile_links WHERE profile_id = $1 AND is_visible = true',
      [profile.id]
    )

    const linkCount = parseInt(linksResult.rows[0]?.count || '0')

    return NextResponse.json({
      success: true,
      exists: true,
      profile: {
        id: profile.id,
        fid: profile.fid,
        username: profile.username,
        display_name: profile.display_name,
        has_bio: !!profile.bio,
        has_avatar: !!profile.avatar_url,
        link_count: linkCount,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      },
      profile_url: `/profile/${fid}`,
      debug: {
        database_connected: true,
        profile_table_accessible: true,
        links_table_accessible: true
      }
    })

  } catch (error) {
    console.error('[Debug] Profile check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        database_connected: false,
        error_type: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}

