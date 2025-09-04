import { NextRequest, NextResponse } from 'next/server';
import { query } from '~/lib/db';

// GET /api/profiles - Get all profiles (for admin/testing)
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id, fid, username, display_name, bio, avatar_url, 
        theme, custom_domain, is_verified, created_at, updated_at
      FROM profiles 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      profiles: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profiles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Create a new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid, username, display_name, bio, avatar_url, theme = 'dark' } = body;

    // Validate required fields
    if (!fid || !username) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: fid and username are required' 
        },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await query(
      'SELECT id FROM profiles WHERE fid = $1 OR username = $2',
      [fid, username]
    );

    if (existingProfile.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Profile already exists with this FID or username' 
        },
        { status: 409 }
      );
    }

    // Create new profile
    const result = await query(`
      INSERT INTO profiles (fid, username, display_name, bio, avatar_url, theme)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, fid, username, display_name, bio, avatar_url, theme, 
                custom_domain, is_verified, created_at, updated_at
    `, [fid, username, display_name, bio, avatar_url, theme]);

    const newProfile = result.rows[0];

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Profile created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
