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





























// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// /*
// |--------------------------------------------------------------------------
// | LOGIN HISTORY / ATTENDANCE API
// |--------------------------------------------------------------------------
// |
// | ATTENDANCE RULE:
// |
// |   08:15:00 AM tak       = On Time
// |   08:15:01 AM onward    = Late
// |
// | IMPORTANT:
// | Database login_time is treated as CRM/California wall-clock time.
// | No timezone conversion is performed inside this API.
// |
// | ADMIN:
// |   - Can see all users' attendance
// |   - Can add attendance
// |   - Can edit attendance
// |   - Can delete attendance
// |
// | NORMAL USER / AGENT:
// |   - Can see only own attendance
// |   - Cannot add/edit/delete attendance
// |
// |--------------------------------------------------------------------------
// */


// // ========================================================================
// // ATTENDANCE CUTOFF
// // ========================================================================

// const ATTENDANCE_CUTOFF = "08:15:00";


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
//     console.error(
//       "LOGIN HISTORY AUTH ERROR:",
//       error
//     );

//     return {
//       authenticated: false,
//       user: null,
//       message:
//         "Invalid or expired authentication token",
//     };
//   }
// }


// // ========================================================================
// // ADMIN CHECK
// // ========================================================================

// function isAdmin(user) {
//   return (
//     String(user?.role || "").toLowerCase() ===
//     "admin"
//   );
// }


// // ========================================================================
// // COMMON SELECT
// // ========================================================================
// //
// // Attendance status is calculated from login_time.
// //
// // 08:15:00 or earlier = On Time
// // After 08:15:00       = Late
// //
// // ========================================================================

// const HISTORY_SELECT = `
//   SELECT
//     lh.id,

//     u.id AS user_id,
//     u.name,
//     u.email,
//     u.role,
//     u.team,

//     lh.login_time,
//     lh.logout_time,

//     lh.ip_address,
//     lh.user_agent,

//     CASE
//       WHEN TIME(lh.login_time) <= '${ATTENDANCE_CUTOFF}'
//         THEN 'On Time'
//       ELSE 'Late'
//     END AS attendance_status

//   FROM login_history lh

//   INNER JOIN users u
//     ON lh.user_id = u.id
// `;


// // ========================================================================
// // GET
// // ========================================================================
// //
// // ADMIN:
// //   Returns all attendance.
// //
// // USER:
// //   Returns only own attendance.
// //
// // Optional:
// //
// // /api/login-history
// //
// // /api/login-history?from=2026-09-01&to=2026-09-15
// //
// // ========================================================================

// export async function GET(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTHENTICATION
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//           history: [],
//         },
//         { status: 401 }
//       );
//     }

//     const user = auth.user;

//     const admin = isAdmin(user);


//     // --------------------------------------------------------------------
//     // CURRENT USER ID
//     // --------------------------------------------------------------------

//     const currentUserId =
//       user?.id ??
//       user?.user_id ??
//       user?.userId ??
//       null;


//     // --------------------------------------------------------------------
//     // NORMAL USER MUST HAVE ID
//     // --------------------------------------------------------------------

//     if (!admin && !currentUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User ID not found in authentication token",
//           history: [],
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // QUERY PARAMETERS
//     // --------------------------------------------------------------------

//     const { searchParams } =
//       new URL(request.url);

//     const from =
//       searchParams.get("from");

//     const to =
//       searchParams.get("to");


//     // --------------------------------------------------------------------
//     // CONDITIONS
//     // --------------------------------------------------------------------

//     const conditions = [];
//     const values = [];


//     // --------------------------------------------------------------------
//     // NORMAL USER FILTER
//     // --------------------------------------------------------------------

//     if (!admin) {
//       conditions.push(
//         "lh.user_id = ?"
//       );

//       values.push(currentUserId);
//     }


//     // --------------------------------------------------------------------
//     // FROM DATE
//     // --------------------------------------------------------------------

//     if (from) {
//       conditions.push(
//         "DATE(lh.login_time) >= ?"
//       );

//       values.push(from);
//     }


//     // --------------------------------------------------------------------
//     // TO DATE
//     // --------------------------------------------------------------------

//     if (to) {
//       conditions.push(
//         "DATE(lh.login_time) <= ?"
//       );

//       values.push(to);
//     }


//     // --------------------------------------------------------------------
//     // WHERE CLAUSE
//     // --------------------------------------------------------------------

//     const whereClause =
//       conditions.length > 0
//         ? `WHERE ${conditions.join(" AND ")}`
//         : "";


//     // --------------------------------------------------------------------
//     // FETCH HISTORY
//     // --------------------------------------------------------------------

//     const [history] =
//       await db.execute(
//         `
//         ${HISTORY_SELECT}

//         ${whereClause}

//         ORDER BY lh.login_time DESC
//         `,
//         values
//       );


//     // --------------------------------------------------------------------
//     // COUNTS
//     // --------------------------------------------------------------------

//     const total =
//       history.length;

//     const late =
//       history.filter(
//         (item) =>
//           item.attendance_status ===
//           "Late"
//       ).length;

//     const onTime =
//       history.filter(
//         (item) =>
//           item.attendance_status ===
//           "On Time"
//       ).length;


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       role:
//         admin
//           ? "admin"
//           : "user",

//       user_id:
//         currentUserId,

//       total,

//       late,

//       on_time:
//         onTime,

