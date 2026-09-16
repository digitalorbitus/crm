// import { NextResponse } from "next/server";
// import db from "../../lib/db";

// export async function GET() {
//   try {
//     const [history] = await db.execute(`
//       SELECT
//         lh.id,
//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,
//         lh.login_time,
//         lh.logout_time,
//         lh.ip_address,
//         lh.user_agent
//       FROM login_history lh
//       INNER JOIN users u
//         ON lh.user_id = u.id
//       ORDER BY lh.login_time DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       history,
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch login history",
//       },
//       { status: 500 }
//     );
//   }
// }







// import { NextResponse } from "next/server";
// import db from "../../lib/db";

// /*
// |--------------------------------------------------------------------------
// | GET
// |--------------------------------------------------------------------------
// | Fetch all login history records
// */
// export async function GET() {
//   try {
//     const [history] = await db.execute(`
//       SELECT 
//         lh.id,
//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,
//         lh.login_time,
//         lh.logout_time,
//         lh.ip_address,
//         lh.user_agent
//       FROM login_history lh
//       INNER JOIN users u 
//         ON lh.user_id = u.id
//       ORDER BY lh.login_time DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       history,
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY GET ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch login history",
//       },
//       { status: 500 }
//     );
//   }
// }

// /*
// |--------------------------------------------------------------------------
// | POST
// |--------------------------------------------------------------------------
// | Create new attendance/login-history record
// |--------------------------------------------------------------------------
// | Body:
// | {
// |   user_id: 7,
// |   login_time: "2026-09-12 09:00:00",
// |   logout_time: "2026-09-12 18:00:00",
// |   ip_address: null,
// |   user_agent: null
// | }
// */
// export async function POST(request) {
//   try {
//     const body = await request.json();

//     const {
//       user_id,
//       login_time,
//       logout_time = null,
//       ip_address = null,
//       user_agent = null,
//     } = body;

//     // Validate user_id
//     if (!user_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "user_id is required",
//         },
//         { status: 400 }
//       );
//     }

//     // Validate login time
//     if (!login_time) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "login_time is required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check user exists
//     const [users] = await db.execute(
//       `
//       SELECT id, name, email, role, team
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [user_id]
//     );

//     if (users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     // Insert attendance
//     const [result] = await db.execute(
//       `
//       INSERT INTO login_history
//       (
//         user_id,
//         login_time,
//         logout_time,
//         ip_address,
//         user_agent
//       )
//       VALUES (?, ?, ?, ?, ?)
//       `,
//       [
//         user_id,
//         login_time,
//         logout_time,
//         ip_address,
//         user_agent,
//       ]
//     );

//     // Get newly created record with employee information
//     const [newRecord] = await db.execute(
//       `
//       SELECT 
//         lh.id,
//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,
//         lh.login_time,
//         lh.logout_time,
//         lh.ip_address,
//         lh.user_agent
//       FROM login_history lh
//       INNER JOIN users u
//         ON lh.user_id = u.id
//       WHERE lh.id = ?
//       LIMIT 1
//       `,
//       [result.insertId]
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Attendance added successfully",
//         record: newRecord[0] || null,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("LOGIN HISTORY POST ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to add attendance",
//       },
//       { status: 500 }
//     );
//   }
// }

// /*
// |--------------------------------------------------------------------------
// | PUT
// |--------------------------------------------------------------------------
// | Update existing attendance/login-history record
// |--------------------------------------------------------------------------
// | Body:
// | {
// |   id: 116,
// |   user_id: 7,
// |   login_time: "2026-09-12 09:20:00",
// |   logout_time: "2026-09-12 18:30:00"
// | }
// */
// export async function PUT(request) {
//   try {
//     const body = await request.json();

//     const {
//       id,
//       user_id,
//       login_time,
//       logout_time,
//       ip_address,
//       user_agent,
//     } = body;

