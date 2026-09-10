import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET() {
  try {
    const [users] = await db.query(`
      SELECT
        id,
        name,
        email,
        role,
        department,
        status,
        zoom_extension
      FROM users
      ORDER BY id ASC
    `);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("STAFF LIST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load staff",
      },
      { status: 500 }
    );
  }
}