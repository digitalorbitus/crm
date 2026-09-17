






// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import pool from "../../../lib/db";

// export const runtime = "nodejs";

// // ==========================================
// // ALLOWED STATUS
// // ==========================================

// const ALLOWED_STATUSES = [
//   "Active",
//   "Namaz Break",
//   "Lunch Break",
//   "Inactive",
//   "On Call",
//   "Washroom Break",
//   "Other",
// ];

// // ==========================================
// // GET USER ID FROM JWT
// // ==========================================

// function getUserIdFromToken(request) {
//   const token = request.cookies.get("token")?.value;

//   if (!token) {
//     return null;
//   }

//   const decoded = jwt.verify(
//     token,
//     process.env.JWT_SECRET
//   );

//   return (
//     decoded.id ||
//     decoded._id ||
//     decoded.userId ||
//     null
//   );
// }

// // ==========================================
// // GET CURRENT USER STATUS
// // ==========================================

// export async function GET(request) {
//   try {
//     const userId = getUserIdFromToken(request);

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Login required",
//         },
//         { status: 401 }
//       );
//     }

//     const [rows] = await pool.query(
//       `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           availability_status
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//       `,
//       [userId]
//     );

//     if (!rows || rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     const user = rows[0];

//     return NextResponse.json(
//       {
//         success: true,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           availability_status:
//             user.availability_status || "Active",
//         },
//         status:
//           user.availability_status || "Active",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("GET USER STATUS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to get user status",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==========================================
// // UPDATE CURRENT USER STATUS
// // ==========================================

// export async function PUT(request) {
//   try {
//     const userId = getUserIdFromToken(request);

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Login required",
//         },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();

//     const newStatus = body?.status;

//     // ==========================================
//     // VALIDATE STATUS
//     // ==========================================

//     if (!newStatus) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Status is required",
//         },
//         { status: 400 }
//       );
//     }

//     if (!ALLOWED_STATUSES.includes(newStatus)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid availability status",
//           allowedStatuses: ALLOWED_STATUSES,
//         },
//         { status: 400 }
//       );
//     }

//     // ==========================================
//     // UPDATE DATABASE
//     // ==========================================

//     const [result] = await pool.query(
//       `
//         UPDATE users
//         SET availability_status = ?
//         WHERE id = ?
//       `,
//       [newStatus, userId]
//     );

//     if (result.affectedRows === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     // ==========================================
//     // GET UPDATED USER
//     // ==========================================

//     const [rows] = await pool.query(
//       `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           availability_status
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//       `,
//       [userId]
//     );

//     const user = rows[0];

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Availability status updated successfully",

//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           availability_status:
//             user.availability_status || "Active",
//         },

//         status:
//           user.availability_status || "Active",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("UPDATE USER STATUS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to update availability status",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

















// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import pool from "../../../lib/db";

// export const runtime = "nodejs";

// // ==========================================
// // ALLOWED STATUS
// // ==========================================

// const ALLOWED_STATUSES = [
//   "Active",
//   "Namaz Break",
//   "Lunch Break",
//   "Short Break",
//   "Inactive",
//   "On Call",
//   "Meeting",
//   "Other",
// ];

// // ==========================================
// // GET USER ID FROM JWT
// // ==========================================

// function getUserIdFromToken(request) {
//   const token = request.cookies.get("token")?.value;

//   if (!token) {
//     return null;
//   }

//   const decoded = jwt.verify(
//     token,
//     process.env.JWT_SECRET
//   );

//   return (
//     decoded.id ||
//     decoded._id ||
//     decoded.userId ||
//     null
//   );
// }

// // ==========================================
// // GET CURRENT USER STATUS
// // ==========================================

// export async function GET(request) {
//   try {
//     const userId = getUserIdFromToken(request);

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Login required",
//         },
//         { status: 401 }
//       );
//     }

//     const [rows] = await pool.query(
//       `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           availability_status,
//           status_started_at
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//       `,
//       [userId]
//     );

