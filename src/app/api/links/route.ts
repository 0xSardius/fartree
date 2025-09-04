import { NextResponse } from "next/server"
import { query } from "~/lib/db" // Import your Neon client

export async function POST(request: Request) {
  try {
    const { profileId, title, url, category, isVisible, autoDetected } = await request.json()

    if (!profileId || !title || !url) {
      return NextResponse.json({ error: "Missing required link data" }, { status: 400 })
    }

    // Get the current max position for the profile's links to determine the new link's position
    const maxPositionResult = await sql`
      SELECT COALESCE(MAX(position), -1) AS max_pos FROM profile_links WHERE profile_id = ${profileId}
    `
    const newPosition = (maxPositionResult[0].max_pos || -1) + 1

    const newLink = await sql`
      INSERT INTO profile_links (profile_id, title, url, category, is_visible, auto_detected, position)
      VALUES (${profileId}, ${title}, ${url}, ${category || "other"}, ${isVisible || true}, ${autoDetected || false}, ${newPosition})
      RETURNING id, title, url, category, position;
    `

    return NextResponse.json({
      success: true,
      message: "Link added successfully.",
      link: newLink[0],
    })
  } catch (error) {
    console.error("Error adding link:", error)
    return NextResponse.json({ error: "Internal server error when adding link." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, url, category, isVisible, position } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing link ID" }, { status: 400 })
    }

    const updatedLink = await sql`
      UPDATE profile_links
      SET
        title = COALESCE(${title}, title),
        url = COALESCE(${url}, url),
        category = COALESCE(${category}, category),
        is_visible = COALESCE(${isVisible}, is_visible),
        position = COALESCE(${position}, position),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, url, category, position, is_visible;
    `

    if (updatedLink.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Link updated successfully.",
      link: updatedLink[0],
    })
  } catch (error) {
    console.error("Error updating link:", error)
    return NextResponse.json({ error: "Internal server error when updating link." }, { status: 500 })
  }
}