//     // Validate ID
//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance record id is required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check existing attendance
//     const [existing] = await db.execute(
//       `
//       SELECT id
//       FROM login_history
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (existing.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance record not found",
//         },
//         { status: 404 }
//       );
//     }

//     // If user_id is being changed, verify user exists
//     if (user_id !== undefined && user_id !== null) {
//       const [users] = await db.execute(
//         `
//         SELECT id
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [user_id]
//       );

//       if (users.length === 0) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "Selected user does not exist",
//           },
//           { status: 404 }
//         );
//       }
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Dynamic UPDATE
//     |--------------------------------------------------------------------------
//     | Only fields sent by frontend will be updated.
//     */
//     const updates = [];
//     const values = [];

//     if (user_id !== undefined) {
//       updates.push("user_id = ?");
//       values.push(user_id);
//     }

//     if (login_time !== undefined) {
//       updates.push("login_time = ?");
//       values.push(login_time);
//     }

//     if (logout_time !== undefined) {
//       updates.push("logout_time = ?");
//       values.push(logout_time);
//     }

//     if (ip_address !== undefined) {
//       updates.push("ip_address = ?");
//       values.push(ip_address);
//     }

//     if (user_agent !== undefined) {
//       updates.push("user_agent = ?");
//       values.push(user_agent);
//     }

//     // Nothing to update
//     if (updates.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No fields provided for update",
//         },
//         { status: 400 }
//       );
//     }

//     values.push(id);

//     await db.execute(
//       `
//       UPDATE login_history
//       SET ${updates.join(", ")}
//       WHERE id = ?
//       `,
//       values
//     );

//     // Fetch updated record
//     const [updated] = await db.execute(
//       `
//       SELECT 
//         lh.id,
//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,
//         lh.login_time,
//         lh.logout_time,
//         lh.ip_address,
//         lh.user_agent
//       FROM login_history lh
//       INNER JOIN users u
//         ON lh.user_id = u.id
//       WHERE lh.id = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Attendance updated successfully",
//       record: updated[0] || null,
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY PUT ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to update attendance",
//       },
//       { status: 500 }
//     );
//   }
// }

// /*
// |--------------------------------------------------------------------------
// | DELETE
// |--------------------------------------------------------------------------
// | Delete attendance/login-history record
// |--------------------------------------------------------------------------
// | /api/login-history?id=116
// |--------------------------------------------------------------------------
// */
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance record id is required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check record exists
//     const [existing] = await db.execute(
//       `
//       SELECT id
//       FROM login_history
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (existing.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance record not found",
//         },
//         { status: 404 }
//       );
//     }

//     // Delete
//     await db.execute(
//       `
//       DELETE FROM login_history
//       WHERE id = ?
//       `,
//       [id]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Attendance deleted successfully",
//       deleted_id: Number(id),
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY DELETE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to delete attendance",
//       },
//       { status: 500 }
//     );
//   }
// }







// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// /*
// |--------------------------------------------------------------------------
// | LOGIN HISTORY API
// |--------------------------------------------------------------------------
// |
// | ADMIN:
// |   - Can see all users' attendance
// |   - Can add attendance
// |   - Can edit attendance
// |   - Can delete attendance
// |
// | NORMAL USER / AGENT:
// |   - Can only see their own attendance
// |   - Cannot add/edit/delete attendance
// |
// | TIMEZONE:
// |   Database values are treated as CRM/California wall-clock values.
// |   We DO NOT convert timezone inside this API.
// |   Example:
// |   2026-09-15 09:00:00
// |   remains:
// |   2026-09-15 09:00:00
// |
// |--------------------------------------------------------------------------
// */


// // ========================================================================
// // AUTH HELPER
// // ========================================================================

// function getAuthenticatedUser(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return {
//         authenticated: false,
//         user: null,
//         message: "Authentication required",
//       };
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     if (!decoded) {
//       return {
//         authenticated: false,
//         user: null,
//         message: "Invalid authentication token",
//       };
//     }

//     return {
//       authenticated: true,
//       user: decoded,
//       message: null,
//     };
//   } catch (error) {
//     console.error("LOGIN HISTORY AUTH ERROR:", error);

//     return {
//       authenticated: false,
//       user: null,
//       message: "Invalid or expired authentication token",
//     };
//   }
// }


// // ========================================================================
// // ADMIN CHECK
// // ========================================================================

// function isAdmin(user) {
//   return String(user?.role || "").toLowerCase() === "admin";
// }


// // ========================================================================
// // GET
// // ========================================================================
// //
// // ADMIN:
// //   Returns ALL attendance.
// //
// // USER:
// //   Returns ONLY own attendance.
// //
// // Optional:
// //
// // /api/login-history
// //
// // /api/login-history?from=2026-09-01&to=2026-09-15
// //
// // The frontend can continue using the endpoint without query params.
// // ========================================================================

// export async function GET(request) {
//   try {
//     // --------------------------------------------------------------
//     // AUTHENTICATION
//     // --------------------------------------------------------------

//     const auth = getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: auth.message || "Authentication required",
//           history: [],
//         },
//         { status: 401 }
//       );
//     }

//     const user = auth.user;

//     const admin = isAdmin(user);

//     // --------------------------------------------------------------
//     // CURRENT USER ID
//     // --------------------------------------------------------------

//     const currentUserId =
//       user?.id ??
//       user?.user_id ??
//       user?.userId ??
//       null;

//     if (!admin && !currentUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User ID not found in authentication token",
//           history: [],
//         },
//         { status: 401 }
//       );
//     }

//     // --------------------------------------------------------------
//     // OPTIONAL DATE FILTER
//     // --------------------------------------------------------------

//     const { searchParams } = new URL(request.url);

//     const from = searchParams.get("from");
//     const to = searchParams.get("to");

//     const conditions = [];
//     const values = [];

//     /*
//     |--------------------------------------------------------------------------
//     | USER FILTER
//     |--------------------------------------------------------------------------
//     |
//     | Admin:
//     |   No user filter.
//     |
//     | Normal user:
//     |   WHERE lh.user_id = current user
//     |
//     */

//     if (!admin) {
//       conditions.push("lh.user_id = ?");
//       values.push(currentUserId);
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | DATE FILTER
//     |--------------------------------------------------------------------------
//     |
//     | login_time is stored as the CRM/California local DATETIME.
//     |
//     */

//     if (from) {
//       conditions.push("DATE(lh.login_time) >= ?");
//       values.push(from);
//     }

//     if (to) {
//       conditions.push("DATE(lh.login_time) <= ?");
//       values.push(to);
//     }

//     const whereClause =
//       conditions.length > 0
//         ? `WHERE ${conditions.join(" AND ")}`
//         : "";

//     // --------------------------------------------------------------
//     // FETCH HISTORY
//     // --------------------------------------------------------------

//     const [history] = await db.execute(
//       `
//       SELECT
//         lh.id,

//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,

//         lh.login_time,
//         lh.logout_time,

//         lh.ip_address,
//         lh.user_agent

//       FROM login_history lh

//       INNER JOIN users u
//         ON lh.user_id = u.id

//       ${whereClause}

//       ORDER BY lh.login_time DESC
//       `,
//       values
//     );

//     // --------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       role: admin ? "admin" : "user",

//       user_id: currentUserId,

//       total: history.length,

//       history,
//     });
//   } catch (error) {
//     console.error(
//       "LOGIN HISTORY GET ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.message ||
//           "Failed to fetch login history",

//         history: [],
//       },
//       { status: 500 }
//     );
//   }
// }


// // ========================================================================
// // POST
// // ========================================================================
// //
// // ONLY ADMIN.
// //
// // Creates manual attendance record.
// // ========================================================================

// export async function POST(request) {
//   try {
//     // --------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------

//     const auth = getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: auth.message || "Authentication required",
//         },
//         { status: 401 }
//       );
//     }

//     // --------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------

//     if (!isAdmin(auth.user)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Access denied. Only administrators can add attendance.",
//         },
//         { status: 403 }
//       );
//     }

//     // --------------------------------------------------------------
//     // BODY
//     // --------------------------------------------------------------

//     const body = await request.json();

//     const {
//       user_id,
//       login_time,
//       logout_time = null,
//       ip_address = null,
//       user_agent = null,
//     } = body;

//     // --------------------------------------------------------------
//     // VALIDATION
//     // --------------------------------------------------------------

//     if (!user_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "user_id is required",
//         },
//         { status: 400 }
//       );
//     }

//     if (!login_time) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "login_time is required",
//         },
//         { status: 400 }
//       );
//     }

//     // --------------------------------------------------------------
//     // VALIDATE USER
//     // --------------------------------------------------------------

//     const [users] = await db.execute(
//       `
//       SELECT
//         id,
//         name,
//         email,
//         role,
//         team
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [user_id]
//     );

//     if (users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     // --------------------------------------------------------------
//     // INSERT
//     // --------------------------------------------------------------

//     const [result] = await db.execute(
//       `
//       INSERT INTO login_history
//       (
//         user_id,
//         login_time,
//         logout_time,
//         ip_address,
//         user_agent
//       )
//       VALUES (?, ?, ?, ?, ?)
//       `,
//       [
//         user_id,
//         login_time,
//         logout_time,
//         ip_address,
//         user_agent,
//       ]
//     );

//     // --------------------------------------------------------------
//     // FETCH CREATED RECORD
//     // --------------------------------------------------------------

//     const [newRecord] = await db.execute(
//       `
//       SELECT
//         lh.id,

//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,

//         lh.login_time,
//         lh.logout_time,

//         lh.ip_address,
//         lh.user_agent

//       FROM login_history lh

//       INNER JOIN users u
//         ON lh.user_id = u.id

//       WHERE lh.id = ?

//       LIMIT 1
//       `,
//       [result.insertId]
//     );

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Attendance added successfully",

//         record:
//           newRecord[0] || null,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error(
//       "LOGIN HISTORY POST ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.message ||
//           "Failed to add attendance",
//       },
//       { status: 500 }
//     );
//   }
// }


// // ========================================================================
// // PUT
// // ========================================================================
// //
// // ONLY ADMIN.
// //
// // Updates existing attendance record.
// // ========================================================================

// export async function PUT(request) {
//   try {
//     // --------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------

//     const auth = getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: auth.message || "Authentication required",
//         },
//         { status: 401 }
//       );
//     }

//     // --------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------

//     if (!isAdmin(auth.user)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Access denied. Only administrators can edit attendance.",
//         },
//         { status: 403 }
//       );
//     }

//     // --------------------------------------------------------------
//     // BODY
//     // --------------------------------------------------------------

//     const body = await request.json();

//     const {
//       id,
//       user_id,
//       login_time,
//       logout_time,
//       ip_address,
//       user_agent,
//     } = body;

//     // --------------------------------------------------------------
//     // VALIDATE ID
//     // --------------------------------------------------------------

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Attendance record id is required",
//         },
//         { status: 400 }
//       );
//     }

//     // --------------------------------------------------------------
//     // CHECK RECORD
//     // --------------------------------------------------------------

//     const [existing] = await db.execute(
//       `
//       SELECT
//         id,
//         user_id,
//         login_time,
//         logout_time
//       FROM login_history
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (existing.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Attendance record not found",
//         },
//         { status: 404 }
//       );
//     }

//     // --------------------------------------------------------------
//     // VALIDATE USER IF CHANGED
//     // --------------------------------------------------------------

//     if (
//       user_id !== undefined &&
//       user_id !== null &&
//       user_id !== ""
//     ) {
//       const [users] = await db.execute(
//         `
//         SELECT id
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [user_id]
//       );

//       if (users.length === 0) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Selected user does not exist",
//           },
//           { status: 404 }
//         );
//       }
//     }

//     // --------------------------------------------------------------
//     // DYNAMIC UPDATE
//     // --------------------------------------------------------------

//     const updates = [];
//     const values = [];

//     if (user_id !== undefined) {
//       updates.push("user_id = ?");
//       values.push(user_id);
//     }

//     if (login_time !== undefined) {
//       updates.push("login_time = ?");
//       values.push(login_time);
//     }

//     if (logout_time !== undefined) {
//       updates.push("logout_time = ?");
//       values.push(logout_time);
//     }

//     if (ip_address !== undefined) {
//       updates.push("ip_address = ?");
//       values.push(ip_address);
//     }

//     if (user_agent !== undefined) {
//       updates.push("user_agent = ?");
//       values.push(user_agent);
//     }

//     // --------------------------------------------------------------
//     // NOTHING TO UPDATE
//     // --------------------------------------------------------------

//     if (updates.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "No fields provided for update",
//         },
//         { status: 400 }
//       );
//     }

//     values.push(id);

//     // --------------------------------------------------------------
//     // UPDATE
//     // --------------------------------------------------------------

//     await db.execute(
//       `
//       UPDATE login_history
//       SET ${updates.join(", ")}
//       WHERE id = ?
//       `,
//       values
//     );

//     // --------------------------------------------------------------
//     // FETCH UPDATED RECORD
//     // --------------------------------------------------------------

//     const [updated] = await db.execute(
//       `
//       SELECT
//         lh.id,

//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,

//         lh.login_time,
//         lh.logout_time,

//         lh.ip_address,
//         lh.user_agent

//       FROM login_history lh

//       INNER JOIN users u
//         ON lh.user_id = u.id

//       WHERE lh.id = ?

//       LIMIT 1
//       `,
//       [id]
//     );

//     return NextResponse.json({
//       success: true,

//       message:
//         "Attendance updated successfully",

//       record:
//         updated[0] || null,
//     });
//   } catch (error) {
//     console.error(
//       "LOGIN HISTORY PUT ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.message ||
//           "Failed to update attendance",
//       },
//       { status: 500 }
//     );
//   }
// }


// // ========================================================================
// // DELETE
// // ========================================================================
// //
// // ONLY ADMIN.
// // ========================================================================

// export async function DELETE(request) {
//   try {
//     // --------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------

//     const auth = getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: auth.message || "Authentication required",
//         },
//         { status: 401 }
//       );
//     }

//     // --------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------

//     if (!isAdmin(auth.user)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Access denied. Only administrators can delete attendance.",
//         },
//         { status: 403 }
//       );
//     }

//     // --------------------------------------------------------------
//     // GET ID
//     // --------------------------------------------------------------

//     const { searchParams } =
//       new URL(request.url);

//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Attendance record id is required",
//         },
//         { status: 400 }
//       );
//     }

//     // --------------------------------------------------------------
//     // CHECK RECORD
//     // --------------------------------------------------------------

//     const [existing] = await db.execute(
//       `
//       SELECT
//         id,
//         user_id
//       FROM login_history
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [id]
//     );

//     if (existing.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Attendance record not found",
//         },
//         { status: 404 }
//       );
//     }

//     // --------------------------------------------------------------
//     // DELETE
//     // --------------------------------------------------------------

//     await db.execute(
//       `
//       DELETE FROM login_history
//       WHERE id = ?
//       `,
//       [id]
//     );

//     // --------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       message:
//         "Attendance deleted successfully",

//       deleted_id: Number(id),
//     });
//   } catch (error) {
//     console.error(
//       "LOGIN HISTORY DELETE ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.message ||
//           "Failed to delete attendance",
//       },
//       { status: 500 }
//     );
//   }
// }





























import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

/*
|--------------------------------------------------------------------------
| LOGIN HISTORY / ATTENDANCE API
|--------------------------------------------------------------------------
|
| ATTENDANCE RULE:
|
|   08:15:00 AM tak       = On Time
|   08:15:01 AM onward    = Late
|
| IMPORTANT:
| Database login_time is treated as CRM/California wall-clock time.
| No timezone conversion is performed inside this API.
|
| ADMIN:
|   - Can see all users' attendance
|   - Can add attendance
|   - Can edit attendance
|   - Can delete attendance
|
| NORMAL USER / AGENT:
|   - Can see only own attendance
|   - Cannot add/edit/delete attendance
|
|--------------------------------------------------------------------------
*/


// ========================================================================
// ATTENDANCE CUTOFF
// ========================================================================

const ATTENDANCE_CUTOFF = "08:15:00";


// ========================================================================
// AUTH HELPER
// ========================================================================

function getAuthenticatedUser(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return {
        authenticated: false,
        user: null,
        message: "Authentication required",
      };
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded) {
      return {
        authenticated: false,
        user: null,
        message: "Invalid authentication token",
      };
    }

    return {
      authenticated: true,
      user: decoded,
      message: null,
    };
  } catch (error) {
    console.error(
      "LOGIN HISTORY AUTH ERROR:",
      error
    );

    return {
      authenticated: false,
      user: null,
      message:
        "Invalid or expired authentication token",
    };
  }
}


// ========================================================================
// ADMIN CHECK
// ========================================================================

function isAdmin(user) {
  return (
    String(user?.role || "").toLowerCase() ===
    "admin"
  );
}


// ========================================================================
// COMMON SELECT
// ========================================================================
//
// Attendance status is calculated from login_time.
//
// 08:15:00 or earlier = On Time
// After 08:15:00       = Late
//
// ========================================================================

const HISTORY_SELECT = `
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
    lh.user_agent,

    CASE
      WHEN TIME(lh.login_time) <= '${ATTENDANCE_CUTOFF}'
        THEN 'On Time'
      ELSE 'Late'
    END AS attendance_status

  FROM login_history lh

  INNER JOIN users u
    ON lh.user_id = u.id
`;


// ========================================================================
// GET
// ========================================================================
//
// ADMIN:
//   Returns all attendance.
//
// USER:
//   Returns only own attendance.
//
// Optional:
//
// /api/login-history
//
// /api/login-history?from=2026-09-01&to=2026-09-15
//
// ========================================================================

export async function GET(request) {
  try {
    // --------------------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------------------

    const auth =
      getAuthenticatedUser(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.message ||
            "Authentication required",
          history: [],
        },
        { status: 401 }
      );
    }

    const user = auth.user;

    const admin = isAdmin(user);


    // --------------------------------------------------------------------
    // CURRENT USER ID
    // --------------------------------------------------------------------

    const currentUserId =
      user?.id ??
      user?.user_id ??
      user?.userId ??
      null;


    // --------------------------------------------------------------------
    // NORMAL USER MUST HAVE ID
    // --------------------------------------------------------------------

    if (!admin && !currentUserId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User ID not found in authentication token",
          history: [],
        },
        { status: 401 }
      );
    }


    // --------------------------------------------------------------------
    // QUERY PARAMETERS
    // --------------------------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const from =
      searchParams.get("from");

    const to =
      searchParams.get("to");


    // --------------------------------------------------------------------
    // CONDITIONS
    // --------------------------------------------------------------------

    const conditions = [];
    const values = [];


    // --------------------------------------------------------------------
    // NORMAL USER FILTER
    // --------------------------------------------------------------------

    if (!admin) {
      conditions.push(
        "lh.user_id = ?"
      );

      values.push(currentUserId);
    }


    // --------------------------------------------------------------------
    // FROM DATE
    // --------------------------------------------------------------------

    if (from) {
      conditions.push(
        "DATE(lh.login_time) >= ?"
      );

      values.push(from);
    }


    // --------------------------------------------------------------------
    // TO DATE
    // --------------------------------------------------------------------

    if (to) {
      conditions.push(
        "DATE(lh.login_time) <= ?"
      );

      values.push(to);
    }


    // --------------------------------------------------------------------
    // WHERE CLAUSE
    // --------------------------------------------------------------------

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";


    // --------------------------------------------------------------------
    // FETCH HISTORY
    // --------------------------------------------------------------------

    const [history] =
      await db.execute(
        `
        ${HISTORY_SELECT}

        ${whereClause}

        ORDER BY lh.login_time DESC
        `,
        values
      );


    // --------------------------------------------------------------------
    // COUNTS
    // --------------------------------------------------------------------

    const total =
      history.length;

    const late =
      history.filter(
        (item) =>
          item.attendance_status ===
          "Late"
      ).length;

    const onTime =
      history.filter(
        (item) =>
          item.attendance_status ===
          "On Time"
      ).length;


    // --------------------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------------------

    return NextResponse.json({
      success: true,

      role:
        admin
          ? "admin"
          : "user",

      user_id:
        currentUserId,

      total,

      late,

      on_time:
        onTime,

      cutoff_time:
        ATTENDANCE_CUTOFF,

      history,
    });

  } catch (error) {
    console.error(
      "LOGIN HISTORY GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch login history",

        history: [],
      },
      { status: 500 }
    );
  }
}