//       cutoff_time:
//         ATTENDANCE_CUTOFF,

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
// // ONLY ADMIN
// //
// // Creates manual attendance record.
// //
// // attendance_status is calculated automatically
// // from login_time.
// // It is NOT stored as a separate DB column.
// //
// // ========================================================================

// export async function POST(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // REQUEST BODY
//     // --------------------------------------------------------------------

//     const body =
//       await request.json();

//     const {
//       user_id,
//       login_time,
//       logout_time = null,
//       ip_address = null,
//       user_agent = null,
//     } = body;


//     // --------------------------------------------------------------------
//     // VALIDATE USER ID
//     // --------------------------------------------------------------------

//     if (!user_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "user_id is required",
//         },
//         { status: 400 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // VALIDATE LOGIN TIME
//     // --------------------------------------------------------------------

//     if (!login_time) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "login_time is required",
//         },
//         { status: 400 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // CHECK USER
//     // --------------------------------------------------------------------

//     const [users] =
//       await db.execute(
//         `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           team
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [user_id]
//       );


//     if (users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User not found",
//         },
//         { status: 404 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // INSERT ATTENDANCE
//     // --------------------------------------------------------------------

//     const [result] =
//       await db.execute(
//         `
//         INSERT INTO login_history
//         (
//           user_id,
//           login_time,
//           logout_time,
//           ip_address,
//           user_agent
//         )
//         VALUES (?, ?, ?, ?, ?)
//         `,
//         [
//           user_id,
//           login_time,
//           logout_time,
//           ip_address,
//           user_agent,
//         ]
//       );


//     // --------------------------------------------------------------------
//     // FETCH CREATED RECORD
//     // --------------------------------------------------------------------

//     const [newRecord] =
//       await db.execute(
//         `
//         ${HISTORY_SELECT}

//         WHERE lh.id = ?

//         LIMIT 1
//         `,
//         [result.insertId]
//       );


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Attendance added successfully",

//         record:
//           newRecord[0] ||
//           null,
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
// // ONLY ADMIN
// //
// // Updates existing attendance record.
// //
// // If login_time changes, attendance_status automatically
// // changes as well because it is calculated from login_time.
// //
// // ========================================================================

// export async function PUT(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // BODY
//     // --------------------------------------------------------------------

//     const body =
//       await request.json();

//     const {
//       id,
//       user_id,
//       login_time,
//       logout_time,
//       ip_address,
//       user_agent,
//     } = body;


//     // --------------------------------------------------------------------
//     // VALIDATE ID
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // CHECK EXISTING RECORD
//     // --------------------------------------------------------------------

//     const [existing] =
//       await db.execute(
//         `
//         SELECT
//           id,
//           user_id,
//           login_time,
//           logout_time
//         FROM login_history
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [id]
//       );


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


//     // --------------------------------------------------------------------
//     // VALIDATE NEW USER
//     // --------------------------------------------------------------------

//     if (
//       user_id !== undefined &&
//       user_id !== null &&
//       user_id !== ""
//     ) {
//       const [users] =
//         await db.execute(
//           `
//           SELECT id
//           FROM users
//           WHERE id = ?
//           LIMIT 1
//           `,
//           [user_id]
//         );


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


//     // --------------------------------------------------------------------
//     // BUILD UPDATE
//     // --------------------------------------------------------------------

//     const updates = [];
//     const values = [];


//     if (user_id !== undefined) {
//       updates.push(
//         "user_id = ?"
//       );

//       values.push(user_id);
//     }


//     if (login_time !== undefined) {
//       updates.push(
//         "login_time = ?"
//       );

//       values.push(login_time);
//     }


//     if (logout_time !== undefined) {
//       updates.push(
//         "logout_time = ?"
//       );

//       values.push(logout_time);
//     }


//     if (ip_address !== undefined) {
//       updates.push(
//         "ip_address = ?"
//       );

//       values.push(ip_address);
//     }


//     if (user_agent !== undefined) {
//       updates.push(
//         "user_agent = ?"
//       );

//       values.push(user_agent);
//     }


//     // --------------------------------------------------------------------
//     // NOTHING TO UPDATE
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // UPDATE
//     // --------------------------------------------------------------------

//     await db.execute(
//       `
//       UPDATE login_history
//       SET ${updates.join(", ")}
//       WHERE id = ?
//       `,
//       values
//     );


//     // --------------------------------------------------------------------
//     // FETCH UPDATED RECORD
//     // --------------------------------------------------------------------

//     const [updated] =
//       await db.execute(
//         `
//         ${HISTORY_SELECT}

//         WHERE lh.id = ?

//         LIMIT 1
//         `,
//         [id]
//       );


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       message:
//         "Attendance updated successfully",

//       record:
//         updated[0] ||
//         null,
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
// // ONLY ADMIN
// //
// // ========================================================================

// export async function DELETE(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // GET ID
//     // --------------------------------------------------------------------

//     const { searchParams } =
//       new URL(request.url);

//     const id =
//       searchParams.get("id");


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


//     // --------------------------------------------------------------------
//     // CHECK RECORD
//     // --------------------------------------------------------------------

//     const [existing] =
//       await db.execute(
//         `
//         SELECT
//           id,
//           user_id
//         FROM login_history
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [id]
//       );


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


//     // --------------------------------------------------------------------
//     // DELETE
//     // --------------------------------------------------------------------

