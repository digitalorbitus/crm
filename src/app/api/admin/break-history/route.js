
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";

// ======================================================
// GET BREAK HISTORY
// ======================================================
export async function GET(request) {
  try {
    // ==================================================
    // GET LOGIN TOKEN
    // ==================================================
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required",
        },
        { status: 401 }
      );
    }

    // ==================================================
    // VERIFY TOKEN
    // ==================================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const currentUserId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      null;

    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found",
        },
        { status: 401 }
      );
    }

    // ==================================================
    // CHECK CURRENT USER
    // ==================================================
    const [currentUserRows] = await pool.query(
      `
      SELECT id, name, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [currentUserId]
    );

    if (
      !currentUserRows ||
      currentUserRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const currentUser = currentUserRows[0];

    const currentRole = String(
      currentUser.role || ""
    ).toLowerCase();

    // ==================================================
    // GET BREAK HISTORY
    // ==================================================
    let rows;

    if (currentRole === "admin") {
      // -----------------------------------------------
      // ADMIN → ALL USERS
      // -----------------------------------------------
      [rows] = await pool.query(`
        SELECT
          h.id,
          h.user_id,
          u.name,
          u.email,
          u.team,
          u.role,
          h.status AS break_type,
          h.started_at,
          h.ended_at,
          h.duration_seconds,
          h.created_at
        FROM user_status_history h
        LEFT JOIN users u
          ON u.id = h.user_id
        WHERE h.status IN (
          'Namaz Break',
          'Lunch Break',
          'Washroom Break',
          'Other'
        )
        ORDER BY h.started_at DESC
      `);
    } else {
      // -----------------------------------------------
      // NORMAL USER → OWN BREAKS
      // -----------------------------------------------
      [rows] = await pool.query(
        `
        SELECT
          h.id,
          h.user_id,
          u.name,
          u.email,
          u.team,
          u.role,
          h.status AS break_type,
          h.started_at,
          h.ended_at,
          h.duration_seconds,
          h.created_at
        FROM user_status_history h
        LEFT JOIN users u
          ON u.id = h.user_id
        WHERE h.user_id = ?
          AND h.status IN (
            'Namaz Break',
            'Lunch Break',
            'Washroom Break',
            'Other'
          )
        ORDER BY h.started_at DESC
        `,
        [currentUserId]
      );
    }

    // ==================================================
    // FORMAT DATA
    // ==================================================
    const breaks = rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,

      name: row.name || "Unknown User",
      email: row.email || "",
      team: row.team || "",
      role: row.role || "user",

      break_type: row.break_type || "Other",

      started_at: row.started_at || null,
      ended_at: row.ended_at || null,

      duration_seconds:
        row.duration_seconds !== null
          ? Number(row.duration_seconds)
          : null,

      created_at: row.created_at || null,
    }));

    // ==================================================
    // STATS
    // ==================================================
    const stats = {
      total: breaks.length,

      namaz: breaks.filter(
        (item) =>
          item.break_type === "Namaz Break"
      ).length,

      lunch: breaks.filter(
        (item) =>
          item.break_type === "Lunch Break"
      ).length,

      washroom: breaks.filter(
        (item) =>
          item.break_type === "Washroom Break"
      ).length,

      other: breaks.filter(
        (item) =>
          item.break_type === "Other"
      ).length,
    };

    // ==================================================
    // RESPONSE
    // ==================================================
    return NextResponse.json(
      {
        success: true,
        breaks,
        stats,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "BREAK HISTORY API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch break history",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

