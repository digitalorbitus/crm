






// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import db from "../../lib/db";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// // 1. GET ALL USERS
// export async function GET() {
//   try {
// const [users] = await db.query(`
//   SELECT 
//     id, 
//     name, 
//     email, 
//     phone, 
//     role, 
//     team, 
//     status, 
//     avatar, 
//     last_login, 
//     login_time, 
//     logout_time,
//     break_start,
//     break_end,
//     created_at 
//   FROM users
//   ORDER BY id DESC
// `);

//     return NextResponse.json({
//       success: true,
//       users,
//     });
//   } catch (error) {
//     console.error("GET USERS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch users",
//       },
//       { status: 500 }
//     );
//   }
// }


// // 2. CREATE NEW USER (With Image Support)
// export async function POST(request) {
//   try {
//     // FIX: JSON ki jagah FormData read karein
//     const formData = await request.formData();

//     const fullName = formData.get("fullName");
//     const email = formData.get("email");
//     const phone = formData.get("phone");
//     const role = formData.get("role");
//     const team = formData.get("team");
//     const status = formData.get("status");
//     const password = formData.get("password");
    
//     // File object extract karein
//     const avatarFile = formData.get("avatar"); 

//     // Required fields check
//     if (!fullName || !email || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Name, email and password are required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check existing email
//     const [existing] = await db.query(
//       "SELECT id FROM users WHERE email = ? LIMIT 1",
//       [email]
//     );

//     if (existing.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email already exists",
//         },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Clean role
//     const cleanRole = String(role || "agent").toLowerCase();
//     const allowedRoles = ["admin", "staff", "agent"];

//     if (!allowedRoles.includes(cleanRole)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid role. Allowed roles: admin, staff, agent",
//         },
//         { status: 400 }
//       );
//     }

//     // Status validation
//     const cleanStatus = status || "Active";
//     if (!["Active", "Inactive"].includes(cleanStatus)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid status. Allowed status: Active, Inactive",
//         },
//         { status: 400 }
//       );
//     }

//     // --- IMAGE UPLOADING LOGIC ---





         
//     let avatarUrl = null;

//     if (avatarFile && typeof avatarFile === "object" && avatarFile.name) {
//       const bytes = await avatarFile.arrayBuffer();
//       const buffer = Buffer.from(bytes);


//       // Unique filename create karein
//       const uniqueFilename = `${Date.now()}-${avatarFile.name.replace(/\s+/g, "_")}`;
      
//       // Save folder path (public/uploads)
//       const uploadDir = path.join(process.cwd(), "public/uploads");

//       // Check karein agar uploads folder nahi hai toh auto-create ho jaye
//       await mkdir(uploadDir, { recursive: true });

//       // File system me save karein
//       const filePath = path.join(uploadDir, uniqueFilename);
//       await writeFile(filePath, buffer);

//       // Relative path for database storing
//       avatarUrl = `/uploads/${uniqueFilename}`;
//     }

//     // --- CREATE USER IN DATABASE ---
//     const [result] = await db.query(
//       `
//       INSERT INTO users
//       (
//         name,
//         email,
//         phone,
//         password_hash,
//         role,
//         team,
//         status,
//         avatar
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         fullName,
//         email,
//         phone || null,
//         passwordHash,
//         cleanRole,
//         team || "Sales",
//         cleanStatus,
//         avatarUrl,
//       ]
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User created successfully",
//         userId: result.insertId,
//         avatarUrl,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("CREATE USER ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to create user",
//       },
//       { status: 500 }
//     );
//   }
// }

// // 3. UPDATE USER BREAK TIME
// export async function PATCH(request) {
//   try {
//     const body = await request.json();

//     const {
//       userId,
//       applyAll,
//       break_start,
//       break_end,
//     } = body;

//     const normalizedBreakStart = break_start || null;
//     const normalizedBreakEnd = break_end || null;

//     if (applyAll) {
//       await db.query(
//         `
//         UPDATE users
//         SET
//           break_start = ?,
//           break_end = ?
//         `,
//         [
//           normalizedBreakStart,
//           normalizedBreakEnd,
//         ]
//       );

//       return NextResponse.json({
//         success: true,
//         message: "Break time updated for all users successfully",
//       });
//     }

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User ID is required",
//         },
//         { status: 400 }
//       );
//     }