//     if (!rows || rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     const user = rows[0];

//     return NextResponse.json(
//       {
//         success: true,

//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,

//           availability_status:
//             user.availability_status || "Active",

//           status_started_at:
//             user.status_started_at || null,
//         },

//         status:
//           user.availability_status || "Active",

//         status_started_at:
//           user.status_started_at || null,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(
//       "GET USER STATUS ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to get user status",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// // ==========================================
// // UPDATE CURRENT USER STATUS
// // ==========================================

// export async function PUT(request) {
//   let connection;

//   try {
//     // ========================================
//     // GET USER ID
//     // ========================================

//     const userId = getUserIdFromToken(request);

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Login required",
//         },
//         { status: 401 }
//       );
//     }

//     // ========================================
//     // GET REQUEST BODY
//     // ========================================

//     const body = await request.json();

//     const newStatus = body?.status;

//     // ========================================
//     // VALIDATE STATUS
//     // ========================================

//     if (!newStatus) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Status is required",
//         },
//         { status: 400 }
//       );
//     }

//     if (!ALLOWED_STATUSES.includes(newStatus)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid availability status",
//           allowedStatuses: ALLOWED_STATUSES,
//         },
//         { status: 400 }
//       );
//     }

//     // ========================================
//     // CREATE DB CONNECTION
//     // ========================================

//     connection =
//       await pool.getConnection();

//     // ========================================
//     // START TRANSACTION
//     // ========================================

//     await connection.beginTransaction();

//     // ========================================
//     // GET CURRENT USER STATUS
//     // FOR UPDATE = LOCK USER ROW
//     // ========================================

//     const [currentRows] =
//       await connection.query(
//         `
//           SELECT
//             id,
//             name,
//             email,
//             role,
//             availability_status,
//             status_started_at
//           FROM users
//           WHERE id = ?
//           LIMIT 1
//           FOR UPDATE
//         `,
//         [userId]
//       );

//     if (
//       !currentRows ||
//       currentRows.length === 0
//     ) {
//       await connection.rollback();

//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     const currentUser =
//       currentRows[0];

//     const currentStatus =
//       currentUser.availability_status ||
//       "Active";

//     const currentStartedAt =
//       currentUser.status_started_at;

//     // ========================================
//     // SAME STATUS
//     // Don't create duplicate history
//     // ========================================

//     if (
//       currentStatus === newStatus
//     ) {
//       await connection.commit();

//       return NextResponse.json(
//         {
//           success: true,

//           message:
//             "Status is already set",

//           user: {
//             id: currentUser.id,
//             name: currentUser.name,
//             email: currentUser.email,
//             role: currentUser.role,

//             availability_status:
//               currentStatus,

//             status_started_at:
//               currentStartedAt || null,
//           },

//           status: currentStatus,

//           status_started_at:
//             currentStartedAt || null,

//           duration_seconds: null,
//         },
//         { status: 200 }
//       );
//     }

//     // ========================================
//     // CLOSE CURRENT OPEN HISTORY
//     // ========================================
//     //
//     // If current status is non-active,
//     // there should be an open history row.
//     //
//     // Example:
//     //
//     // Lunch Break
//     // 02:00 PM -> NULL
//     //
//     // User changes to Active
//     //
//     // becomes:
//     //
//     // Lunch Break
//     // 02:00 PM -> 02:35 PM
//     //
//     // duration = 2100 seconds
//     // ========================================

//     let closedDurationSeconds =
//       null;

//     if (
//       currentStatus !== "Active" &&
//       currentStartedAt
//     ) {
//       // ======================================
//       // FIND OPEN HISTORY RECORD
//       // ======================================

//       const [openHistoryRows] =
//         await connection.query(
//           `
//             SELECT
//               id,
//               started_at
//             FROM user_status_history
//             WHERE
//               user_id = ?
//               AND ended_at IS NULL
//             ORDER BY id DESC
//             LIMIT 1
//             FOR UPDATE
//           `,
//           [userId]
//         );

