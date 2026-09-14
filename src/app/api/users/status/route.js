
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { query } from "../../../lib/db";

// // ============================================================
// // ALLOWED STATUSES
// // ============================================================

// const ALLOWED_STATUSES = [
//   "Active",
//   "Namaz Break",
//   "Lunch Break",
//   "Inactive",
//   "On Call",
//   "Washroom Break",
//   "Other",
// ];

// // ============================================================
// // GET CURRENT USER ID
// // ============================================================

// function getUserIdFromToken(request) {
//   const token = request.cookies.get("token")?.value;

//   if (!token) {
//     return null;
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     return (
//       decoded?.id ||
//       decoded?.userId ||
//       decoded?.user_id ||
//       decoded?._id ||
//       null
//     );
//   } catch (error) {
//     console.error(
//       "STATUS API JWT ERROR:",
//       error.message
//     );

//     return null;
//   }
// }

// // ============================================================
// // GET
// // Get current user's saved status
// // ============================================================

// export async function GET(request) {
//   try {
//     const userId =
//       getUserIdFromToken(request);

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid or expired CRM session",
//         },
//         {
//           status: 401,
//           headers: {
//             "Cache-Control": "no-store",
//           },
//         }
//       );
//     }

//     const rows = await query(
//       `
//       SELECT
//         id,
//         name,
//         email,
//         role,
//         availability_status
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [userId]
//     );

//     if (!rows || rows.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     const user = rows[0];

//     return NextResponse.json(
//       {
//         success: true,

//         status:
//           user.availability_status ||
//           "Active",

//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           availability_status:
//             user.availability_status ||
//             "Active",
//         },
//       },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate",
//           Pragma: "no-cache",
//         },
//       }
//     );
//   } catch (error) {
//     console.error(
//       "GET USER STATUS ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           "Failed to fetch user status",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// // ============================================================
// // PUT
// // Update current user's status
// // ============================================================

// export async function PUT(request) {
//   try {
//     // --------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------

//     const userId =
//       getUserIdFromToken(request);

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM login required",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // --------------------------------------------------------
//     // BODY
//     // --------------------------------------------------------

//     const body = await request.json();

//     const status =
//       typeof body?.status === "string"
//         ? body.status.trim()
//         : "";

//     // --------------------------------------------------------
//     // VALIDATE STATUS
//     // --------------------------------------------------------

//     if (!status) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Status is required",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     if (!ALLOWED_STATUSES.includes(status)) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid status",
//           allowed_statuses:
//             ALLOWED_STATUSES,
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     // --------------------------------------------------------
//     // CHECK USER
//     // --------------------------------------------------------

//     const userRows = await query(
//       `
//       SELECT
//         id,
//         name,
//         email,
//         role
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [userId]
//     );

//     if (
//       !userRows ||
//       userRows.length === 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }

//     // --------------------------------------------------------
//     // UPDATE DATABASE
//     // --------------------------------------------------------

//     await query(
//       `
//       UPDATE users
//       SET availability_status = ?
//       WHERE id = ?
//       `,
//       [status, userId]
//     );

//     console.log(
//       "[USER STATUS UPDATED]",
//       {
//         userId,
//         status,
//       }
//     );

//     // --------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "User status updated successfully",

//         status,

//         user: {
//           id: userRows[0].id,
//           name: userRows[0].name,
//           email: userRows[0].email,
//           role: userRows[0].role,
//         },
//       },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control":
//             "no-store",
//         },
//       }
//     );
//   } catch (error) {
//     console.error(
//       "UPDATE USER STATUS ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           "Failed to update user status",
//       },
//       {
//         status: 500,
//       }
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
          availability_status
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
        },
        status:
          user.availability_status || "Active",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET USER STATUS ERROR:", error);

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

    const body = await request.json();

    const newStatus = body?.status;

    // ==========================================
    // VALIDATE STATUS
    // ==========================================

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

    // ==========================================
    // UPDATE DATABASE
    // ==========================================

    const [result] = await pool.query(
      `
        UPDATE users
        SET availability_status = ?
        WHERE id = ?
      `,
      [newStatus, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // GET UPDATED USER
    // ==========================================

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          availability_status
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    const user = rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Availability status updated successfully",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          availability_status:
            user.availability_status || "Active",
        },

        status:
          user.availability_status || "Active",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update availability status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