//     await db.query(
//       `
//       UPDATE users
//       SET
//         break_start = ?,
//         break_end = ?
//       WHERE id = ?
//       `,
//       [
//         normalizedBreakStart,
//         normalizedBreakEnd,
//         userId,
//       ]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Break time updated successfully",
//     });

//   } catch (error) {
//     console.error("UPDATE BREAK TIME ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Failed to update break time",
//       },
//       { status: 500 }
//     );
//   }
// }















// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import db from "../../lib/db";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// // ======================================================
// // 1. GET ALL USERS
// // ======================================================

// export async function GET() {
//   try {
//     const [users] = await db.query(`
//       SELECT
//         id,
//         name,
//         email,
//         phone,
//         role,
//         team,

//         -- Old status field
//         status,

//         -- New availability status
//         availability_status,
//         status_started_at,

//         avatar,
//         last_login,
//         login_time,
//         logout_time,
//         break_start,
//         break_end,
//         created_at

//       FROM users
//       ORDER BY id DESC
//     `);

//     // Keep frontend compatible
//     const formattedUsers = users.map((user) => ({
//       ...user,

//       // availability_status is now the MAIN status
//       availability_status:
//         user.availability_status ||
//         user.status ||
//         "Active",

//       // Also return status using availability_status
//       // so old frontend code does not break
//       status:
//         user.availability_status ||
//         user.status ||
//         "Active",

//       status_started_at:
//         user.status_started_at || null,
//     }));

//     return NextResponse.json({
//       success: true,
//       users: formattedUsers,
//     });

//   } catch (error) {
//     console.error("GET USERS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Failed to fetch users",
//       },
//       { status: 500 }
//     );
//   }
// }


// // ======================================================
// // 2. CREATE NEW USER
// // ======================================================

// export async function POST(request) {
//   try {
//     // FormData read karein
//     const formData = await request.formData();

//     const fullName = formData.get("fullName");
//     const email = formData.get("email");
//     const phone = formData.get("phone");
//     const role = formData.get("role");
//     const team = formData.get("team");
//     const status = formData.get("status");
//     const password = formData.get("password");

//     // File object
//     const avatarFile = formData.get("avatar");

//     // Required fields
//     if (!fullName || !email || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Name, email and password are required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check existing email
//     const [existing] = await db.query(
//       `
//         SELECT id
//         FROM users
//         WHERE email = ?
//         LIMIT 1
//       `,
//       [email]
//     );

//     if (existing.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email already exists",
//         },
//         { status: 409 }
//       );
//     }

//     // Hash password
//     const passwordHash = await bcrypt.hash(
//       password,
//       10
//     );

//     // Clean role
//     const cleanRole = String(
//       role || "agent"
//     ).toLowerCase();

//     const allowedRoles = [
//       "admin",
//       "staff",
//       "agent",
//     ];

//     if (!allowedRoles.includes(cleanRole)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid role. Allowed roles: admin, staff, agent",
//         },
//         { status: 400 }
//       );
//     }

//     // ==================================================
//     // STATUS
//     // ==================================================

//     const cleanStatus =
//       status || "Active";

//     if (
//       ![
//         "Active",
//         "Inactive",
//       ].includes(cleanStatus)
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid status. Allowed status: Active, Inactive",
//         },
//         { status: 400 }
//       );
//     }

//     // ==================================================
//     // IMAGE UPLOAD
//     // ==================================================

//     let avatarUrl = null;

//     if (
//       avatarFile &&
//       typeof avatarFile === "object" &&
//       avatarFile.name
//     ) {
//       const bytes =
//         await avatarFile.arrayBuffer();

//       const buffer =
//         Buffer.from(bytes);

//       // Unique filename
//       const uniqueFilename =
//         `${Date.now()}-${avatarFile.name.replace(
//           /\s+/g,
//           "_"
//         )}`;

//       // Upload directory
//       const uploadDir =
//         path.join(
//           process.cwd(),
//           "public/uploads"
//         );

//       // Create folder if missing
//       await mkdir(
//         uploadDir,
//         {
//           recursive: true,
//         }
//       );

//       // File path
//       const filePath =
//         path.join(
//           uploadDir,
//           uniqueFilename
//         );