//       // ======================================
//       // IF OPEN HISTORY EXISTS
//       // ======================================

//       if (
//         openHistoryRows &&
//         openHistoryRows.length > 0
//       ) {
//         const history =
//           openHistoryRows[0];

//         // ====================================
//         // CLOSE HISTORY
//         // ====================================

//         const [closeResult] =
//           await connection.query(
//             `
//               UPDATE user_status_history
//               SET
//                 ended_at = NOW(),
//                 duration_seconds =
//                   TIMESTAMPDIFF(
//                     SECOND,
//                     started_at,
//                     NOW()
//                   )
//               WHERE id = ?
//             `,
//             [history.id]
//           );

//         // ====================================
//         // GET FINAL DURATION
//         // ====================================

//         if (
//           closeResult.affectedRows > 0
//         ) {
//           const [
//             durationRows,
//           ] =
//             await connection.query(
//               `
//                 SELECT
//                   duration_seconds
//                 FROM user_status_history
//                 WHERE id = ?
//                 LIMIT 1
//               `,
//               [history.id]
//             );

//           if (
//             durationRows &&
//             durationRows.length > 0
//           ) {
//             closedDurationSeconds =
//               durationRows[0]
//                 .duration_seconds;
//           }
//         }
//       } else {
//         // ====================================
//         // SAFETY FALLBACK
//         //
//         // If history row doesn't exist,
//         // create a completed history record
//         // from users.status_started_at.
//         // ====================================

//         const [fallbackResult] =
//           await connection.query(
//             `
//               INSERT INTO user_status_history
//               (
//                 user_id,
//                 status,
//                 started_at,
//                 ended_at,
//                 duration_seconds
//               )
//               VALUES
//               (
//                 ?,
//                 ?,
//                 ?,
//                 NOW(),
//                 TIMESTAMPDIFF(
//                   SECOND,
//                   ?,
//                   NOW()
//                 )
//               )
//             `,
//             [
//               userId,
//               currentStatus,
//               currentStartedAt,
//               currentStartedAt,
//             ]
//           );

//         if (
//           fallbackResult.insertId
//         ) {
//           const [
//             durationRows,
//           ] =
//             await connection.query(
//               `
//                 SELECT
//                   duration_seconds
//                 FROM user_status_history
//                 WHERE id = ?
//                 LIMIT 1
//               `,
//               [
//                 fallbackResult.insertId,
//               ]
//             );

//           if (
//             durationRows &&
//             durationRows.length > 0
//           ) {
//             closedDurationSeconds =
//               durationRows[0]
//                 .duration_seconds;
//           }
//         }
//       }
//     }

//     // ========================================
//     // NEW STATUS = ACTIVE
//     // ========================================

//     if (newStatus === "Active") {
//       const [result] =
//         await connection.query(
//           `
//             UPDATE users
//             SET
//               availability_status = ?,
//               status_started_at = NULL
//             WHERE id = ?
//           `,
//           [
//             "Active",
//             userId,
//           ]
//         );

//       if (
//         result.affectedRows === 0
//       ) {
//         await connection.rollback();

//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "User not found",
//           },
//           { status: 404 }
//         );
//       }
//     }

//     // ========================================
//     // NEW STATUS = NON ACTIVE
//     // ========================================

//     else {
//       // ======================================
//       // INSERT NEW OPEN HISTORY
//       // ======================================

//       await connection.query(
//         `
//           INSERT INTO user_status_history
//           (
//             user_id,
//             status,
//             started_at,
//             ended_at,
//             duration_seconds
//           )
//           VALUES
//           (
//             ?,
//             ?,
//             NOW(),
//             NULL,
//             NULL
//           )
//         `,
//         [
//           userId,
//           newStatus,
//         ]
//       );

//       // ======================================
//       // UPDATE USER CURRENT STATUS
//       // ======================================