// ========================================================================
// POST
// ========================================================================
//
// ONLY ADMIN
//
// Creates manual attendance record.
//
// attendance_status is calculated automatically
// from login_time.
// It is NOT stored as a separate DB column.
//
// ========================================================================

export async function POST(request) {
  try {
    // --------------------------------------------------------------------
    // AUTH
    // --------------------------------------------------------------------

    const auth =
      getAuthenticatedUser(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.message ||
            "Authentication required",
        },
        { status: 401 }
      );
    }


    // --------------------------------------------------------------------
    // ADMIN ONLY
    // --------------------------------------------------------------------

    if (!isAdmin(auth.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Only administrators can add attendance.",
        },
        { status: 403 }
      );
    }


    // --------------------------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------------------------

    const body =
      await request.json();

    const {
      user_id,
      login_time,
      logout_time = null,
      ip_address = null,
      user_agent = null,
    } = body;


    // --------------------------------------------------------------------
    // VALIDATE USER ID
    // --------------------------------------------------------------------

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "user_id is required",
        },
        { status: 400 }
      );
    }


    // --------------------------------------------------------------------
    // VALIDATE LOGIN TIME
    // --------------------------------------------------------------------

    if (!login_time) {
      return NextResponse.json(
        {
          success: false,
          message:
            "login_time is required",
        },
        { status: 400 }
      );
    }


    // --------------------------------------------------------------------
    // CHECK USER
    // --------------------------------------------------------------------

    const [users] =
      await db.execute(
        `
        SELECT
          id,
          name,
          email,
          role,
          team
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [user_id]
      );


    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        { status: 404 }
      );
    }


    // --------------------------------------------------------------------
    // INSERT ATTENDANCE
    // --------------------------------------------------------------------

    const [result] =
      await db.execute(
        `
        INSERT INTO login_history
        (
          user_id,
          login_time,
          logout_time,
          ip_address,
          user_agent
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          user_id,
          login_time,
          logout_time,
          ip_address,
          user_agent,
        ]
      );


    // --------------------------------------------------------------------
    // FETCH CREATED RECORD
    // --------------------------------------------------------------------

    const [newRecord] =
      await db.execute(
        `
        ${HISTORY_SELECT}

        WHERE lh.id = ?

        LIMIT 1
        `,
        [result.insertId]
      );


    // --------------------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Attendance added successfully",

        record:
          newRecord[0] ||
          null,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(
      "LOGIN HISTORY POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to add attendance",
      },
      { status: 500 }
    );
  }
}


