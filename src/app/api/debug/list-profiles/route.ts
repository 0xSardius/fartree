import { NextResponse } from 'next/server'
import { query } from '~/lib/db'

/**
 * Debug endpoint to list all profiles in the database
 * Usage: /api/debug/list-profiles
 */
export async function GET() {
  try {
    console.log('[Debug] Fetching all profiles from database...')

    const profilesResult = await query(
      `
      SELECT 
        p.id,
        p.fid,
        p.username,
        p.display_name,
        p.bio,
        p.created_at,
        p.updated_at,
        COUNT(pl.id) as link_count
      FROM profiles p
      LEFT JOIN profile_links pl ON p.id = pl.profile_id AND pl.is_visible = true
      GROUP BY p.id, p.fid, p.username, p.display_name, p.bio, p.created_at, p.updated_at
      ORDER BY p.updated_at DESC
      `
    )

    console.log(`[Debug] Found ${profilesResult.rows.length} total profiles`)

    return NextResponse.json({
      success: true,
      total_profiles: profilesResult.rows.length,
      profiles: profilesResult.rows.map((p) => ({
        fid: p.fid,
        username: p.username,
        display_name: p.display_name,
        has_bio: !!p.bio,
        link_count: parseInt(p.link_count) || 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
        profile_url: `/profile/${p.fid}`
      })),
      database_connected: true
    })

  } catch (error) {
    console.error('[Debug] List profiles error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error',
      database_connected: false
    }, { status: 500 })
  }
}