//       const [result] =
//         await connection.query(
//           `
//             UPDATE users
//             SET
//               availability_status = ?,
//               status_started_at = NOW()
//             WHERE id = ?
//           `,
//           [
//             newStatus,
//             userId,
//           ]
//         );

//       if (
//         result.affectedRows === 0
//       ) {
//         await connection.rollback();

//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "User not found",
//           },
//           { status: 404 }
//         );
//       }
//     }

//     // ========================================
//     // GET UPDATED USER
//     // ========================================

//     const [rows] =
//       await connection.query(
//         `
//           SELECT
//             id,
//             name,
//             email,
//             role,
//             availability_status,
//             status_started_at
//           FROM users
//           WHERE id = ?
//           LIMIT 1
//         `,
//         [userId]
//       );

//     if (
//       !rows ||
//       rows.length === 0
//     ) {
//       await connection.rollback();

//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     const user = rows[0];

//     // ========================================
//     // COMMIT EVERYTHING
//     // ========================================

//     await connection.commit();

//     // ========================================
//     // RESPONSE
//     // ========================================

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Availability status updated successfully",

//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,

//           availability_status:
//             user.availability_status ||
//             "Active",

//           status_started_at:
//             user.status_started_at ||
//             null,
//         },

//         status:
//           user.availability_status ||
//           "Active",

//         status_started_at:
//           user.status_started_at ||
//           null,

//         // Duration of the status
//         // that was just closed.
//         duration_seconds:
//           closedDurationSeconds,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     // ========================================
//     // ROLLBACK
//     // ========================================

//     if (connection) {
//       try {
//         await connection.rollback();
//       } catch (rollbackError) {
//         console.error(
//           "ROLLBACK ERROR:",
//           rollbackError
//         );
//       }
//     }

//     console.error(
//       "UPDATE USER STATUS ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Failed to update availability status",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   } finally {
//     // ========================================
//     // RELEASE CONNECTION
//     // ========================================

//     if (connection) {
//       connection.release();
//     }
//   }
// }
















import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";

// ============================================================
// CALIFORNIA TIMEZONE
// ============================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// ============================================================
// ALLOWED STATUS
// ============================================================

const ALLOWED_STATUSES = [
  "Active",
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Washroom Break",
  "Inactive",
  "On Call",
  "Meeting",
  "Other",
];

// ============================================================
// BREAK STATUSES
// ============================================================
// Only these statuses count toward the 5-break limit.
//
// Active       ❌
// Inactive     ❌
// On Call      ❌
// Meeting      ❌
//
// Namaz Break  ✅
// Lunch Break  ✅
// Short Break  ✅
// Washroom     ✅
// Other        ✅

const BREAK_STATUSES = [
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Washroom Break",
  "Other",
];

const MAX_BREAKS_PER_24_HOURS = 5;

// ============================================================
// GET USER ID FROM JWT
// ============================================================

function getUserIdFromToken(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  return (
    decoded.id ||
    decoded._id ||
    decoded.userId ||
    null
  );
}

// ============================================================
// CALIFORNIA DATE/TIME
// ============================================================

function getCaliforniaDateTime() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

// ============================================================
// GET CALIFORNIA DATE ONLY
// ============================================================

