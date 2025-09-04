import { NextRequest, NextResponse } from 'next/server';
import { query } from '~/lib/db';

type RouteParams = {
  params: {
    identifier: string;
    linkId: string;
  };
};

// Helper function to determine if identifier is FID (numeric) or username
function isNumeric(str: string): boolean {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

// Helper function to get profile ID from identifier
async function getProfileId(identifier: string) {
  let result;
  
  if (isNumeric(identifier)) {
    result = await query('SELECT id FROM profiles WHERE fid = $1', [parseInt(identifier)]);
  } else {
    result = await query('SELECT id FROM profiles WHERE username = $1', [identifier]);
  }
  
  return result.rows.length > 0 ? result.rows[0].id : null;
}

// GET /api/profiles/[identifier]/links/[linkId] - Get specific link
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier, linkId } = params;
    
    if (!identifier || !linkId) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier and link ID are required' },
        { status: 400 }
      );
    }

    const profileId = await getProfileId(identifier);
    
    if (!profileId) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    const result = await query(`
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE id = $1 AND profile_id = $2
    `, [linkId, profileId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      link: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/[identifier]/links/[linkId] - Update specific link
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier, linkId } = params;
    const body = await request.json();
    
    if (!identifier || !linkId) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier and link ID are required' },
        { status: 400 }
      );
    }

    const profileId = await getProfileId(identifier);
    
    if (!profileId) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    // Check if link exists and belongs to this profile
    const existingLink = await query(
      'SELECT id FROM profile_links WHERE id = $1 AND profile_id = $2',
      [linkId, profileId]
    );

    if (existingLink.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Validate URL if provided
    if (body.url) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const allowedFields = ['title', 'url', 'category', 'position', 'is_visible'];
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

    // Update the link
    updateValues.push(linkId, profileId);
    const updateResult = await query(`
      UPDATE profile_links 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND profile_id = $${paramCount + 1}
      RETURNING id, title, url, category, position, is_visible, click_count, auto_detected, created_at
    `, updateValues);

    return NextResponse.json({
      success: true,
      link: updateResult.rows[0],
      message: 'Link updated successfully'
    });

  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/[identifier]/links/[linkId] - Delete specific link
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier, linkId } = params;
    
    if (!identifier || !linkId) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier and link ID are required' },
        { status: 400 }
      );
    }

    const profileId = await getProfileId(identifier);
    
    if (!profileId) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    const result = await query(
      'DELETE FROM profile_links WHERE id = $1 AND profile_id = $2 RETURNING title, url',
      [linkId, profileId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    const deletedLink = result.rows[0];

    return NextResponse.json({
      success: true,
      message: `Link '${deletedLink.title}' deleted successfully`,
      deleted_link: deletedLink
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/profiles/[identifier]/links/[linkId] - Special actions (like incrementing click count)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier, linkId } = params;
    const body = await request.json();
    
    if (!identifier || !linkId) {
      return NextResponse.json(
        { success: false, error: 'Profile identifier and link ID are required' },
        { status: 400 }
      );
    }

    const profileId = await getProfileId(identifier);
    
    if (!profileId) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Profile not found with ${isNumeric(identifier) ? 'FID' : 'username'}: ${identifier}` 
        },
        { status: 404 }
      );
    }

    const { action } = body;

    if (action === 'click') {
      // Increment click count
      const result = await query(`
        UPDATE profile_links 
        SET click_count = click_count + 1
        WHERE id = $1 AND profile_id = $2
        RETURNING id, title, url, click_count
      `, [linkId, profileId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Link not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Click count incremented',
        link: result.rows[0]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Supported actions: click' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error performing link action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform link action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