//     await db.execute(
//       `
//       DELETE FROM login_history
//       WHERE id = ?
//       `,
//       [id]
//     );


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       message:
//         "Attendance deleted successfully",

//       deleted_id:
//         Number(id),
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

































// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// /*
// |--------------------------------------------------------------------------
// | LOGIN HISTORY / ATTENDANCE API
// |--------------------------------------------------------------------------
// |
// | TIMEZONE:
// |   America/Los_Angeles
// |
// | ATTENDANCE:
// |
// |   12:00 AM California = New attendance day
// |
// |   08:15:00 AM or earlier = On Time
// |   08:15:01 AM onward     = Late
// |
// | IMPORTANT:
// |
// | login_time / logout_time are stored and returned as
// | California wall-clock DATETIME values.
// |
// | Example:
// |
// |   2026-09-16 08:10:00
// |   2026-09-16 08:20:00
// |
// | NOT:
// |
// |   2026-09-16T08:10:00.000Z
// |
// |--------------------------------------------------------------------------
// */

// const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// const ATTENDANCE_CUTOFF = "08:15:00";


// // ========================================================================
// // CALIFORNIA DATE/TIME HELPERS
// // ========================================================================

// function getCaliforniaDateTime() {
//   const now = new Date();

//   const parts = new Intl.DateTimeFormat("en-CA", {
//     timeZone: CALIFORNIA_TIMEZONE,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hourCycle: "h23",
//   }).formatToParts(now);

//   const values = {};

//   for (const part of parts) {
//     if (part.type !== "literal") {
//       values[part.type] = part.value;
//     }
//   }

//   return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
// }


// // ========================================================================
// // NORMALIZE DATETIME
// // ========================================================================
// //
// // Converts incoming datetime into California wall-clock DATETIME.
// //
// // Examples:
// //
// // 2026-09-16T08:49:59
// // 2026-09-16T08:49:59.000
// // 2026-09-16 08:49:59
// //
// // Result:
// //
// // 2026-09-16 08:49:59
// //
// // If incoming value contains Z, we treat it as UTC and convert it to
// // California time.
// //
// // ========================================================================

// function normalizeToCaliforniaDateTime(value) {
//   if (!value) {
//     return null;
//   }

//   const input = String(value).trim();

//   // ----------------------------------------------------------------------
//   // If input contains UTC Z, convert UTC -> California
//   // ----------------------------------------------------------------------

//   if (input.endsWith("Z")) {
//     const date = new Date(input);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     const parts = new Intl.DateTimeFormat("en-CA", {
//       timeZone: CALIFORNIA_TIMEZONE,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hourCycle: "h23",
//     }).formatToParts(date);

//     const values = {};

//     for (const part of parts) {
//       if (part.type !== "literal") {
//         values[part.type] = part.value;
//       }
//     }

//     return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
//   }

//   // ----------------------------------------------------------------------
//   // ISO without timezone
//   // ----------------------------------------------------------------------

//   const match = input.match(
//     /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
//   );

//   if (match) {
//     const [
//       ,
//       year,
//       month,
//       day,
//       hour,
//       minute,
//       second = "00",
//     ] = match;

//     return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
//   }

//   return null;
// }


// // ========================================================================
// // DATE ONLY
// // ========================================================================

// function normalizeDate(value) {
//   if (!value) {
//     return null;
//   }

//   const match = String(value)
//     .trim()
//     .match(/^(\d{4})-(\d{2})-(\d{2})/);

//   if (!match) {
//     return null;
//   }

//   return `${match[1]}-${match[2]}-${match[3]}`;
// }


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
//     console.error(
//       "LOGIN HISTORY AUTH ERROR:",
//       error
//     );

//     return {
//       authenticated: false,
//       user: null,
//       message:
//         "Invalid or expired authentication token",
//     };
//   }
// }


// // ========================================================================
// // ADMIN CHECK
// // ========================================================================

// function isAdmin(user) {
//   return (
//     String(user?.role || "").toLowerCase() ===
//     "admin"
//   );
// }


// // ========================================================================
// // COMMON SELECT
// // ========================================================================
// //
// // login_time / logout_time are already stored as California wall-clock
// // values.
// //
// // Therefore TIME() and DATE() can be used directly.
// //
// // ========================================================================

// const HISTORY_SELECT = `
//   SELECT
//     lh.id,

//     u.id AS user_id,
//     u.name,
//     u.email,
//     u.role,
//     u.team,

//     DATE_FORMAT(
//       lh.login_time,
//       '%Y-%m-%d %H:%i:%s'
//     ) AS login_time,

//     CASE
//       WHEN lh.logout_time IS NULL
//         THEN NULL
//       ELSE DATE_FORMAT(
//         lh.logout_time,
//         '%Y-%m-%d %H:%i:%s'
//       )
//     END AS logout_time,

//     lh.ip_address,
//     lh.user_agent,

//     CASE
//       WHEN TIME(lh.login_time) <= '${ATTENDANCE_CUTOFF}'
//         THEN 'On Time'
//       ELSE 'Late'
//     END AS attendance_status

//   FROM login_history lh

//   INNER JOIN users u
//     ON lh.user_id = u.id
// `;


// // ========================================================================
// // GET
// // ========================================================================
// //
// // ADMIN:
// //   All attendance
// //
// // USER:
// //   Own attendance only
// //
// // Examples:
// //
// // /api/login-history
// //
// // /api/login-history?from=2026-09-01&to=2026-09-15
// //
// // ========================================================================

