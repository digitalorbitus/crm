

// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import db from "../../lib/db";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";

// // 1. GET ALL USERS
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
//         status,
//         avatar,
//         last_login,
//         login_time,
//         logout_time,
//         created_at
//       FROM users
//       ORDER BY id DESC
//     `);

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




import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 1. GET ALL USERS
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
    avatar, 
    last_login, 
    login_time, 
    logout_time,
    break_start,
    break_end,
    created_at 
  FROM users
  ORDER BY id DESC
`);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}


// 2. CREATE NEW USER (With Image Support)
export async function POST(request) {
  try {
    // FIX: JSON ki jagah FormData read karein
    const formData = await request.formData();

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const role = formData.get("role");
    const team = formData.get("team");
    const status = formData.get("status");
    const password = formData.get("password");
    
    // File object extract karein
    const avatarFile = formData.get("avatar"); 

    // Required fields check
    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // Check existing email
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Clean role
    const cleanRole = String(role || "agent").toLowerCase();
    const allowedRoles = ["admin", "staff", "agent"];

    if (!allowedRoles.includes(cleanRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role. Allowed roles: admin, staff, agent",
        },
        { status: 400 }
      );
    }

    // Status validation
    const cleanStatus = status || "Active";
    if (!["Active", "Inactive"].includes(cleanStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status. Allowed status: Active, Inactive",
        },
        { status: 400 }
      );
    }

    // --- IMAGE UPLOADING LOGIC ---





         
    let avatarUrl = null;

    if (avatarFile && typeof avatarFile === "object" && avatarFile.name) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);


      // Unique filename create karein
      const uniqueFilename = `${Date.now()}-${avatarFile.name.replace(/\s+/g, "_")}`;
      
      // Save folder path (public/uploads)
      const uploadDir = path.join(process.cwd(), "public/uploads");

      // Check karein agar uploads folder nahi hai toh auto-create ho jaye
      await mkdir(uploadDir, { recursive: true });

      // File system me save karein
      const filePath = path.join(uploadDir, uniqueFilename);
      await writeFile(filePath, buffer);

      // Relative path for database storing
      avatarUrl = `/uploads/${uniqueFilename}`;
    }

    // --- CREATE USER IN DATABASE ---
    const [result] = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        phone,
        password_hash,
        role,
        team,
        status,
        avatar
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fullName,
        email,
        phone || null,
        passwordHash,
        cleanRole,
        team || "Sales",
        cleanStatus,
        avatarUrl,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: result.insertId,
        avatarUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create user",
      },
      { status: 500 }
    );
  }
}

// 3. UPDATE USER BREAK TIME
export async function PATCH(request) {
  try {
    const body = await request.json();

    const {
      userId,
      applyAll,
      break_start,
      break_end,
    } = body;

    const normalizedBreakStart = break_start || null;
    const normalizedBreakEnd = break_end || null;

    if (applyAll) {
      await db.query(
        `
        UPDATE users
        SET
          break_start = ?,
          break_end = ?
        `,
        [
          normalizedBreakStart,
          normalizedBreakEnd,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Break time updated for all users successfully",
      });
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    await db.query(
      `
      UPDATE users
      SET
        break_start = ?,
        break_end = ?
      WHERE id = ?
      `,
      [
        normalizedBreakStart,
        normalizedBreakEnd,
        userId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Break time updated successfully",
    });

  } catch (error) {
    console.error("UPDATE BREAK TIME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to update break time",
      },
      { status: 500 }
    );
  }
}