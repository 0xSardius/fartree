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

// Helper function to get profile ID from identifier
async function getProfileId(identifier: string) {
  let result;

  if (isNumeric(identifier)) {
    result = await query("SELECT id FROM profiles WHERE fid = $1", [
      parseInt(identifier),
    ]);
  } else {
    result = await query("SELECT id FROM profiles WHERE username = $1", [
      identifier,
    ]);
  }

  return result.rows.length > 0 ? result.rows[0].id : null;
}

// GET /api/profiles/[identifier]/links - Get all links for a profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = await params;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Profile identifier is required" },
        { status: 400 }
      );
    }

    const profileId = await getProfileId(identifier);

    if (!profileId) {
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

    // Get query parameters
    const url = new URL(request.url);
    const includeHidden = url.searchParams.get("include_hidden") === "true";
    const category = url.searchParams.get("category");

    // Build query
    let queryText = `
      SELECT id, title, url, category, position, is_visible, click_count, auto_detected, created_at
      FROM profile_links 
      WHERE profile_id = $1
    `;
    const queryParams = [profileId];
    let paramCount = 2;

    if (!includeHidden) {
      queryText += " AND is_visible = true";
    }

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    queryText += " ORDER BY position ASC, created_at ASC";

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      links: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching profile links:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile links",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/profiles/[identifier]/links - Create a new link for a profile
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { identifier } = await params;
    const body = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Profile identifier is required" },
        { status: 400 }
      );
    }

    const profileId = await getProfileId(identifier);

    if (!profileId) {
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

    const {
      title,
      category,
      position,
      is_visible = true,
      auto_detected = false,
    } = body;
    let { url } = body;

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title and url are required",
        },
        { status: 400 }
      );
    }

    // Auto-add https:// if protocol is missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid URL format. Please use a valid URL like: https://example.com",
        },
        { status: 400 }
      );
    }

    // If position not specified, set it to the next available position
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPositionResult = await query(
        "SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM profile_links WHERE profile_id = $1",
        [profileId]
      );
      finalPosition = maxPositionResult.rows[0].next_position;
    }

    // Create the link
    const result = await query(
      `
      INSERT INTO profile_links (profile_id, title, url, category, position, is_visible, auto_detected)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, url, category, position, is_visible, click_count, auto_detected, created_at
    `,
      [
        profileId,
        title,
        url,
        category,
        finalPosition,
        is_visible,
        auto_detected,
      ]
    );

    const newLink = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        link: newLink,
        message: "Link created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating profile link:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create profile link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