// export async function GET(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//           history: [],
//         },
//         { status: 401 }
//       );
//     }

//     const user = auth.user;

//     const admin = isAdmin(user);


//     // --------------------------------------------------------------------
//     // CURRENT USER ID
//     // --------------------------------------------------------------------

//     const currentUserId =
//       user?.id ??
//       user?.user_id ??
//       user?.userId ??
//       null;


//     // --------------------------------------------------------------------
//     // NORMAL USER MUST HAVE ID
//     // --------------------------------------------------------------------

//     if (!admin && !currentUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User ID not found in authentication token",
//           history: [],
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // QUERY PARAMETERS
//     // --------------------------------------------------------------------

//     const { searchParams } =
//       new URL(request.url);

//     const from =
//       normalizeDate(
//         searchParams.get("from")
//       );

//     const to =
//       normalizeDate(
//         searchParams.get("to")
//       );


//     // --------------------------------------------------------------------
//     // CONDITIONS
//     // --------------------------------------------------------------------

//     const conditions = [];
//     const values = [];


//     // --------------------------------------------------------------------
//     // NORMAL USER FILTER
//     // --------------------------------------------------------------------

//     if (!admin) {
//       conditions.push(
//         "lh.user_id = ?"
//       );

//       values.push(currentUserId);
//     }


//     // --------------------------------------------------------------------
//     // FROM DATE
//     // --------------------------------------------------------------------

//     if (from) {
//       conditions.push(
//         "DATE(lh.login_time) >= ?"
//       );

//       values.push(from);
//     }


//     // --------------------------------------------------------------------
//     // TO DATE
//     // --------------------------------------------------------------------

//     if (to) {
//       conditions.push(
//         "DATE(lh.login_time) <= ?"
//       );

//       values.push(to);
//     }


//     // --------------------------------------------------------------------
//     // WHERE
//     // --------------------------------------------------------------------

//     const whereClause =
//       conditions.length > 0
//         ? `WHERE ${conditions.join(" AND ")}`
//         : "";


//     // --------------------------------------------------------------------
//     // FETCH HISTORY
//     // --------------------------------------------------------------------

//     const [history] =
//       await db.execute(
//         `
//         ${HISTORY_SELECT}

//         ${whereClause}

//         ORDER BY lh.login_time DESC
//         `,
//         values
//       );


//     // --------------------------------------------------------------------
//     // COUNTS
//     // --------------------------------------------------------------------

//     const total =
//       history.length;

//     const late =
//       history.filter(
//         (item) =>
//           item.attendance_status ===
//           "Late"
//       ).length;

//     const onTime =
//       history.filter(
//         (item) =>
//           item.attendance_status ===
//           "On Time"
//       ).length;


//     // --------------------------------------------------------------------
//     // CURRENT CALIFORNIA TIME
//     // --------------------------------------------------------------------

//     const californiaNow =
//       getCaliforniaDateTime();


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       role:
//         admin
//           ? "admin"
//           : "user",

//       user_id:
//         currentUserId,

//       timezone:
//         CALIFORNIA_TIMEZONE,

//       current_california_time:
//         californiaNow,

//       total,

//       late,

//       on_time:
//         onTime,

//       cutoff_time:
//         ATTENDANCE_CUTOFF,

//       cutoff_timezone:
//         CALIFORNIA_TIMEZONE,

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
// // ADMIN ONLY
// //
// // Creates manual attendance.
// //
// // ========================================================================

// export async function POST(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // BODY
//     // --------------------------------------------------------------------

//     const body =
//       await request.json();

//     const {
//       user_id,
//       login_time,
//       logout_time = null,
//       ip_address = null,
//       user_agent = null,
//     } = body;


//     // --------------------------------------------------------------------
//     // VALIDATE USER
//     // --------------------------------------------------------------------

//     if (!user_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "user_id is required",
//         },
//         { status: 400 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // VALIDATE LOGIN
//     // --------------------------------------------------------------------

//     if (!login_time) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "login_time is required",
//         },
//         { status: 400 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // NORMALIZE TIMES TO CALIFORNIA
//     // --------------------------------------------------------------------

//     const californiaLoginTime =
//       normalizeToCaliforniaDateTime(
//         login_time
//       );

//     const californiaLogoutTime =
//       logout_time
//         ? normalizeToCaliforniaDateTime(
//             logout_time
//           )
//         : null;


//     if (!californiaLoginTime) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid login_time",
//         },
//         { status: 400 }
//       );
//     }


//     if (
//       logout_time &&
//       !californiaLogoutTime
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid logout_time",
//         },
//         { status: 400 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // CHECK USER
//     // --------------------------------------------------------------------

//     const [users] =
//       await db.execute(
//         `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           team
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [user_id]
//       );


//     if (users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User not found",
//         },
//         { status: 404 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // INSERT
//     // --------------------------------------------------------------------

//     const [result] =
//       await db.execute(
//         `
//         INSERT INTO login_history
//         (
//           user_id,
//           login_time,
//           logout_time,
//           ip_address,
//           user_agent
//         )
//         VALUES (?, ?, ?, ?, ?)
//         `,
//         [
//           user_id,
//           californiaLoginTime,
//           californiaLogoutTime,
//           ip_address,
//           user_agent,
//         ]
//       );


