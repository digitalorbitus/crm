import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export async function GET(request) {
  try {
    // Login user token
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Login token nahi mila",
        },
        { status: 401 }
      );
    }

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const staffId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff ID token mein nahi mili",
        },
        { status: 401 }
      );
    }

    // Today's assignments
    const [rows] = await pool.query(
      `
      SELECT
        dda.id AS assignment_id,
        ddt.task_id,
        ddt.phone,
        ddt.source_file,
        dda.staff_id,
        dda.assigned_date,
        dda.assigned_at,
        dda.completed_at,
        dda.status
      FROM daily_desk_assignments dda
      INNER JOIN daily_desk_tasks ddt
        ON dda.task_id = ddt.id
      WHERE dda.staff_id = ?
        AND dda.assigned_date = CURDATE()
      ORDER BY dda.id ASC
      `,
      [staffId]
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("STAFF DAILY DESK API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Daily Desk data fetch nahi hua",
        error: error.message,
      },
      { status: 500 }
    );
  }
}