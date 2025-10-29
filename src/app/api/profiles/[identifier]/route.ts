import { NextRequest, NextResponse } from "next/server";
import { query } from "~/lib/db";

type RouteParams = {
  params: Promise<{
    identifier: string;
  }>;
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
        { success: false, error: "Profile identifier is required" },
        { status: 400 }
      );
    }

    let result;

    if (isNumeric(identifier)) {
      // Search by FID
      result = await query(
        `
        SELECT 
          id, fid, username, display_name, bio, avatar_url, 
          theme, custom_domain, is_verified, created_at, updated_at
        FROM profiles 
        WHERE fid = $1
      `,
        [parseInt(identifier)]
      );
    } else {
      // Search by username
      result = await query(
        `
        SELECT 
          id, fid, username, display_name, bio, avatar_url, 
          theme, custom_domain, is_verified, created_at, updated_at
        FROM profiles 
        WHERE username = $1
      `,
        [identifier]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Profile not found with ${
            isNumeric(identifier) ? "FID" : "username"
          }: ${identifier}`,
        },
        { status: 404 }
      );
    }

    const profile = result.rows[0];

    // Also fetch profile links
    const linksResult = await query(
      `
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE profile_id = $1 AND is_visible = true
      ORDER BY position ASC, created_at ASC
    `,
      [profile.id]
    );

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        links: linksResult.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/profiles/[identifier] - Update profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = await params;
    const body = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Profile identifier is required" },
        { status: 400 }
      );
    }

    // Use UPSERT to create or update profile
    // For FID-based updates, we need the FID
    let fid: number | null = null;

    if (isNumeric(identifier)) {
      fid = parseInt(identifier);
    } else {
      // If updating by username, we need to look up the FID first
      const result = await query(
        "SELECT fid FROM profiles WHERE username = $1",
        [identifier]
      );
      if (result.rows.length > 0) {
        fid = result.rows[0].fid;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Profile not found with username: ${identifier}`,
          },
          { status: 404 }
        );
      }
    }

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "FID is required for profile update" },
        { status: 400 }
      );
    }

    // UPSERT query - insert if not exists, update if exists
    const upsertResult = await query(
      `
      INSERT INTO profiles (
        fid, 
        username,
        display_name, 
        bio, 
        avatar_url, 
        theme, 
        custom_domain,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (fid) 
      DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        bio = COALESCE(EXCLUDED.bio, profiles.bio),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        theme = COALESCE(EXCLUDED.theme, profiles.theme),
        custom_domain = COALESCE(EXCLUDED.custom_domain, profiles.custom_domain),
        updated_at = NOW()
      RETURNING id, fid, username, display_name, bio, avatar_url, theme, 
                custom_domain, is_verified, created_at, updated_at
    `,
      [
        fid,
        body.username || null,
        body.display_name || null,
        body.bio || null,
        body.avatar_url || null,
        body.theme || "default",
        body.custom_domain || null,
      ]
    );

    return NextResponse.json({
      success: true,
      profile: upsertResult.rows[0],
      message: "Profile saved successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/profiles/[identifier] - Delete profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = await params;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Profile identifier is required" },
        { status: 400 }
      );
    }

    let result;

    if (isNumeric(identifier)) {
      result = await query(
        "DELETE FROM profiles WHERE fid = $1 RETURNING id, username",
        [parseInt(identifier)]
      );
    } else {
      result = await query(
        "DELETE FROM profiles WHERE username = $1 RETURNING id, username",
        [identifier]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Profile not found with ${
            isNumeric(identifier) ? "FID" : "username"
          }: ${identifier}`,
        },
        { status: 404 }
      );
    }

    const deletedProfile = result.rows[0];

    return NextResponse.json({
      success: true,
      message: `Profile '${deletedProfile.username}' deleted successfully`,
      deleted_profile: deletedProfile,
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
