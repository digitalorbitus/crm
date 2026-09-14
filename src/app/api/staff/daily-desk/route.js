// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import pool from "../../../lib/db";

// export async function GET(request) {
//   try {
//     // Login user token
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Login token nahi mila",
//         },
//         { status: 401 }
//       );
//     }

//     // Token verify
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const staffId =
//       decoded.id ||
//       decoded._id ||
//       decoded.userId;

//     if (!staffId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Staff ID token mein nahi mili",
//         },
//         { status: 401 }
//       );
//     }

//     // Today's assignments
//     const [rows] = await pool.query(
//       `
//       SELECT
//         dda.id AS assignment_id,
//         ddt.task_id,
//         ddt.phone,
//         ddt.source_file,
//         dda.staff_id,
//         dda.assigned_date,
//         dda.assigned_at,
//         dda.completed_at,
//         dda.status
//       FROM daily_desk_assignments dda
//       INNER JOIN daily_desk_tasks ddt
//         ON dda.task_id = ddt.id
//       WHERE dda.staff_id = ?
//         AND dda.assigned_date = CURDATE()
//       ORDER BY dda.id ASC
//       `,
//       [staffId]
//     );

//     return NextResponse.json({
//       success: true,
//       data: rows,
//     });
//   } catch (error) {
//     console.error("STAFF DAILY DESK API ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Daily Desk data fetch nahi hua",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export async function GET(request) {
  try {
    // =====================================================
    // GET LOGIN TOKEN
    // =====================================================

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

    // =====================================================
    // VERIFY TOKEN
    // =====================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

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

    // =====================================================
    // GET TODAY'S ASSIGNMENTS
    // =====================================================

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

    // =====================================================
    // CHECK ZOOM CALL HISTORY
    // =====================================================

    for (const assignment of rows) {

      // Already completed hai to dobara check ki zaroorat nahi
      if (assignment.status === "completed") {
        continue;
      }

      if (!assignment.phone) {
        continue;
      }

      // ---------------------------------------------------
      // Normalize phone number
      // ---------------------------------------------------

      const cleanPhone = String(assignment.phone)
        .replace(/\D/g, "");

      if (!cleanPhone) {
        continue;
      }

      // ===================================================
      // FIND COMPLETED ZOOM CALL
      // ===================================================

      const [calls] = await pool.query(
        `
        SELECT
          id,
          call_id,
          call_history_uuid,
          direction,
          call_type,
          status,
          caller_number,
          callee_number,
          start_time,
          end_time,
          duration
        FROM zoom_call_logs

        WHERE user_id = ?

          AND (
            REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
            OR
            REPLACE(REPLACE(REPLACE(REPLACE(callee_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
          )

          AND (
            status IN (
              'completed',
              'answered',
              'connected'
            )
            OR duration > 0
          )

          AND DATE(start_time) = CURDATE()

        ORDER BY start_time DESC

        LIMIT 1
        `,
        [
          staffId,
          `%${cleanPhone}%`,
          `%${cleanPhone}%`,
        ]
      );

      // ===================================================
      // CALL MIL GAYI
      // ===================================================

      if (calls.length > 0) {

        const call = calls[0];

        // -------------------------------------------------
        // Mark assignment completed
        // -------------------------------------------------

        await pool.query(
          `
          UPDATE daily_desk_assignments

          SET
            status = 'completed',
            completed_at = COALESCE(?, NOW())

          WHERE id = ?
            AND staff_id = ?
            AND status <> 'completed'
          `,
          [
            call.end_time || call.start_time || null,
            assignment.assignment_id,
            staffId,
          ]
        );

        // -------------------------------------------------
        // Update response object immediately
        // -------------------------------------------------

        assignment.status = "completed";

        assignment.completed_at =
          call.end_time ||
          call.start_time ||
          new Date();

        // Optional Zoom information
        assignment.zoom_call = {
          call_id: call.call_id,
          direction: call.direction,
          call_type: call.call_type,
          status: call.status,
          start_time: call.start_time,
          end_time: call.end_time,
          duration: call.duration,
        };
      }
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,
      data: rows,
    });

  } catch (error) {

    console.error(
      "STAFF DAILY DESK API ERROR:",
      error
    );

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