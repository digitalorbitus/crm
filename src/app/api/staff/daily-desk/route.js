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




// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import pool from "../../../lib/db";

// export async function GET(request) {
//   try {
//     // =====================================================
//     // GET LOGIN TOKEN
//     // =====================================================

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

//     // =====================================================
//     // VERIFY TOKEN
//     // =====================================================

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

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

//     // =====================================================
//     // GET TODAY'S ASSIGNMENTS
//     // =====================================================

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

//     // =====================================================
//     // CHECK ZOOM CALL HISTORY
//     // =====================================================

//     for (const assignment of rows) {

//       // Already completed hai to dobara check ki zaroorat nahi
//       if (assignment.status === "completed") {
//         continue;
//       }

//       if (!assignment.phone) {
//         continue;
//       }

//       // ---------------------------------------------------
//       // Normalize phone number
//       // ---------------------------------------------------

//       const cleanPhone = String(assignment.phone)
//         .replace(/\D/g, "");

//       if (!cleanPhone) {
//         continue;
//       }

//       // ===================================================
//       // FIND COMPLETED ZOOM CALL
//       // ===================================================

//       const [calls] = await pool.query(
//         `
//         SELECT
//           id,
//           call_id,
//           call_history_uuid,
//           direction,
//           call_type,
//           status,
//           caller_number,
//           callee_number,
//           start_time,
//           end_time,
//           duration
//         FROM zoom_call_logs

//         WHERE user_id = ?

//           AND (
//             REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
//             OR
//             REPLACE(REPLACE(REPLACE(REPLACE(callee_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
//           )

//           AND (
//             status IN (
//               'completed',
//               'answered',
//               'connected'
//             )
//             OR duration > 0
//           )

//           AND DATE(start_time) = CURDATE()

//         ORDER BY start_time DESC

//         LIMIT 1
//         `,
//         [
//           staffId,
//           `%${cleanPhone}%`,
//           `%${cleanPhone}%`,
//         ]
//       );

//       // ===================================================
//       // CALL MIL GAYI
//       // ===================================================

//       if (calls.length > 0) {

//         const call = calls[0];

//         // -------------------------------------------------
//         // Mark assignment completed
//         // -------------------------------------------------

//         await pool.query(
//           `
//           UPDATE daily_desk_assignments

//           SET
//             status = 'completed',
//             completed_at = COALESCE(?, NOW())

//           WHERE id = ?
//             AND staff_id = ?
//             AND status <> 'completed'
//           `,
//           [
//             call.end_time || call.start_time || null,
//             assignment.assignment_id,
//             staffId,
//           ]
//         );

//         // -------------------------------------------------
//         // Update response object immediately
//         // -------------------------------------------------

//         assignment.status = "completed";

//         assignment.completed_at =
//           call.end_time ||
//           call.start_time ||
//           new Date();

//         // Optional Zoom information
//         assignment.zoom_call = {
//           call_id: call.call_id,
//           direction: call.direction,
//           call_type: call.call_type,
//           status: call.status,
//           start_time: call.start_time,
//           end_time: call.end_time,
//           duration: call.duration,
//         };
//       }
//     }

//     // =====================================================
//     // RESPONSE
//     // =====================================================

//     return NextResponse.json({
//       success: true,
//       data: rows,
//     });

//   } catch (error) {

//     console.error(
//       "STAFF DAILY DESK API ERROR:",
//       error
//     );

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


// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import pool from "../../../lib/db";

// export async function GET(request) {
//   try {
//     // =====================================================
//     // GET LOGIN TOKEN
//     // =====================================================

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

//     // =====================================================
//     // VERIFY TOKEN
//     // =====================================================

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

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

//     // =====================================================
//     // GET DATE FROM URL
//     // Example:
//     // /api/staff/daily-desk?date=2026-09-18
//     // =====================================================

//     const { searchParams } = new URL(request.url);

