import { NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET() {
  try {
    const [history] = await db.execute(`
      SELECT
        lh.id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.team,
        lh.login_time,
        lh.logout_time,
        lh.ip_address,
        lh.user_agent
      FROM login_history lh
      INNER JOIN users u
        ON lh.user_id = u.id
      ORDER BY lh.login_time DESC
    `);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("LOGIN HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch login history",
      },
      { status: 500 }
    );
  }
}