// ========================================================================
// PUT
// ========================================================================
//
// ONLY ADMIN
//
// Updates existing attendance record.
//
// If login_time changes, attendance_status automatically
// changes as well because it is calculated from login_time.
//
// ========================================================================

export async function PUT(request) {
  try {
    // --------------------------------------------------------------------
    // AUTH
    // --------------------------------------------------------------------

    const auth =
      getAuthenticatedUser(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.message ||
            "Authentication required",
        },
        { status: 401 }
      );
    }


    // --------------------------------------------------------------------
    // ADMIN ONLY
    // --------------------------------------------------------------------

    if (!isAdmin(auth.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Only administrators can edit attendance.",
        },
        { status: 403 }
      );
    }


    // --------------------------------------------------------------------
    // BODY
    // --------------------------------------------------------------------

    const body =
      await request.json();

    const {
      id,
      user_id,
      login_time,
      logout_time,
      ip_address,
      user_agent,
    } = body;


    // --------------------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------------------

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance record id is required",
        },
        { status: 400 }
      );
    }


    // --------------------------------------------------------------------
    // CHECK EXISTING RECORD
    // --------------------------------------------------------------------

    const [existing] =
      await db.execute(
        `
        SELECT
          id,
          user_id,
          login_time,
          logout_time
        FROM login_history
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );


    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance record not found",
        },
        { status: 404 }
      );
    }


    // --------------------------------------------------------------------
    // VALIDATE NEW USER
    // --------------------------------------------------------------------

    if (
      user_id !== undefined &&
      user_id !== null &&
      user_id !== ""
    ) {
      const [users] =
        await db.execute(
          `
          SELECT id
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [user_id]
        );


      if (users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected user does not exist",
          },
          { status: 404 }
        );
      }
    }


    // --------------------------------------------------------------------
    // BUILD UPDATE
    // --------------------------------------------------------------------

    const updates = [];
    const values = [];


    if (user_id !== undefined) {
      updates.push(
        "user_id = ?"
      );

      values.push(user_id);
    }


    if (login_time !== undefined) {
      updates.push(
        "login_time = ?"
      );

      values.push(login_time);
    }


    if (logout_time !== undefined) {
      updates.push(
        "logout_time = ?"
      );

      values.push(logout_time);
    }


    if (ip_address !== undefined) {
      updates.push(
        "ip_address = ?"
      );

      values.push(ip_address);
    }


    if (user_agent !== undefined) {
      updates.push(
        "user_agent = ?"
      );

      values.push(user_agent);
    }


    // --------------------------------------------------------------------
    // NOTHING TO UPDATE
    // --------------------------------------------------------------------

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No fields provided for update",
        },
        { status: 400 }
      );
    }


    values.push(id);


    // --------------------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------------------

    await db.execute(
      `
      UPDATE login_history
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      values
    );


    // --------------------------------------------------------------------
    // FETCH UPDATED RECORD
    // --------------------------------------------------------------------

    const [updated] =
      await db.execute(
        `
        ${HISTORY_SELECT}

        WHERE lh.id = ?

        LIMIT 1
        `,
        [id]
      );


    // --------------------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Attendance updated successfully",

      record:
        updated[0] ||
        null,
    });

  } catch (error) {
    console.error(
      "LOGIN HISTORY PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to update attendance",
      },
      { status: 500 }
    );
  }
}


// ========================================================================
// DELETE
// ========================================================================
//
// ONLY ADMIN
//
// ========================================================================

export async function DELETE(request) {
  try {
    // --------------------------------------------------------------------
    // AUTH
    // --------------------------------------------------------------------

    const auth =
      getAuthenticatedUser(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.message ||
            "Authentication required",
        },
        { status: 401 }
      );
    }


    // --------------------------------------------------------------------
    // ADMIN ONLY
    // --------------------------------------------------------------------

    if (!isAdmin(auth.user)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Only administrators can delete attendance.",
        },
        { status: 403 }
      );
    }


    // --------------------------------------------------------------------
    // GET ID
    // --------------------------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");


    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance record id is required",
        },
        { status: 400 }
      );
    }


    // --------------------------------------------------------------------
    // CHECK RECORD
    // --------------------------------------------------------------------

    const [existing] =
      await db.execute(
        `
        SELECT
          id,
          user_id
        FROM login_history
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );


    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance record not found",
        },
        { status: 404 }
      );
    }


    // --------------------------------------------------------------------
    // DELETE
    // --------------------------------------------------------------------

    await db.execute(
      `
      DELETE FROM login_history
      WHERE id = ?
      `,
      [id]
    );


    // --------------------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Attendance deleted successfully",

      deleted_id:
        Number(id),
    });

  } catch (error) {
    console.error(
      "LOGIN HISTORY DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to delete attendance",
      },
      { status: 500 }
    );
  }
}