//     const requestedDate =
//       searchParams.get("date") ||
//       new Date().toISOString().slice(0, 10);

//     // Basic date validation
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid date format. Use YYYY-MM-DD",
//         },
//         { status: 400 }
//       );
//     }

//     // =====================================================
//     // GET DAILY DESK ASSIGNMENTS
//     // =====================================================

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
//         AND DATE(dda.assigned_date) = ?

//       ORDER BY dda.id ASC
//       `,
//       [staffId, requestedDate]
//     );

//     // =====================================================
//     // CHECK ZOOM CALL HISTORY
//     // =====================================================

//     for (const assignment of rows) {
//       try {
//         // ---------------------------------------------------
//         // Already completed
//         // ---------------------------------------------------

//         if (assignment.status === "completed") {
//           continue;
//         }

//         // ---------------------------------------------------
//         // No phone
//         // ---------------------------------------------------

//         if (!assignment.phone) {
//           continue;
//         }

//         // ---------------------------------------------------
//         // Normalize phone number
//         // ---------------------------------------------------

//         const cleanPhone = String(assignment.phone)
//           .replace(/\D/g, "");

//         if (!cleanPhone) {
//           continue;
//         }

//         // ===================================================
//         // FIND COMPLETED ZOOM CALL
//         //
//         // IMPORTANT:
//         // `call_id` removed because it does not exist
//         // in zoom_call_logs.
//         // ===================================================

//         const [calls] = await pool.query(
//           `
//           SELECT
//             id,
//             call_history_uuid,
//             direction,
//             call_type,
//             status,
//             caller_number,
//             callee_number,
//             start_time,
//             end_time,
//             duration

//           FROM zoom_call_logs

//           WHERE user_id = ?

//             AND (
//               REPLACE(
//                 REPLACE(
//                   REPLACE(
//                     REPLACE(caller_number, '+', ''),
//                   '-', ''),
//                 ' ', ''),
//               '(', '') LIKE ?

//               OR

//               REPLACE(
//                 REPLACE(
//                   REPLACE(
//                     REPLACE(callee_number, '+', ''),
//                   '-', ''),
//                 ' ', ''),
//               '(', '') LIKE ?
//             )

//             AND (
//               status IN (
//                 'completed',
//                 'answered',
//                 'connected'
//               )

//               OR duration > 0
//             )

//             AND DATE(start_time) = ?

//           ORDER BY start_time DESC

//           LIMIT 1
//           `,
//           [
//             staffId,
//             `%${cleanPhone}%`,
//             `%${cleanPhone}%`,
//             requestedDate,
//           ]
//         );

//         // ===================================================
//         // CALL FOUND
//         // ===================================================

//         if (calls.length > 0) {
//           const call = calls[0];

//           // -------------------------------------------------
//           // MARK ASSIGNMENT COMPLETED
//           // -------------------------------------------------

//           await pool.query(
//             `
//             UPDATE daily_desk_assignments

//             SET
//               status = 'completed',
//               completed_at = COALESCE(?, NOW())

//             WHERE id = ?
//               AND staff_id = ?
//               AND status <> 'completed'
//             `,
//             [
//               call.end_time ||
//                 call.start_time ||
//                 null,

//               assignment.assignment_id,
//               staffId,
//             ]
//           );

//           // -------------------------------------------------
//           // UPDATE RESPONSE OBJECT
//           // -------------------------------------------------

//           assignment.status = "completed";

//           assignment.completed_at =
//             call.end_time ||
//             call.start_time ||
//             new Date();

//           // -------------------------------------------------
//           // ZOOM INFORMATION
//           // -------------------------------------------------

//           assignment.zoom_call = {
//             // Actual DB ID
//             call_id: call.id,

//             // Keep UUID separately if available
//             call_history_uuid:
//               call.call_history_uuid || null,

//             direction: call.direction,
//             call_type: call.call_type,
//             status: call.status,

