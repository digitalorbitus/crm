
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function GET(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json({ success: false, role: null }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     return NextResponse.json({
//       success: true,
//       role: decoded.role ? decoded.role.toLowerCase() : "user",
//     });
//   } catch (error) {
//     return NextResponse.json({ success: false, role: null }, { status: 401 });
//   }
// }


// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { connectToDB } from "../../../lib/db"; // Aapka MongoDB connection helper
// import User from "@/models/User"; // Aapka User Model

// export async function GET(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json({ success: false, message: "No token found" }, { status: 401 });
//     }

//     // 1. JWT Token Verify karein
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id || decoded._id || decoded.userId;

//     if (!userId) {
//       return NextResponse.json({ success: false, message: "Invalid token payload" }, { status: 401 });
//     }

//     // 2. Database connect karke real user fetch karein
//     await connectToDB();
//     const dbUser = await User.findById(userId).select("-password"); // Password hide karke fetch karein

//     if (!dbUser) {
//       return NextResponse.json({ success: false, message: "User not found in DB" }, { status: 404 });
//     }

//     // 3. Dynamic User Data Return Karein
//     return NextResponse.json({
//       success: true,
//       user: {
//         id: dbUser._id,
//         name: dbUser.name || dbUser.username,
//         email: dbUser.email,
//         role: dbUser.role ? dbUser.role.toLowerCase() : "user",
//         avatar: dbUser.avatar || dbUser.profilePic || null,
//       },
//       role: dbUser.role ? dbUser.role.toLowerCase() : "user",
//     });

//   } catch (error) {
//     console.error("Auth Me API Error:", error);
//     return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 });
//   }
// }



// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function GET(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: "No token found" },
//         { status: 401 }
//       );
//     }

//     // Direct Token Decode (No Mongoose needed)
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     return NextResponse.json({
//       success: true,
//       user: {
//         id: decoded.id || decoded._id || decoded.userId,
//         name: decoded.name || decoded.username || "User",
//         email: decoded.email || "",
//         role: decoded.role ? decoded.role.toLowerCase() : "user",
//       },
//       role: decoded.role ? decoded.role.toLowerCase() : "user",
//     });
//   } catch (error) {
//     console.error("Auth Me API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Invalid token" },
//       { status: 401 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Ensure Node.js runtime for 'jsonwebtoken' library compatibility
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token found" },
        { status: 401 }
      );
    }

    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const role = decoded.role ? decoded.role.toLowerCase() : "user";

    return NextResponse.json(
      {
        success: true,
        user: {
          id: decoded.id || decoded._id || decoded.userId || null,
          name: decoded.name || decoded.username || "User",
          email: decoded.email || "",
          role,
        },
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me API Error:", error.message);

    // Optional: Clear invalid or expired cookie
    const response = NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );

    response.cookies.delete("token");
    return response;
  }
}