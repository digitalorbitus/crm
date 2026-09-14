

// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// // Ensure Node.js runtime for 'jsonwebtoken' library compatibility
// export const runtime = "nodejs";

// export async function GET(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "No token found" },
//         { status: 401 }
//       );
//     }

//     // Verify token using secret key
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const role = decoded.role ? decoded.role.toLowerCase() : "user";

//     return NextResponse.json(
//       {
//         success: true,
//         user: {
//           id: decoded.id || decoded._id || decoded.userId || null,
//           name: decoded.name || decoded.username || "User",
//           email: decoded.email || "",
//           role,
//         },
//         role,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Auth Me API Error:", error.message);

//     // Optional: Clear invalid or expired cookie
//     const response = NextResponse.json(
//       { success: false, message: "Invalid or expired token" },
//       { status: 401 }
//     );

//     response.cookies.delete("token");
//     return response;
//   }
// }















import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

// Ensure Node.js runtime for jsonwebtoken + MySQL
export const runtime = "nodejs";

export async function GET(request) {
  try {
    // ==========================================
    // GET AUTH TOKEN
    // ==========================================
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No token found",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // VERIFY JWT
    // ==========================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      null;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found in token",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // GET FRESH USER DATA FROM DATABASE
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

    // ==========================================
    // NORMALIZE ROLE
    // ==========================================
    const role = user.role
      ? String(user.role).toLowerCase()
      : "user";

    // ==========================================
    // NORMALIZE AVAILABILITY STATUS
    // ==========================================
    const availabilityStatus =
      user.availability_status || "Active";

    // ==========================================
    // RESPONSE
    // ==========================================
    return NextResponse.json(
      {
        success: true,

        user: {
          id: user.id,
          name: user.name || "User",
          email: user.email || "",
          role,
          availability_status: availabilityStatus,
        },

        role,

        availability_status: availabilityStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me API Error:", error);

    // ==========================================
    // INVALID / EXPIRED TOKEN
    // ==========================================
    const response = NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );

    response.cookies.delete("token");

    return response;
  }
}