//     // --------------------------------------------------------------------
//     // FETCH CREATED RECORD
//     // --------------------------------------------------------------------

//     const [newRecord] =
//       await db.execute(
//         `
//         ${HISTORY_SELECT}

//         WHERE lh.id = ?

//         LIMIT 1
//         `,
//         [result.insertId]
//       );


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Attendance added successfully",

//         timezone:
//           CALIFORNIA_TIMEZONE,

//         record:
//           newRecord[0] ||
//           null,
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
// // ADMIN ONLY
// //
// // ========================================================================

// export async function PUT(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // BODY
//     // --------------------------------------------------------------------

//     const body =
//       await request.json();

//     const {
//       id,
//       user_id,
//       login_time,
//       logout_time,
//       ip_address,
//       user_agent,
//     } = body;


//     // --------------------------------------------------------------------
//     // VALIDATE ID
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // CHECK EXISTING
//     // --------------------------------------------------------------------

//     const [existing] =
//       await db.execute(
//         `
//         SELECT
//           id,
//           user_id,
//           login_time,
//           logout_time
//         FROM login_history
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [id]
//       );


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


//     // --------------------------------------------------------------------
//     // VALIDATE USER
//     // --------------------------------------------------------------------

//     if (
//       user_id !== undefined &&
//       user_id !== null &&
//       user_id !== ""
//     ) {
//       const [users] =
//         await db.execute(
//           `
//           SELECT id
//           FROM users
//           WHERE id = ?
//           LIMIT 1
//           `,
//           [user_id]
//         );


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


//     // --------------------------------------------------------------------
//     // BUILD UPDATE
//     // --------------------------------------------------------------------

//     const updates = [];
//     const values = [];


//     if (user_id !== undefined) {
//       updates.push(
//         "user_id = ?"
//       );

//       values.push(user_id);
//     }


//     if (login_time !== undefined) {
//       const normalizedLogin =
//         normalizeToCaliforniaDateTime(
//           login_time
//         );

//       if (!normalizedLogin) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Invalid login_time",
//           },
//           { status: 400 }
//         );
//       }

//       updates.push(
//         "login_time = ?"
//       );

//       values.push(normalizedLogin);
//     }


//     if (logout_time !== undefined) {
//       let normalizedLogout = null;

//       if (
//         logout_time !== null &&
//         logout_time !== ""
//       ) {
//         normalizedLogout =
//           normalizeToCaliforniaDateTime(
//             logout_time
//           );

//         if (!normalizedLogout) {
//           return NextResponse.json(
//             {
//               success: false,
//               message:
//                 "Invalid logout_time",
//             },
//             { status: 400 }
//           );
//         }
//       }

//       updates.push(
//         "logout_time = ?"
//       );

//       values.push(normalizedLogout);
//     }


//     if (ip_address !== undefined) {
//       updates.push(
//         "ip_address = ?"
//       );

//       values.push(ip_address);
//     }


//     if (user_agent !== undefined) {
//       updates.push(
//         "user_agent = ?"
//       );

//       values.push(user_agent);
//     }


//     // --------------------------------------------------------------------
//     // NOTHING TO UPDATE
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // UPDATE
//     // --------------------------------------------------------------------

//     await db.execute(
//       `
//       UPDATE login_history
//       SET ${updates.join(", ")}
//       WHERE id = ?
//       `,
//       values
//     );


//     // --------------------------------------------------------------------
//     // FETCH UPDATED
//     // --------------------------------------------------------------------

//     const [updated] =
//       await db.execute(
//         `
//         ${HISTORY_SELECT}

//         WHERE lh.id = ?

//         LIMIT 1
//         `,
//         [id]
//       );


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       message:
//         "Attendance updated successfully",

//       timezone:
//         CALIFORNIA_TIMEZONE,

//       record:
//         updated[0] ||
//         null,
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
// // ADMIN ONLY
// //
// // ========================================================================

// export async function DELETE(request) {
//   try {
//     // --------------------------------------------------------------------
//     // AUTH
//     // --------------------------------------------------------------------

//     const auth =
//       getAuthenticatedUser(request);

//     if (!auth.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             auth.message ||
//             "Authentication required",
//         },
//         { status: 401 }
//       );
//     }


//     // --------------------------------------------------------------------
//     // ADMIN ONLY
//     // --------------------------------------------------------------------

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


//     // --------------------------------------------------------------------
//     // ID
//     // --------------------------------------------------------------------

//     const { searchParams } =
//       new URL(request.url);

//     const id =
//       searchParams.get("id");


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


//     // --------------------------------------------------------------------
//     // CHECK RECORD
//     // --------------------------------------------------------------------

//     const [existing] =
//       await db.execute(
//         `
//         SELECT
//           id,
//           user_id
//         FROM login_history
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [id]
//       );


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


//     // --------------------------------------------------------------------
//     // DELETE
//     // --------------------------------------------------------------------

//     await db.execute(
//       `
//       DELETE FROM login_history
//       WHERE id = ?
//       `,
//       [id]
//     );


//     // --------------------------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------------------------

//     return NextResponse.json({
//       success: true,

//       message:
//         "Attendance deleted successfully",

//       deleted_id:
//         Number(id),

//       timezone:
//         CALIFORNIA_TIMEZONE,
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






// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// const CALIFORNIA_TIMEZONE = "America/Los_Angeles";
// const ATTENDANCE_CUTOFF = "08:15:00";

// /* =========================================================
//    AUTH
// ========================================================= */

// async function getAuthUser() {
//   try {
//     const token = (await import("next/headers")).cookies
//       ? null
//       : null;
//   } catch {}

//   return null;
// }

// /*
//   Next.js route cookies helper
// */
// async function getCurrentUser() {
//   try {
//     const { cookies } = await import("next/headers");
//     const cookieStore = await cookies();

//     const token = cookieStore.get("token")?.value;

//     if (!token) {
//       return null;
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     if (!decoded?.id) {
//       return null;
//     }

//     /*
//       Get current DB user so role changes are respected
//     */
//     const [rows] = await db.query(
//       `
//       SELECT
//         id,
//         name,
//         email,
//         role,
//         status
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [decoded.id]
//     );

//     if (!rows.length) {
//       return null;
//     }

//     return rows[0];
//   } catch (error) {
//     console.error("AUTH ERROR:", error);
//     return null;
//   }
// }

// /* =========================================================
//    CALIFORNIA DATE HELPERS
// ========================================================= */

// function normalizeToCaliforniaDateTime(value) {
//   if (!value) return null;

//   const input = String(value).trim();

//   /*
//     ISO / UTC input
//   */
//   if (input.endsWith("Z")) {
//     const date = new Date(input);

//     if (Number.isNaN(date.getTime())) {
//       return null;
//     }

//     const parts = new Intl.DateTimeFormat("en-CA", {
//       timeZone: CALIFORNIA_TIMEZONE,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hourCycle: "h23",
//     }).formatToParts(date);

//     const values = {};

//     for (const part of parts) {
//       if (part.type !== "literal") {
//         values[part.type] = part.value;
//       }
//     }

//     return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
//   }

//   /*
//     Already California wall-clock time
//   */
//   const match = input.match(
//     /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
//   );

//   if (match) {
//     const [
//       ,
//       year,
//       month,
//       day,
//       hour,
//       minute,
//       second = "00",
//     ] = match;

//     return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
//   }

//   return null;
// }

// function isValidDateTime(value) {
//   return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
//     String(value || "")
//   );
// }

// /* =========================================================
//    GET
// ========================================================= */

// export async function GET(request) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     const { searchParams } = new URL(request.url);

//     const from = searchParams.get("from");
//     const to = searchParams.get("to");

//     let sql = `
//       SELECT
//         lh.id,
//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,

//         DATE_FORMAT(
//           lh.login_time,
//           '%Y-%m-%d %H:%i:%s'
//         ) AS login_time,

//         CASE
//           WHEN lh.logout_time IS NULL THEN NULL
//           ELSE DATE_FORMAT(
//             lh.logout_time,
//             '%Y-%m-%d %H:%i:%s'
//           )
//         END AS logout_time,

//         lh.ip_address,
//         lh.user_agent,

//         CASE
//           WHEN TIME(lh.login_time) <= ?
//           THEN 'On Time'
//           ELSE 'Late'
//         END AS attendance_status,

//         CASE
//           WHEN lh.logout_time IS NULL THEN NULL
//           ELSE TIMESTAMPDIFF(
//             SECOND,
//             lh.login_time,
//             lh.logout_time
//           )
//         END AS duration_seconds

//       FROM login_history lh

//       INNER JOIN users u
//         ON lh.user_id = u.id

//       WHERE 1 = 1
//     `;

//     const params = [ATTENDANCE_CUTOFF];

//     /*
//       Normal users see only their own records
//     */
//     if (String(user.role).toLowerCase() !== "admin") {
//       sql += ` AND lh.user_id = ? `;
//       params.push(user.id);
//     }

//     /*
//       Date filter
//     */
//     if (from) {
//       sql += ` AND DATE(lh.login_time) >= ? `;
//       params.push(from);
//     }

//     if (to) {
//       sql += ` AND DATE(lh.login_time) <= ? `;
//       params.push(to);
//     }

//     sql += `
//       ORDER BY
//         lh.login_time DESC,
//         u.name ASC
//     `;

//     const [history] = await db.query(sql, params);

//     return NextResponse.json({
//       success: true,
//       history,
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY GET ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to load attendance",
//       },
//       { status: 500 }
//     );
//   }
// }

// /* =========================================================
//    POST - ADMIN ADD ATTENDANCE
// ========================================================= */

// export async function POST(request) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     if (String(user.role).toLowerCase() !== "admin") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only admin can add attendance",
//         },
//         { status: 403 }
//       );
//     }

//     const body = await request.json();

//     const {
//       user_id,
//       login_time,
//       logout_time,
//       ip_address,
//       user_agent,
//     } = body;

//     if (!user_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Employee is required",
//         },
//         { status: 400 }
//       );
//     }

//     const californiaLoginTime =
//       normalizeToCaliforniaDateTime(login_time);

//     const californiaLogoutTime =
//       logout_time
//         ? normalizeToCaliforniaDateTime(logout_time)
//         : null;

//     if (!californiaLoginTime) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid login time",
//         },
//         { status: 400 }
//       );
//     }

//     if (
//       californiaLogoutTime &&
//       !isValidDateTime(californiaLogoutTime)
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid logout time",
//         },
//         { status: 400 }
//       );
//     }

//     if (
//       californiaLogoutTime &&
//       californiaLogoutTime < californiaLoginTime
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Logout time cannot be before login time",
//         },
//         { status: 400 }
//       );
//     }

//     /*
//       Verify employee exists
//     */
//     const [employee] = await db.query(
//       `
//       SELECT id
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [Number(user_id)]
//     );

//     if (!employee.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Employee not found",
//         },
//         { status: 404 }
//       );
//     }

//     const [result] = await db.query(
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
//         Number(user_id),
//         californiaLoginTime,
//         californiaLogoutTime,
//         ip_address || null,
//         user_agent || null,
//       ]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Attendance added successfully",
//       id: result.insertId,
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY POST ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to add attendance",
//       },
//       { status: 500 }
//     );
//   }
// }

// /* =========================================================
//    PUT - ADMIN EDIT ATTENDANCE
// ========================================================= */

// export async function PUT(request) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     if (String(user.role).toLowerCase() !== "admin") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only admin can edit attendance",
//         },
//         { status: 403 }
//       );
//     }

//     const body = await request.json();

//     const {
//       id,
//       user_id,
//       login_time,
//       logout_time,
//       ip_address,
//       user_agent,
//     } = body;

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance ID is required",
//         },
//         { status: 400 }
//       );
//     }

//     if (!user_id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Employee is required",
//         },
//         { status: 400 }
//       );
//     }

//     const californiaLoginTime =
//       normalizeToCaliforniaDateTime(login_time);

//     const californiaLogoutTime =
//       logout_time
//         ? normalizeToCaliforniaDateTime(logout_time)
//         : null;

//     if (!californiaLoginTime) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid login time",
//         },
//         { status: 400 }
//       );
//     }

//     if (
//       californiaLogoutTime &&
//       californiaLogoutTime < californiaLoginTime
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Logout time cannot be before login time",
//         },
//         { status: 400 }
//       );
//     }

//     const [employee] = await db.query(
//       `
//       SELECT id
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [Number(user_id)]
//     );

//     if (!employee.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Employee not found",
//         },
//         { status: 404 }
//       );
//     }

//     const [existing] = await db.query(
//       `
//       SELECT id
//       FROM login_history
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [Number(id)]
//     );

//     if (!existing.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance record not found",
//         },
//         { status: 404 }
//       );
//     }

//     await db.query(
//       `
//       UPDATE login_history
//       SET
//         user_id = ?,
//         login_time = ?,
//         logout_time = ?,
//         ip_address = ?,
//         user_agent = ?
//       WHERE id = ?
//       `,
//       [
//         Number(user_id),
//         californiaLoginTime,
//         californiaLogoutTime,
//         ip_address || null,
//         user_agent || null,
//         Number(id),
//       ]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Attendance updated successfully",
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY PUT ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to update attendance",
//       },
//       { status: 500 }
//     );
//   }
// }

// /* =========================================================
//    DELETE - ADMIN ONLY
// ========================================================= */

// export async function DELETE(request) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     if (String(user.role).toLowerCase() !== "admin") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Only admin can delete attendance",
//         },
//         { status: 403 }
//       );
//     }

//     const { searchParams } = new URL(request.url);

//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance ID is required",
//         },
//         { status: 400 }
//       );
//     }

//     const [result] = await db.query(
//       `
//       DELETE FROM login_history
//       WHERE id = ?
//       `,
//       [Number(id)]
//     );

//     if (!result.affectedRows) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Attendance record not found",
//         },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Attendance deleted successfully",
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY DELETE ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to delete attendance",
//       },
//       { status: 500 }
//     );
//   }
// }


















import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";
const ATTENDANCE_CUTOFF = "08:15:00";

/* =========================================================
   AUTH
========================================================= */

async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.id) {
      return null;
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [decoded.id]
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return null;
  }
}

