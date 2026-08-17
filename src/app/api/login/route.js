
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// export async function POST(request) {
//   try {
//     const { email, password } = await request.json();

//     // Check required fields
//     if (!email || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email and password required",
//         },
//         { status: 400 }
//       );
//     }

//     // Find user
//     const [users] = await db.execute(
//       `SELECT 
//         id,
//         name,
//         email,
//         password_hash,
//         role,
//         status
//        FROM users
//        WHERE email = ?
//        LIMIT 1`,
//       [email]
//     );

//     if (users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid email or password",
//         },
//         { status: 401 }
//       );
//     }

//     const user = users[0];

//     // Check password
//     const passwordMatch = await bcrypt.compare(
//       password,
//       user.password_hash
//     );

//     if (!passwordMatch) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid email or password",
//         },
//         { status: 401 }
//       );
//     }

//     // ==========================================
//     // UPDATE LOGIN INFORMATION
//     // ==========================================

//     await db.execute(
//       `UPDATE users
//        SET 
//          login_time = NOW(),
//          last_login = NOW(),
//          logout_time = NULL,
//          status = 'Active'
//        WHERE id = ?`,
//       [user.id]
//     );

//     // ==========================================
//     // CREATE JWT TOKEN
//     // ==========================================

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         name: user.name,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//       }
//     );

//     // ==========================================
//     // CREATE RESPONSE
//     // ==========================================

//     const response = NextResponse.json({
//       success: true,
//       message: "Login successful",

//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });

//     // ==========================================
//     // SAVE JWT IN COOKIE
//     // ==========================================

//     response.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24,
//       path: "/",
//     });

//     return response;
//   } catch (error) {
//     console.error("LOGIN ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Server error",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // ==========================================
    // CHECK REQUIRED FIELDS
    // ==========================================

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password required",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role,
        status
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const user = users[0];

    // ==========================================
    // CHECK ACCOUNT STATUS
    // Active = can login
    // Inactive = blocked by admin
    // ==========================================

    if (user.status === "Inactive") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // CHECK PASSWORD
    // ==========================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GET IP ADDRESS
    // ==========================================

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : request.headers.get("x-real-ip") || null;

    const userAgent =
      request.headers.get("user-agent") || null;

    // ==========================================
    // UPDATE USER LOGIN INFORMATION
    // DO NOT CHANGE STATUS
    // ==========================================

    await db.execute(
      `UPDATE users
       SET
         login_time = NOW(),
         last_login = NOW(),
         logout_time = NULL
       WHERE id = ?`,
      [user.id]
    );

    // ==========================================
    // CREATE LOGIN HISTORY
    // EVERY LOGIN = NEW ROW
    // ==========================================

    await db.execute(
      `INSERT INTO login_history
       (
         user_id,
         login_time,
         logout_time,
         ip_address,
         user_agent
       )
       VALUES (?, NOW(), NULL, ?, ?)`,
      [
        user.id,
        ipAddress,
        userAgent,
      ]
    );

    // ==========================================
    // CREATE JWT
    // ==========================================

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    const response = NextResponse.json({
      success: true,
      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // ==========================================
    // SAVE TOKEN COOKIE
    // ==========================================

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    );
  }
}