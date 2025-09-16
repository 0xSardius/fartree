import { NextResponse } from "next/server"
import { query } from "~/lib/db" // Import your Neon client

export async function POST(request: Request) {
  try {
    const { profileId, title, url, category, isVisible, autoDetected } = await request.json()

    if (!profileId || !title || !url) {
      return NextResponse.json({ error: "Missing required link data" }, { status: 400 })
    }

    // Get the current max position for the profile's links to determine the new link's position
    const maxPositionResult = await query(
      'SELECT COALESCE(MAX(position), -1) AS max_pos FROM profile_links WHERE profile_id = $1',
      [profileId]
    )
    const newPosition = (maxPositionResult.rows[0].max_pos || -1) + 1

    const newLink = await query(`
      INSERT INTO profile_links (profile_id, title, url, category, is_visible, auto_detected, position)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, url, category, position
    `, [profileId, title, url, category || "other", isVisible || true, autoDetected || false, newPosition])

    return NextResponse.json({
      success: true,
      message: "Link added successfully.",
      link: newLink.rows[0],
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

    // Build dynamic update query
    const updates = []
    const values = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }
    if (url !== undefined) {
      updates.push(`url = $${paramCount}`)
      values.push(url)
      paramCount++
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`)
      values.push(category)
      paramCount++
    }
    if (isVisible !== undefined) {
      updates.push(`is_visible = $${paramCount}`)
      values.push(isVisible)
      paramCount++
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount}`)
      values.push(position)
      paramCount++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id) // Add id as the last parameter

    const updateQuery = `
      UPDATE profile_links
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, url, category, position, is_visible, updated_at
    `

    const updatedLink = await query(updateQuery, values)

    if (updatedLink.rows.length === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Link updated successfully.",
      link: updatedLink.rows[0],
    })
  } catch (error) {
    console.error("Error updating link:", error)
    return NextResponse.json({ error: "Internal server error when updating link." }, { status: 500 })
  }
}