/* =========================================================
   CALIFORNIA DATE HELPERS
========================================================= */

function normalizeToCaliforniaDateTime(value) {
  if (!value) return null;

  const input = String(value).trim();

  if (input.endsWith("Z")) {
    const date = new Date(input);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: CALIFORNIA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);

    const values = {};

    for (const part of parts) {
      if (part.type !== "literal") {
        values[part.type] = part.value;
      }
    }

    return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
  }

  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (match) {
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second = "00",
    ] = match;

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  return null;
}

function isValidDateTime(value) {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
    String(value || "")
  );
}

/* =========================================================
   GET
========================================================= */

export async function GET(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let sql = `
      SELECT
        lh.id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.team,

        DATE_FORMAT(
          lh.login_time,
          '%Y-%m-%d %H:%i:%s'
        ) AS login_time,

        CASE
          WHEN lh.logout_time IS NULL THEN NULL
          ELSE DATE_FORMAT(
            lh.logout_time,
            '%Y-%m-%d %H:%i:%s'
          )
        END AS logout_time,

        lh.ip_address,
        lh.user_agent,

        CASE
          WHEN TIME(lh.login_time) <= ?
          THEN 'On Time'
          ELSE 'Late'
        END AS attendance_status,

        CASE
          WHEN lh.logout_time IS NULL THEN NULL
          ELSE TIMESTAMPDIFF(
            SECOND,
            lh.login_time,
            lh.logout_time
          )
        END AS duration_seconds

      FROM login_history lh

      INNER JOIN users u
        ON lh.user_id = u.id

      WHERE 1 = 1
    `;

    const params = [ATTENDANCE_CUTOFF];

    if (
      String(user.role).toLowerCase() !== "admin"
    ) {
      sql += ` AND lh.user_id = ? `;
      params.push(user.id);
    }

    if (from) {
      sql += ` AND DATE(lh.login_time) >= ? `;
      params.push(from);
    }

    if (to) {
      sql += ` AND DATE(lh.login_time) <= ? `;
      params.push(to);
    }

    sql += `
      ORDER BY
        lh.login_time DESC,
        u.name ASC
    `;

    const [history] = await db.query(sql, params);

    return NextResponse.json({
      success: true,
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
        message: "Failed to load attendance",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST - ADMIN ADD
========================================================= */

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      String(user.role).toLowerCase() !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin can add attendance",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      user_id,
      login_time,
      logout_time,
      ip_address,
      user_agent,
    } = body;

    const employeeId = Number(user_id);

    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid employee is required",
        },
        { status: 400 }
      );
    }

    const californiaLoginTime =
      normalizeToCaliforniaDateTime(login_time);

    const californiaLogoutTime = logout_time
      ? normalizeToCaliforniaDateTime(logout_time)
      : null;

    if (
      !californiaLoginTime ||
      !isValidDateTime(californiaLoginTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login time",
        },
        { status: 400 }
      );
    }

    if (
      californiaLogoutTime &&
      !isValidDateTime(californiaLogoutTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid logout time",
        },
        { status: 400 }
      );
    }

    if (
      californiaLogoutTime &&
      californiaLogoutTime < californiaLoginTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Logout time cannot be before login time",
        },
        { status: 400 }
      );
    }

    const [employee] = await db.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [employeeId]
    );

    if (!employee.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    const [result] = await db.query(
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
        employeeId,
        californiaLoginTime,
        californiaLogoutTime,
        ip_address || null,
        user_agent || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Attendance added successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error(
      "LOGIN HISTORY POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add attendance",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT - ADMIN EDIT
========================================================= */

export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      String(user.role).toLowerCase() !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin can edit attendance",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      id,
      user_id,
      login_time,
      logout_time,
      ip_address,
      user_agent,
    } = body;

    const attendanceId = Number(id);
    const employeeId = Number(user_id);

    if (
      !Number.isInteger(attendanceId) ||
      attendanceId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid attendance ID is required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid employee is required",
        },
        { status: 400 }
      );
    }

    const californiaLoginTime =
      normalizeToCaliforniaDateTime(login_time);

    const californiaLogoutTime = logout_time
      ? normalizeToCaliforniaDateTime(logout_time)
      : null;

    if (
      !californiaLoginTime ||
      !isValidDateTime(californiaLoginTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login time",
        },
        { status: 400 }
      );
    }

    if (
      californiaLogoutTime &&
      !isValidDateTime(californiaLogoutTime)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid logout time",
        },
        { status: 400 }
      );
    }

    if (
      californiaLogoutTime &&
      californiaLogoutTime < californiaLoginTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Logout time cannot be before login time",
        },
        { status: 400 }
      );
    }

    const [employee] = await db.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [employeeId]
    );

    if (!employee.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    const [existing] = await db.query(
      `
      SELECT id
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    if (!existing.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    await db.query(
      `
      UPDATE login_history
      SET
        user_id = ?,
        login_time = ?,
        logout_time = ?,
        ip_address = ?,
        user_agent = ?
      WHERE id = ?
      `,
      [
        employeeId,
        californiaLoginTime,
        californiaLogoutTime,
        ip_address || null,
        user_agent || null,
        attendanceId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
    });
  } catch (error) {
    console.error(
      "LOGIN HISTORY PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update attendance",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   DELETE - ADMIN ONLY
========================================================= */

export async function DELETE(request) {
  try {
    console.log("=================================");
    console.log("DELETE ATTENDANCE REQUEST");
    console.log("=================================");

    const user = await getCurrentUser();

    console.log(
      "DELETE USER:",
      user
        ? {
            id: user.id,
            name: user.name,
            role: user.role,
          }
        : null
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (
      String(user.role).toLowerCase() !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin can delete attendance",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    console.log("DELETE ID FROM URL:", id);

    const attendanceId = Number(id);

    if (
      !Number.isInteger(attendanceId) ||
      attendanceId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid attendance ID is required",
        },
        { status: 400 }
      );
    }

    /*
      First check record exists
    */
    const [beforeDelete] = await db.query(
      `
      SELECT
        id,
        user_id,
        login_time
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    console.log(
      "RECORD BEFORE DELETE:",
      beforeDelete
    );

    if (!beforeDelete.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance record not found",
        },
        { status: 404 }
      );
    }

    /*
      PERMANENT DELETE
    */
    const [result] = await db.query(
      `
      DELETE FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    console.log(
      "DELETE RESULT:",
      {
        affectedRows: result.affectedRows,
      }
    );

    if (result.affectedRows !== 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attendance was not deleted",
        },
        { status: 500 }
      );
    }

    /*
      Verify deletion
    */
    const [afterDelete] = await db.query(
      `
      SELECT id
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [attendanceId]
    );

    console.log(
      "RECORD AFTER DELETE:",
      afterDelete
    );

    if (afterDelete.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delete verification failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Attendance deleted permanently",
      deletedId: attendanceId,
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