function getCaliforniaDate() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}`;
}

// ============================================================
// GET CURRENT USER STATUS
// ============================================================

export async function GET(request) {
  try {
    // ========================================================
    // GET USER ID
    // ========================================================

    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // GET USER
    // ========================================================

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          availability_status,
          status_started_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const user = rows[0];

    // ========================================================
    // GET BREAK COUNT FOR CURRENT 24 HOURS
    // ========================================================
    //
    // California date is returned for frontend/reference.
    //
    // We count break history records created in the last
    // 24 hours.
    //
    // This prevents a user from making more than 5 breaks
    // inside any rolling 24-hour period.
    // ========================================================

    const [breakRows] = await pool.query(
      `
        SELECT COUNT(*) AS break_count
        FROM user_status_history
        WHERE
          user_id = ?
          AND status IN (
            'Namaz Break',
            'Lunch Break',
            'Short Break',
            'Washroom Break',
            'Other'
          )
          AND started_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `,
      [userId]
    );

    const breakCount =
      Number(breakRows?.[0]?.break_count || 0);

    const remainingBreaks = Math.max(
      0,
      MAX_BREAKS_PER_24_HOURS - breakCount
    );

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,

          availability_status:
            user.availability_status || "Active",

          status_started_at:
            user.status_started_at || null,
        },

        status:
          user.availability_status || "Active",

        status_started_at:
          user.status_started_at || null,

        // ====================================================
        // BREAK INFORMATION
        // ====================================================

        break_limit: MAX_BREAKS_PER_24_HOURS,

        break_count: breakCount,

        remaining_breaks: remainingBreaks,

        break_limit_reached:
          breakCount >= MAX_BREAKS_PER_24_HOURS,

        timezone: CALIFORNIA_TIMEZONE,

        california_date:
          getCaliforniaDate(),

        california_time:
          getCaliforniaDateTime(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET USER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================
// UPDATE CURRENT USER STATUS
// ============================================================

export async function PUT(request) {
  let connection;

  try {
    // ========================================================
    // GET USER ID
    // ========================================================

    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // REQUEST BODY
    // ========================================================

    const body = await request.json();

    const newStatus = body?.status;

    // ========================================================
    // VALIDATE STATUS
    // ========================================================

    if (!newStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Status is required",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid availability status",
          allowedStatuses: ALLOWED_STATUSES,
        },
        { status: 400 }
      );
    }

    // ========================================================
    // CREATE CONNECTION
    // ========================================================

    connection =
      await pool.getConnection();

    // ========================================================
    // TRANSACTION
    // ========================================================

    await connection.beginTransaction();

    // ========================================================
    // GET CURRENT USER + LOCK
    // ========================================================

    const [currentRows] =
      await connection.query(
        `
          SELECT
            id,
            name,
            email,
            role,
            availability_status,
            status_started_at
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [userId]
      );

    if (
      !currentRows ||
      currentRows.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const currentUser =
      currentRows[0];

    const currentStatus =
      currentUser.availability_status ||
      "Active";

    const currentStartedAt =
      currentUser.status_started_at;

    // ========================================================
    // SAME STATUS
    // ========================================================

    if (currentStatus === newStatus) {
      await connection.commit();

      // Get current 24-hour break count
      const [sameStatusBreakRows] =
        await connection.query(
          `
            SELECT COUNT(*) AS break_count
            FROM user_status_history
            WHERE
              user_id = ?
              AND status IN (
                'Namaz Break',
                'Lunch Break',
                'Short Break',
                'Washroom Break',
                'Other'
              )
              AND started_at >= DATE_SUB(
                NOW(),
                INTERVAL 24 HOUR
              )
          `,
          [userId]
        );

      const sameStatusBreakCount =
        Number(
          sameStatusBreakRows?.[0]
            ?.break_count || 0
        );

      return NextResponse.json(
        {
          success: true,

          message:
            "Status is already set",

          user: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,

            availability_status:
              currentStatus,

            status_started_at:
              currentStartedAt || null,
          },

          status: currentStatus,

          status_started_at:
            currentStartedAt || null,

          duration_seconds: null,

          break_limit:
            MAX_BREAKS_PER_24_HOURS,

          break_count:
            sameStatusBreakCount,

          remaining_breaks:
            Math.max(
              0,
              MAX_BREAKS_PER_24_HOURS -
                sameStatusBreakCount
            ),

          break_limit_reached:
            sameStatusBreakCount >=
            MAX_BREAKS_PER_24_HOURS,

          timezone:
            CALIFORNIA_TIMEZONE,

          california_time:
            getCaliforniaDateTime(),
        },
        { status: 200 }
      );
    }

    // ========================================================
    // CHECK 5 BREAK LIMIT
    // ========================================================
    //
    // Only when NEW status is a break.
    //
    // This means:
    //
    // Active       -> Break  = COUNT
    // Active       -> On Call = NO COUNT
    // Active       -> Meeting = NO COUNT
    // Active       -> Inactive = NO COUNT
    //
    // Maximum 5 break starts in rolling 24 hours.
    // ========================================================

    if (
      BREAK_STATUSES.includes(newStatus)
    ) {
      const [breakCountRows] =
        await connection.query(
          `
            SELECT
              COUNT(*) AS break_count
            FROM user_status_history
            WHERE
              user_id = ?
              AND status IN (
                'Namaz Break',
                'Lunch Break',
                'Short Break',
                'Washroom Break',
                'Other'
              )
              AND started_at >= DATE_SUB(
                NOW(),
                INTERVAL 24 HOUR
              )
          `,
          [userId]
        );

      const breakCount =
        Number(
          breakCountRows?.[0]
            ?.break_count || 0
        );

      // ======================================================
      // LIMIT REACHED
      // ======================================================

      if (
        breakCount >=
        MAX_BREAKS_PER_24_HOURS
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,

            message:
              "Break limit reached. You can take maximum 5 breaks within 24 hours.",

            error:
              "MAX_BREAKS_REACHED",

            break_limit:
              MAX_BREAKS_PER_24_HOURS,

            break_count:
              breakCount,

            remaining_breaks: 0,

            timezone:
              CALIFORNIA_TIMEZONE,

            california_time:
              getCaliforniaDateTime(),
          },
          { status: 429 }
        );
      }
    }

    // ========================================================
    // CLOSE CURRENT OPEN HISTORY
    // ========================================================

    let closedDurationSeconds =
      null;

    if (
      currentStatus !== "Active" &&
      currentStartedAt
    ) {
      // ======================================================
      // FIND OPEN HISTORY
      // ======================================================

      const [openHistoryRows] =
        await connection.query(
          `
            SELECT
              id,
              started_at
            FROM user_status_history
            WHERE
              user_id = ?
              AND ended_at IS NULL
            ORDER BY id DESC
            LIMIT 1
            FOR UPDATE
          `,
          [userId]
        );

      // ======================================================
      // OPEN HISTORY FOUND
      // ======================================================

      if (
        openHistoryRows &&
        openHistoryRows.length > 0
      ) {
        const history =
          openHistoryRows[0];

        // ====================================================
        // CLOSE HISTORY
        // ====================================================

        const [closeResult] =
          await connection.query(
            `
              UPDATE user_status_history
              SET
                ended_at = NOW(),
                duration_seconds =
                  TIMESTAMPDIFF(
                    SECOND,
                    started_at,
                    NOW()
                  )
              WHERE id = ?
            `,
            [history.id]
          );

        // ====================================================
        // GET FINAL DURATION
        // ====================================================

        if (
          closeResult.affectedRows > 0
        ) {
          const [
            durationRows,
          ] =
            await connection.query(
              `
                SELECT
                  duration_seconds
                FROM user_status_history
                WHERE id = ?
                LIMIT 1
              `,
              [history.id]
            );

          if (
            durationRows &&
            durationRows.length > 0
          ) {
            closedDurationSeconds =
              durationRows[0]
                .duration_seconds;
          }
        }
      }

      // ======================================================
      // SAFETY FALLBACK
      // ======================================================

      else {
        const [fallbackResult] =
          await connection.query(
            `
              INSERT INTO user_status_history
              (
                user_id,
                status,
                started_at,
                ended_at,
                duration_seconds
              )
              VALUES
              (
                ?,
                ?,
                ?,
                NOW(),
                TIMESTAMPDIFF(
                  SECOND,
                  ?,
                  NOW()
                )
              )
            `,
            [
              userId,
              currentStatus,
              currentStartedAt,
              currentStartedAt,
            ]
          );

        if (
          fallbackResult.insertId
        ) {
          const [
            durationRows,
          ] =
            await connection.query(
              `
                SELECT
                  duration_seconds
                FROM user_status_history
                WHERE id = ?
                LIMIT 1
              `,
              [
                fallbackResult.insertId,
              ]
            );

          if (
            durationRows &&
            durationRows.length > 0
          ) {
            closedDurationSeconds =
              durationRows[0]
                .duration_seconds;
          }
        }
      }
    }

    // ========================================================
    // NEW STATUS = ACTIVE
    // ========================================================

    if (newStatus === "Active") {
      const [result] =
        await connection.query(
          `
            UPDATE users
            SET
              availability_status = ?,
              status_started_at = NULL
            WHERE id = ?
          `,
          [
            "Active",
            userId,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }
    }

    // ========================================================
    // NEW STATUS = NON ACTIVE
    // ========================================================

    else {
      // ======================================================
      // INSERT OPEN HISTORY
      // ======================================================

      await connection.query(
        `
          INSERT INTO user_status_history
          (
            user_id,
            status,
            started_at,
            ended_at,
            duration_seconds
          )
          VALUES
          (
            ?,
            ?,
            NOW(),
            NULL,
            NULL
          )
        `,
        [
          userId,
          newStatus,
        ]
      );

      // ======================================================
      // UPDATE USER STATUS
      // ======================================================

      const [result] =
        await connection.query(
          `
            UPDATE users
            SET
              availability_status = ?,
              status_started_at = NOW()
            WHERE id = ?
          `,
          [
            newStatus,
            userId,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }
    }

    // ========================================================
    // GET UPDATED USER
    // ========================================================

    const [rows] =
      await connection.query(
        `
          SELECT
            id,
            name,
            email,
            role,
            availability_status,
            status_started_at
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [userId]
      );

    if (
      !rows ||
      rows.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const user = rows[0];

    // ========================================================
    // GET FINAL BREAK COUNT
    // ========================================================

    const [finalBreakRows] =
      await connection.query(
        `
          SELECT
            COUNT(*) AS break_count
          FROM user_status_history
          WHERE
            user_id = ?
            AND status IN (
              'Namaz Break',
              'Lunch Break',
              'Short Break',
              'Washroom Break',
              'Other'
            )
            AND started_at >= DATE_SUB(
              NOW(),
              INTERVAL 24 HOUR
            )
        `,
        [userId]
      );

    const finalBreakCount =
      Number(
        finalBreakRows?.[0]
          ?.break_count || 0
      );

    const remainingBreaks =
      Math.max(
        0,
        MAX_BREAKS_PER_24_HOURS -
          finalBreakCount
      );

    // ========================================================
    // COMMIT
    // ========================================================

    await connection.commit();

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Availability status updated successfully",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,

          availability_status:
            user.availability_status ||
            "Active",

          status_started_at:
            user.status_started_at ||
            null,
        },

        status:
          user.availability_status ||
          "Active",

        status_started_at:
          user.status_started_at ||
          null,

        // ====================================================
        // CLOSED STATUS DURATION
        // ====================================================

        duration_seconds:
          closedDurationSeconds,

        // ====================================================
        // BREAK LIMIT
        // ====================================================

        break_limit:
          MAX_BREAKS_PER_24_HOURS,

        break_count:
          finalBreakCount,

        remaining_breaks:
          remainingBreaks,

        break_limit_reached:
          finalBreakCount >=
          MAX_BREAKS_PER_24_HOURS,

        // ====================================================
        // TIMEZONE
        // ====================================================

        timezone:
          CALIFORNIA_TIMEZONE,

        california_date:
          getCaliforniaDate(),

        california_time:
          getCaliforniaDateTime(),
      },
      { status: 200 }
    );
  } catch (error) {
    // ========================================================
    // ROLLBACK
    // ========================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "UPDATE USER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to update availability status",

        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    // ========================================================
    // RELEASE CONNECTION
    // ========================================================

    if (connection) {
      connection.release();
    }
  }
}