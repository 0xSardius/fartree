import { NextRequest, NextResponse } from 'next/server';
import { query } from '~/lib/db';

type RouteParams = {
  params: {
    identifier: string;
  };
};

// Helper function to determine if identifier is FID (numeric) or username
function isNumeric(str: string): boolean {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

// GET /api/profiles/[identifier] - Get profile by FID or username
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = await params;
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier is required' },
        { status: 400 }
      );
    }

    let result;
    
    if (isNumeric(identifier)) {
      // Search by FID
      result = await query(`
        SELECT 
          id, fid, username, display_name, bio, avatar_url, 
          theme, custom_domain, is_verified, created_at, updated_at
        FROM profiles 
        WHERE fid = $1
      `, [parseInt(identifier)]);
    } else {
      // Search by username
      result = await query(`
        SELECT 
          id, fid, username, display_name, bio, avatar_url, 
          theme, custom_domain, is_verified, created_at, updated_at
        FROM profiles 
        WHERE username = $1
      `, [identifier]);
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    const profile = result.rows[0];

    // Also fetch profile links
    const linksResult = await query(`
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE profile_id = $1 AND is_visible = true
      ORDER BY position ASC, created_at ASC
    `, [profile.id]);

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        links: linksResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/[identifier] - Update profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = params;
    const body = await request.json();
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier is required' },
        { status: 400 }
      );
    }

    // First, find the profile
    let existingProfile;
    
    if (isNumeric(identifier)) {
      const result = await query('SELECT id FROM profiles WHERE fid = $1', [parseInt(identifier)]);
      existingProfile = result.rows[0];
    } else {
      const result = await query('SELECT id FROM profiles WHERE username = $1', [identifier]);
      existingProfile = result.rows[0];
    }

    if (!existingProfile) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    // Build update query dynamically based on provided fields
    const allowedFields = ['display_name', 'bio', 'avatar_url', 'theme', 'custom_domain'];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(body[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`);

    // Update the profile
    updateValues.push(existingProfile.id);
    const updateResult = await query(`
      UPDATE profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, fid, username, display_name, bio, avatar_url, theme, 
                custom_domain, is_verified, created_at, updated_at
    `, updateValues);

    return NextResponse.json({
      success: true,
      profile: updateResult.rows[0],
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/[identifier] - Delete profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = params;
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier is required' },
        { status: 400 }
      );
    }

    let result;
    
    if (isNumeric(identifier)) {
      result = await query('DELETE FROM profiles WHERE fid = $1 RETURNING id, username', [parseInt(identifier)]);
    } else {
      result = await query('DELETE FROM profiles WHERE username = $1 RETURNING id, username', [identifier]);
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    const deletedProfile = result.rows[0];

    return NextResponse.json({
      success: true,
      message: `Profile '${deletedProfile.username}' deleted successfully`,
      deleted_profile: deletedProfile
    });

  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
