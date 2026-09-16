






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

















import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";

// ==========================================
// ALLOWED STATUS
// ==========================================

const ALLOWED_STATUSES = [
  "Active",
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Inactive",
  "On Call",
  "Washroom Break",
  "Other",
];

// ==========================================
// GET USER ID FROM JWT
// ==========================================

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

// ==========================================
// GET CURRENT USER STATUS
// ==========================================

export async function GET(request) {
  try {
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

// ==========================================
// UPDATE CURRENT USER STATUS
// ==========================================

export async function PUT(request) {
  let connection;

  try {
    // ========================================
    // GET USER ID
    // ========================================

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

    // ========================================
    // GET REQUEST BODY
    // ========================================

    const body = await request.json();

    const newStatus = body?.status;

    // ========================================
    // VALIDATE STATUS
    // ========================================

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

    // ========================================
    // CREATE DB CONNECTION
    // ========================================

    connection =
      await pool.getConnection();

    // ========================================
    // START TRANSACTION
    // ========================================

    await connection.beginTransaction();

    // ========================================
    // GET CURRENT USER STATUS
    // FOR UPDATE = LOCK USER ROW
    // ========================================

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

    // ========================================
    // SAME STATUS
    // Don't create duplicate history
    // ========================================

    if (
      currentStatus === newStatus
    ) {
      await connection.commit();

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
        },
        { status: 200 }
      );
    }

    // ========================================
    // CLOSE CURRENT OPEN HISTORY
    // ========================================
    //
    // If current status is non-active,
    // there should be an open history row.
    //
    // Example:
    //
    // Lunch Break
    // 02:00 PM -> NULL
    //
    // User changes to Active
    //
    // becomes:
    //
    // Lunch Break
    // 02:00 PM -> 02:35 PM
    //
    // duration = 2100 seconds
    // ========================================

    let closedDurationSeconds =
      null;

    if (
      currentStatus !== "Active" &&
      currentStartedAt
    ) {
      // ======================================
      // FIND OPEN HISTORY RECORD
      // ======================================

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

      // ======================================
      // IF OPEN HISTORY EXISTS
      // ======================================

      if (
        openHistoryRows &&
        openHistoryRows.length > 0
      ) {
        const history =
          openHistoryRows[0];

        // ====================================
        // CLOSE HISTORY
        // ====================================

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

        // ====================================
        // GET FINAL DURATION
        // ====================================

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
      } else {
        // ====================================
        // SAFETY FALLBACK
        //
        // If history row doesn't exist,
        // create a completed history record
        // from users.status_started_at.
        // ====================================

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

    // ========================================
    // NEW STATUS = ACTIVE
    // ========================================

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
            message:
              "User not found",
          },
          { status: 404 }
        );
      }
    }

    // ========================================
    // NEW STATUS = NON ACTIVE
    // ========================================

    else {
      // ======================================
      // INSERT NEW OPEN HISTORY
      // ======================================

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

      // ======================================
      // UPDATE USER CURRENT STATUS
      // ======================================

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
            message:
              "User not found",
          },
          { status: 404 }
        );
      }
    }

    // ========================================
    // GET UPDATED USER
    // ========================================

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

    // ========================================
    // COMMIT EVERYTHING
    // ========================================

    await connection.commit();

    // ========================================
    // RESPONSE
    // ========================================

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

        // Duration of the status
        // that was just closed.
        duration_seconds:
          closedDurationSeconds,
      },
      { status: 200 }
    );
  } catch (error) {
    // ========================================
    // ROLLBACK
    // ========================================

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
    // ========================================
    // RELEASE CONNECTION
    // ========================================

    if (connection) {
      connection.release();
    }
  }
}