//             caller_number:
//               call.caller_number,

//             callee_number:
//               call.callee_number,

//             start_time:
//               call.start_time,

//             end_time:
//               call.end_time,

//             duration:
//               call.duration,
//           };
//         }
//       } catch (callError) {
//         // One call lookup fail hone se poori Daily Desk API
//         // fail nahi hogi.

//         console.error(
//           "DAILY DESK CALL CHECK ERROR:",
//           callError
//         );
//       }
//     }

//     // =====================================================
//     // RESPONSE
//     // =====================================================

//     return NextResponse.json({
//       success: true,

//       date: requestedDate,

//       staff_id: staffId,

//       total: rows.length,

//       completed: rows.filter(
//         (item) =>
//           item.status === "completed"
//       ).length,

//       pending: rows.filter(
//         (item) =>
//           item.status !== "completed"
//       ).length,

//       data: rows,
//     });
//   } catch (error) {
//     console.error(
//       "STAFF DAILY DESK API ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Daily Desk data fetch nahi hua",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }











import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

// =====================================================
// CALIFORNIA TIMEZONE
// =====================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// Maximum Daily Desk tasks per staff per day
const DAILY_TASK_LIMIT = 500;

// =====================================================
// GET CALIFORNIA DATE
// Returns YYYY-MM-DD
// =====================================================

function getCaliforniaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// =====================================================
// GET CALIFORNIA DATE + TIME
// 24-HOUR FORMAT
// =====================================================

function getCaliforniaDateTime() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

// =====================================================
// GET
// =====================================================

