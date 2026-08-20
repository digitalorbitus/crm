// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../../lib/db";

// function getCurrentUser(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) return null;

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     return {
//       id:
//         decoded.id ||
//         decoded._id ||
//         decoded.userId,
//     };
//   } catch {
//     return null;
//   }
// }

// export async function POST(request) {
//   try {
//     const currentUser = getCurrentUser(request);

//     if (!currentUser?.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         { status: 401 }
//       );
//     }

//     const { conversationId } =
//       await request.json();

//     if (!conversationId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "conversationId is required",
//         },
//         { status: 400 }
//       );
//     }

//     await db.query(
//       `
//       UPDATE messages m
//       INNER JOIN conversation_members cm
//         ON cm.conversation_id = m.conversation_id
//       SET m.is_read = 1
//       WHERE m.conversation_id = ?
//         AND cm.user_id = ?
//         AND m.sender_id != ?
//         AND m.is_read = 0
//       `,
//       [
//         conversationId,
//         currentUser.id,
//         currentUser.id,
//       ]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Messages marked as read",
//     });
//   } catch (error) {
//     console.error(
//       "MARK READ ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Failed to mark messages as read",
//       },
//       { status: 500 }
//     );
//   }
// }