//       // Save file
//       await writeFile(
//         filePath,
//         buffer
//       );

//       // DB path
//       avatarUrl =
//         `/uploads/${uniqueFilename}`;
//     }

//     // ==================================================
//     // CREATE USER
//     // ==================================================

//     const [result] =
//       await db.query(
//         `
//           INSERT INTO users
//           (
//             name,
//             email,
//             phone,
//             password_hash,
//             role,
//             team,

//             status,
//             availability_status,
//             status_started_at,

//             avatar
//           )
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `,
//         [
//           fullName,
//           email,
//           phone || null,
//           passwordHash,
//           cleanRole,
//           team || "Sales",

//           // Old status
//           cleanStatus,

//           // New availability status
//           cleanStatus,

//           // New user starts without timer
//           null,

//           avatarUrl,
//         ]
//       );

//     return NextResponse.json(
//       {
//         success: true,
//         message:
//           "User created successfully",
//         userId:
//           result.insertId,
//         avatarUrl,
//       },
//       { status: 201 }
//     );

//   } catch (error) {
//     console.error(
//       "CREATE USER ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Failed to create user",
//       },
//       { status: 500 }
//     );
//   }
// }


// // ======================================================
// // 3. UPDATE USER BREAK TIME
// // ======================================================

// export async function PATCH(request) {
//   try {
//     const body =
//       await request.json();

//     const {
//       userId,
//       applyAll,
//       break_start,
//       break_end,
//     } = body;

//     const normalizedBreakStart =
//       break_start || null;

//     const normalizedBreakEnd =
//       break_end || null;

//     // ==================================================
//     // APPLY TO ALL USERS
//     // ==================================================

//     if (applyAll) {
//       await db.query(
//         `
//           UPDATE users
//           SET
//             break_start = ?,
//             break_end = ?
//         `,
//         [
//           normalizedBreakStart,
//           normalizedBreakEnd,
//         ]
//       );

//       return NextResponse.json({
//         success: true,
//         message:
//           "Break time updated for all users successfully",
//       });
//     }

//     // ==================================================
//     // SINGLE USER
//     // ==================================================

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User ID is required",
//         },
//         { status: 400 }
//       );
//     }

//     const [result] =
//       await db.query(
//         `
//           UPDATE users
//           SET
//             break_start = ?,
//             break_end = ?
//           WHERE id = ?
//         `,
//         [
//           normalizedBreakStart,
//           normalizedBreakEnd,
//           userId,
//         ]
//       );

//     if (result.affectedRows === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message:
//         "Break time updated successfully",
//     });

//   } catch (error) {
//     console.error(
//       "UPDATE BREAK TIME ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Failed to update break time",
//       },
//       { status: 500 }
//     );
//   }
// }











import { NextResponse } from "next/server";
import db from "../../lib/db";