export async function GET(request) {
  try {
    // ===================================================
    // GET LOGIN TOKEN
    // ===================================================

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

    // ===================================================
    // VERIFY JWT
    // ===================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "DAILY DESK JWT ERROR:",
        jwtError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid ya expired login token",
        },
        { status: 401 }
      );
    }

    // ===================================================
    // GET STAFF ID
    // ===================================================

    const staffId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    if (!staffId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff ID token mein nahi mili",
        },
        { status: 401 }
      );
    }

    // ===================================================
    // URL SEARCH PARAMS
    //
    // Example:
    //
    // /api/staff/daily-desk
    //
    // or
    //
    // /api/staff/daily-desk?date=2026-09-18
    // ===================================================

    const { searchParams } =
      new URL(request.url);

    // ===================================================
    // CALIFORNIA TODAY
    // ===================================================

    const californiaDate =
      getCaliforniaDate();

    const californiaDateTime =
      getCaliforniaDateTime();

    // ===================================================
    // REQUESTED DATE
    //
    // Agar URL mein date nahi hai to
    // California ki current date use hogi.
    // ===================================================

    const requestedDate =
      searchParams.get("date") ||
      californiaDate;

    // ===================================================
    // DATE VALIDATION
    // ===================================================

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        requestedDate
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid date format. Use YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    // ===================================================
    // DAILY DESK ASSIGNMENTS
    //
    // IMPORTANT:
    // Maximum 500 tasks per staff per day.
    // ===================================================

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
        AND DATE(dda.assigned_date) = ?

      ORDER BY dda.id ASC

      LIMIT ${DAILY_TASK_LIMIT}
      `,
      [
        staffId,
        requestedDate,
      ]
    );

    // ===================================================
    // CHECK ZOOM CALL HISTORY
    // ===================================================

    for (const assignment of rows) {
      try {
        // =================================================
        // ALREADY COMPLETED
        // =================================================

        if (
          assignment.status ===
          "completed"
        ) {
          continue;
        }

        // =================================================
        // NO PHONE
        // =================================================

        if (!assignment.phone) {
          continue;
        }

        // =================================================
        // NORMALIZE PHONE
        // =================================================

        const cleanPhone = String(
          assignment.phone
        ).replace(/\D/g, "");

        if (!cleanPhone) {
          continue;
        }

        // =================================================
        // FIND ZOOM CALL
        // =================================================

        const [calls] =
          await pool.query(
            `
            SELECT
              id,
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
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        caller_number,
                        '+',
                        ''
                      ),
                      '-',
                      ''
                    ),
                    ' ',
                    ''
                  ),
                  '(',
                  ''
                ) LIKE ?

                OR

                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        callee_number,
                        '+',
                        ''
                      ),
                      '-',
                      ''
                    ),
                    ' ',
                    ''
                  ),
                  '(',
                  ''
                ) LIKE ?
              )

              AND (
                status IN (
                  'completed',
                  'answered',
                  'connected'
                )

                OR duration > 0
              )

              AND DATE(start_time) = ?

            ORDER BY start_time DESC

            LIMIT 1
            `,
            [
              staffId,
              `%${cleanPhone}%`,
              `%${cleanPhone}%`,
              requestedDate,
            ]
          );

        // =================================================
        // CALL FOUND
        // =================================================

        if (calls.length > 0) {
          const call = calls[0];

          // ===============================================
          // MARK ASSIGNMENT COMPLETED
          // ===============================================

          await pool.query(
            `
            UPDATE daily_desk_assignments

            SET
              status = 'completed',
              completed_at = COALESCE(
                ?,
                NOW()
              )

            WHERE id = ?
              AND staff_id = ?
              AND status <> 'completed'
            `,
            [
              call.end_time ||
                call.start_time ||
                null,

              assignment.assignment_id,

              staffId,
            ]
          );

          // ===============================================
          // UPDATE RESPONSE
          // ===============================================

          assignment.status =
            "completed";

          assignment.completed_at =
            call.end_time ||
            call.start_time ||
            new Date();

          // ===============================================
          // ZOOM INFORMATION
          // ===============================================

          assignment.zoom_call = {
            call_id: call.id,

            call_history_uuid:
              call.call_history_uuid ||
              null,

            direction:
              call.direction ||
              null,

            call_type:
              call.call_type ||
              null,

            status:
              call.status ||
              null,

            caller_number:
              call.caller_number ||
              null,

            callee_number:
              call.callee_number ||
              null,

            start_time:
              call.start_time ||
              null,

            end_time:
              call.end_time ||
              null,

            duration:
              call.duration || 0,
          };
        }
      } catch (callError) {
        // ===============================================
        // ONE CALL ERROR SHOULD NOT BREAK API
        // ===============================================

        console.error(
          "DAILY DESK CALL CHECK ERROR:",
          callError
        );
      }
    }

    // ===================================================
    // COUNTS
    // ===================================================

    const total =
      rows.length;

    const completed =
      rows.filter(
        (item) =>
          item.status ===
          "completed"
      ).length;

    const pending =
      rows.filter(
        (item) =>
          item.status !==
          "completed"
      ).length;

    const remaining =
      Math.max(
        0,
        DAILY_TASK_LIMIT - total
      );

    // ===================================================
    // RESPONSE
    // ===================================================

    return NextResponse.json({
      success: true,

      // ================================================
      // DATE
      // ================================================

      date: requestedDate,

      // Current California date
      california_date:
        californiaDate,

      // Current California date/time
      california_datetime:
        californiaDateTime,

      timezone:
        CALIFORNIA_TIMEZONE,

      // ================================================
      // STAFF
      // ================================================

      staff_id: staffId,

      // ================================================
      // DAILY LIMIT
      // ================================================

      limit:
        DAILY_TASK_LIMIT,

      // ================================================
      // COUNTS
      // ================================================

      total,

      completed,

      pending,

      remaining,

      // ================================================
      // DATA
      // ================================================

      data: rows,
    });
  } catch (error) {
    // ===================================================
    // MAIN API ERROR
    // ===================================================

    console.error(
      "STAFF DAILY DESK API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Daily Desk data fetch nahi hua",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}