
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";

// ==========================================
// GET ALL STAFF AVAILABILITY
// ==========================================

export async function GET(request) {
  try {
    // ==========================================
    // GET TOKEN
    // ==========================================

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

    // ==========================================
    // VERIFY TOKEN
    // ==========================================

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

    // ==========================================
    // CHECK CURRENT USER ROLE
    // ==========================================

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

    // ==========================================
    // ADMIN ONLY
    // ==========================================

    if (currentRole !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // GET ALL STAFF
    // ==========================================

    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        availability_status
      FROM users
      ORDER BY
        CASE
          WHEN role = 'admin' THEN 0
          ELSE 1
        END,
        name ASC
    `);

    // ==========================================
    // FORMAT STAFF
    // ==========================================

    const staff = rows.map((user) => ({
      id: user.id,
      name: user.name || "Unknown User",
      email: user.email || "",
      role: user.role || "user",
      availability_status:
        user.availability_status || "Active",
    }));

    // ==========================================
    // STATUS COUNTS
    // ==========================================

    const counts = {
      total: staff.length,
      active: 0,
      namazBreak: 0,
      lunchBreak: 0,
      inactive: 0,
      onCall: 0,
      washroomBreak: 0,
      other: 0,
    };

    staff.forEach((user) => {
      switch (user.availability_status) {
        case "Active":
          counts.active++;
          break;

        case "Namaz Break":
          counts.namazBreak++;
          break;

        case "Lunch Break":
          counts.lunchBreak++;
          break;

        case "Inactive":
          counts.inactive++;
          break;

        case "On Call":
          counts.onCall++;
          break;

        case "Washroom Break":
          counts.washroomBreak++;
          break;

        case "Other":
          counts.other++;
          break;

        default:
          counts.active++;
          break;
      }
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        data: staff,
        counts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN STAFF STATUS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch staff availability",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