// ======================================================
// GET - ALL USERS
// ======================================================
export async function GET() {
  try {
    const [users] = await db.query(`
      SELECT
        id,
        name,
        email,
        phone,
        role,
        team,
        status,
        availability_status,
        status_started_at,
        avatar,
        last_login,
        login_time,
        logout_time,
        break_start,
        break_end,
        created_at,
        updated_at
      FROM users
      ORDER BY id DESC
    `);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "agent",
      team: user.team || null,

      // Account status
      status: user.status || "Active",

      // Current/live availability
      availability_status:
        user.availability_status ||
        user.status ||
        "Active",

      // Status timer
      status_started_at:
        user.status_started_at || null,

      avatar: user.avatar || null,

      // Login information
      last_login: user.last_login || null,
      login_time: user.login_time || null,
      logout_time: user.logout_time || null,

      // ==================================================
      // BREAK DATA FROM DATABASE
      // ==================================================
      break_start: user.break_start
        ? String(user.break_start)
        : null,

      break_end: user.break_end
        ? String(user.break_end)
        : null,

      // Frontend helper
      has_break:
        user.break_start !== null ||
        user.break_end !== null,

      created_at: user.created_at || null,
      updated_at: user.updated_at || null,
    }));

    console.log(
      "GET /api/new-users BREAK DATA:",
      formattedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        availability_status: user.availability_status,
        break_start: user.break_start,
        break_end: user.break_end,
        has_break: user.has_break,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        users: formattedUsers,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/new-users ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// POST - CREATE NEW USER
// ======================================================
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      role,
      team,
      password,
      status,
      availability_status,
      avatar,
    } = body;

    // ==================================================
    // VALIDATION
    // ==================================================
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // CHECK DUPLICATE EMAIL
    // ==================================================
    const [existingUsers] = await db.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // DEFAULT VALUES
    // ==================================================
    const finalStatus = status || "Active";

    const finalAvailability =
      availability_status || finalStatus;

    // ==================================================
    // CREATE USER
    // ==================================================
    const [result] = await db.query(
      `
      INSERT INTO users (
        name,
        email,
        phone,
        role,
        team,
        password,
        status,
        availability_status,
        status_started_at,
        avatar,
        break_start,
        break_end,
        created_at,
        updated_at
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        NULL,
        ?,
        NULL,
        NULL,
        NOW(),
        NOW()
      )
      `,
      [
        name,
        email,
        phone || null,
        role || "agent",
        team || null,
        password,
        finalStatus,
        finalAvailability,
        avatar || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/new-users ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// PATCH - UPDATE USER / BREAK / LIVE STATUS
// ======================================================
export async function PATCH(request) {
  try {
    const body = await request.json();

    const {
      userId,
      applyAll,

      // Break
      break_start,
      break_end,

      // Live status
      availability_status,
      status,
      status_started_at,
    } = body;

    // ==================================================
    // VALIDATE USER ID WHEN NEEDED
    // ==================================================
    const hasBreakUpdate =
      break_start !== undefined ||
      break_end !== undefined;

    const hasStatusUpdate =
      availability_status !== undefined ||
      status !== undefined ||
      status_started_at !== undefined;

    if (!hasBreakUpdate && !hasStatusUpdate) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid update data provided",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // BREAK UPDATE
    // ==================================================
    if (hasBreakUpdate) {
      // ------------------------------------------------
      // APPLY BREAK TO ALL USERS
      // ------------------------------------------------
      if (applyAll === true) {
        await db.query(
          `
          UPDATE users
          SET
            break_start = ?,
            break_end = ?,
            updated_at = NOW()
          `,
          [
            break_start || null,
            break_end || null,
          ]
        );

        return NextResponse.json({
          success: true,
          message: "Break updated for all users",
        });
      }

      // ------------------------------------------------
      // SINGLE USER
      // ------------------------------------------------
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "userId is required",
          },
          { status: 400 }
        );
      }

      const [result] = await db.query(
        `
        UPDATE users
        SET
          break_start = ?,
          break_end = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [
          break_start || null,
          break_end || null,
          userId,
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }

      // Get updated break data
      const [updatedUsers] = await db.query(
        `
        SELECT
          id,
          name,
          break_start,
          break_end,
          availability_status
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
      );

      return NextResponse.json({
        success: true,
        message: "Break updated successfully",
        user: updatedUsers[0] || null,
      });
    }

    // ==================================================
    // LIVE AVAILABILITY / STATUS UPDATE
    // ==================================================
    if (hasStatusUpdate) {
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "userId is required",
          },
          { status: 400 }
        );
      }

      const updates = [];
      const values = [];

      // ------------------------------------------------
      // Availability
      // ------------------------------------------------
      if (availability_status !== undefined) {
        updates.push("availability_status = ?");
        values.push(availability_status);
      }

      // ------------------------------------------------
      // Main status
      // ------------------------------------------------
      if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
      }

      // ------------------------------------------------
      // Status started time
      // ------------------------------------------------
      if (status_started_at !== undefined) {
        updates.push("status_started_at = ?");
        values.push(
          status_started_at || null
        );
      }

      if (updates.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Nothing to update",
          },
          { status: 400 }
        );
      }

      updates.push("updated_at = NOW()");
      values.push(userId);

      const [result] = await db.query(
        `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = ?
        `,
        values
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 }
        );
      }

      // Get updated user
      const [updatedUsers] = await db.query(
        `
        SELECT
          id,
          name,
          status,
          availability_status,
          status_started_at,
          break_start,
          break_end
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
      );

      return NextResponse.json({
        success: true,
        message: "User status updated successfully",
        user: updatedUsers[0] || null,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "No valid update data provided",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/new-users ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
