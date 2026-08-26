



// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// /*
// ==================================================
// GET CURRENT USER FROM JWT
// ==================================================
// */
// function getCurrentUser(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return null;
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     const id =
//       decoded.id ||
//       decoded._id ||
//       decoded.userId;

//     const numericId = Number(id);

//     if (
//       !Number.isInteger(numericId) ||
//       numericId <= 0
//     ) {
//       return null;
//     }

//     return {
//       id: numericId,

//       name:
//         decoded.name ||
//         decoded.username ||
//         decoded.email ||
//         "",

//       email:
//         decoded.email || "",

//       role: String(
//         decoded.role || "user"
//       ).toLowerCase(),
//     };
//   } catch (error) {
//     console.error(
//       "JWT Error:",
//       error
//     );

//     return null;
//   }
// }

// /*
// ==================================================
// GET INITIALS
// ==================================================
// */
// function getInitials(
//   name,
//   email = ""
// ) {
//   const value =
//     String(name || "").trim() ||
//     String(email || "").trim();

//   if (!value) {
//     return "";
//   }

//   const words = value
//     .split(/\s+/)
//     .filter(Boolean);

//   if (words.length >= 2) {
//     return (
//       words[0][0] +
//       words[1][0]
//     ).toUpperCase();
//   }

//   return value
//     .replace(
//       /[^a-zA-Z0-9]/g,
//       ""
//     )
//     .slice(0, 2)
//     .toUpperCase();
// }

// /*
// ==================================================
// FORMAT LAST MESSAGE
// ==================================================
// */
// function formatLastMessage(
//   message
// ) {
//   if (!message) {
//     return "No messages yet";
//   }

//   if (
//     message.msg_type ===
//     "image"
//   ) {
//     return (
//       message.text ||
//       "📷 Image"
//     );
//   }

//   if (
//     message.msg_type ===
//     "file"
//   ) {
//     return (
//       message.text ||
//       `📎 ${
//         message.file_name ||
//         "File"
//       }`
//     );
//   }

//   return message.text || "";
// }

// /*
// ==================================================
// GET MEMBERS
// ==================================================
// */
// async function getConversationMembers(
//   conversationId
// ) {
//   const [rows] =
//     await db.query(
//       `
//       SELECT
//         cm.id AS member_id,
//         cm.user_id,
//         cm.role AS member_role,

//         u.name,
//         u.email,
//         u.phone,
//         u.role,
//         u.team,
//         u.status,
//         u.avatar

//       FROM conversation_members cm

//       INNER JOIN users u
//         ON u.id = cm.user_id

//       WHERE
//         cm.conversation_id = ?

//       ORDER BY cm.id ASC
//       `,
//       [conversationId]
//     );

//   return rows.map(
//     (member) => ({
//       member_id:
//         Number(
//           member.member_id
//         ),

//       id:
//         Number(
//           member.user_id
//         ),

//       user_id:
//         Number(
//           member.user_id
//         ),

//       name:
//         member.name ||
//         member.email ||
//         "",

//       email:
//         member.email ||
//         "",

//       phone:
//         member.phone ||
//         "",

//       role:
//         member.role ||
//         "user",

//       member_role:
//         member.member_role ||
//         "member",

//       team:
//         member.team ||
//         "",

//       status:
//         member.status ||
//         "",

//       avatar:
//         member.avatar ||
//         null,

//       initials:
//         getInitials(
//           member.name,
//           member.email
//         ),
//     })
//   );
// }

// /*
// ==================================================
// GET LAST MESSAGE
// ==================================================
// */
// async function getLastMessage(
//   conversationId
// ) {
//   const [rows] =
//     await db.query(
//       `
//       SELECT
//         m.id,
//         m.sender_id,
//         m.sender_type,
//         m.text,
//         m.msg_type,
//         m.file_name,
//         m.file_size,
//         m.file_url,
//         m.is_read,
//         m.created_at,

//         COALESCE(
//           NULLIF(
//             TRIM(u.name),
//             ''
//           ),
//           NULLIF(
//             TRIM(u.email),
//             ''
//           ),
//           ''
//         ) AS sender_name,

//         COALESCE(
//           u.email,
//           ''
//         ) AS sender_email

//       FROM messages m

//       LEFT JOIN users u
//         ON u.id = m.sender_id

//       WHERE
//         m.conversation_id = ?

//       ORDER BY
//         m.created_at DESC,
//         m.id DESC

//       LIMIT 1
//       `,
//       [conversationId]
//     );

//   return rows[0] || null;
// }

// /*
// ==================================================
// GET UNREAD COUNT
// ==================================================
// */
// async function getUnreadCount(
//   conversationId,
//   userId
// ) {
//   const [rows] =
//     await db.query(
//       `
//       SELECT
//         COUNT(*) AS unread_count

//       FROM messages

//       WHERE
//         conversation_id = ?

//         AND sender_id != ?

//         AND is_read = 0
//       `,
//       [
//         conversationId,
//         userId,
//       ]
//     );

//   return Number(
//     rows[0]?.unread_count ||
//       0
//   );
// }

// /*
// ==================================================
// GET ALL CONVERSATIONS
// ==================================================
// */
// export async function GET(
//   request
// ) {
//   try {
//     const currentUser =
//       getCurrentUser(request);

//     if (!currentUser?.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Unauthorized",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     const isAdmin =
//       currentUser.role ===
//         "admin" ||
//       currentUser.role ===
//         "administrator";

//     /*
//     ==================================================
//     GET USERS
//     ==================================================
//     */

//     const [userRows] =
//       await db.query(
//         `
//         SELECT
//           u.id,
//           u.name,
//           u.email,
//           u.phone,
//           u.role,
//           u.team,
//           u.status,
//           u.avatar,
//           u.last_login,
//           u.login_time,
//           u.logout_time,
//           u.created_at,
//           u.updated_at

//         FROM users u

//         WHERE u.id != ?

//         ORDER BY u.id ASC
//         `,
//         [currentUser.id]
//       );

//     const users =
//       userRows.map(
//         (user) => ({
//           ...user,

//           id:
//             Number(user.id),

//           name:
//             user.name ||
//             user.email ||
//             "",

//           email:
//             user.email ||
//             "",

//           initials:
//             getInitials(
//               user.name,
//               user.email
//             ),

//           avatar:
//             user.avatar ||
//             null,
//         })
//       );

//     /*
//     ==================================================
//     GET CONVERSATIONS
//     ==================================================
//     */

//     let conversationRows;

//     if (isAdmin) {
//       const [rows] =
//         await db.query(
//           `
//           SELECT
//             c.id,
//             c.type,
//             c.name,
//             c.created_by,
//             c.created_at,
//             c.updated_at

//           FROM conversations c

//           ORDER BY
//             COALESCE(
//               c.last_msg_time,
//               c.updated_at,
//               c.created_at
//             ) DESC,

//             c.id DESC
//           `
//         );

//       conversationRows =
//         rows;
//     } else {
//       const [rows] =
//         await db.query(
//           `
//           SELECT
//             c.id,
//             c.type,
//             c.name,
//             c.created_by,
//             c.created_at,
//             c.updated_at

//           FROM conversations c

//           INNER JOIN conversation_members cm
//             ON cm.conversation_id = c.id

//           WHERE
//             cm.user_id = ?

//           ORDER BY
//             COALESCE(
//               c.last_msg_time,
//               c.updated_at,
//               c.created_at
//             ) DESC,

//             c.id DESC
//           `,
//           [currentUser.id]
//         );

//       conversationRows =
//         rows;
//     }

//     /*
//     ==================================================
//     BUILD CONVERSATIONS
//     ==================================================
//     */

//     const conversations = [];

//     for (
//       const conversation of
//         conversationRows
//     ) {
//       const conversationId =
//         Number(
//           conversation.id
//         );

//       const members =
//         await getConversationMembers(
//           conversationId
//         );

//       /*
//       INVALID DIRECT CHAT
//       */

//       if (
//         conversation.type ===
//           "direct" &&
//         members.length !== 2
//       ) {
//         console.warn(
//           `Invalid direct conversation ${conversationId}. Members: ${members.length}`
//         );

//         continue;
//       }

//       const lastMessage =
//         await getLastMessage(
//           conversationId
//         );

//       const unreadCount =
//         await getUnreadCount(
//           conversationId,
//           currentUser.id
//         );

//       let chatName = "";
//       let chatEmail = "";
//       let chatAvatar = null;
//       let initials = "";

//       /*
//       GROUP
//       */

//       if (
//         conversation.type ===
//         "group"
//       ) {
//         chatName =
//           conversation.name ||
//           "Unnamed Group";

//         initials =
//           getInitials(
//             chatName
//           );
//       }

//       /*
//       DIRECT
//       */

//       else {
//         if (isAdmin) {
//           const participantNames =
//             members
//               .map(
//                 (member) =>
//                   member.name ||
//                   member.email
//               )
//               .filter(Boolean);

//           const participantEmails =
//             members
//               .map(
//                 (member) =>
//                   member.email
//               )
//               .filter(Boolean);

//           chatName =
//             participantNames.join(
//               " & "
//             ) ||
//             "Direct Chat";

//           chatEmail =
//             participantEmails.join(
//               ", "
//             );

//           chatAvatar =
//             members[0]?.avatar ||
//             null;

//           initials =
//             getInitials(
//               members[0]?.name,
//               members[0]?.email
//             );
//         } else {
//           const otherUser =
//             members.find(
//               (member) =>
//                 Number(
//                   member.user_id
//                 ) !==
//                 Number(
//                   currentUser.id
//                 )
//             );

//           chatName =
//             otherUser?.name ||
//             otherUser?.email ||
//             "";

//           chatEmail =
//             otherUser?.email ||
//             "";

//           chatAvatar =
//             otherUser?.avatar ||
//             null;

//           initials =
//             getInitials(
//               chatName,
//               chatEmail
//             );
//         }
//       }

//       const lastMsg =
//         formatLastMessage(
//           lastMessage
//         );

//       conversations.push({
//         id:
//           conversationId,

//         type:
//           conversation.type ||
//           "direct",

//         name:
//           chatName,

//         email:
//           chatEmail,

//         initials,

//         avatar:
//           chatAvatar,

//         avatar_bg:
//           conversation.type ===
//           "group"
//             ? "bg-rose-100 text-rose-600"
//             : "bg-emerald-100 text-emerald-600",

//         avatarBg:
//           conversation.type ===
//           "group"
//             ? "bg-rose-100 text-rose-600"
//             : "bg-emerald-100 text-emerald-600",

//         members,

//         member_count:
//           members.length,

//         can_view:
//           true,

//         can_send:
//           isAdmin
//             ? true
//             : members.some(
//                 (member) =>
//                   Number(
//                     member.user_id
//                   ) ===
//                   Number(
//                     currentUser.id
//                   )
//               ),

//         is_admin:
//           isAdmin,

//         created_by:
//           Number(
//             conversation.created_by
//           ),

//         created_at:
//           conversation.created_at,

//         updated_at:
//           conversation.updated_at,

//         messages: [],

//         lastMsg,

//         last_msg:
//           lastMsg,

//         last_msg_time:
//           lastMessage?.created_at ||
//           null,

//         unread_count:
//           unreadCount,

//         last_message:
//           lastMessage || null,

//         time:
//           lastMessage?.created_at
//             ? new Date(
//                 lastMessage.created_at
//               ).toLocaleTimeString(
//                 [],
//                 {
//                   hour:
//                     "2-digit",

//                   minute:
//                     "2-digit",
//                 }
//               )
//             : "",
//       });
//     }

//     return NextResponse.json({
//       success: true,

//       currentUser: {
//         id:
//           currentUser.id,

//         name:
//           currentUser.name,

//         email:
//           currentUser.email,

//         role:
//           currentUser.role,

//         isAdmin,
//       },

//       users,

//       conversations,

//       adminCanViewAllChats:
//         isAdmin,
//     });
//   } catch (error) {
//     console.error(
//       "GET /api/conversations ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,

//         message:
//           error.message ||
//           "Failed to load conversations",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// /*
// ==================================================
// CREATE GROUP
// ==================================================
// */
// export async function POST(
//   request
// ) {
//   let connection = null;

//   try {
//     /*
//     ==================================================
//     CURRENT USER
//     ==================================================
//     */

//     const currentUser =
//       getCurrentUser(request);

//     if (!currentUser?.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Unauthorized",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     /*
//     ==================================================
//     READ BODY
//     ==================================================
//     */

//     const body =
//       await request.json();

//     console.log(
//       "CREATE GROUP BODY:",
//       JSON.stringify(
//         body,
//         null,
//         2
//       )
//     );

//     const type =
//       body?.type;

//     const name =
//       body?.name;

//     /*
//     ==================================================
//     ACCEPT MULTIPLE MEMBER FIELD NAMES
//     ==================================================

//     Supports:

//     members
//     userIds
//     selectedUsers
//     selectedUserIds
//     */

//     let rawMembers =
//       body?.members;

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers =
//         body?.userIds;
//     }

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers =
//         body?.selectedUsers;
//     }

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers =
//         body?.selectedUserIds;
//     }

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers = [];
//     }

//     /*
//     ==================================================
//     VALIDATE TYPE
//     ==================================================
//     */

//     if (
//       String(type)
//         .toLowerCase() !==
//       "group"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "Only group conversations can be created here",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /*
//     ==================================================
//     VALIDATE NAME
//     ==================================================
//     */

//     if (
//       typeof name !==
//         "string" ||
//       !name.trim()
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "Group name is required",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /*
//     ==================================================
//     EXTRACT USER IDS
//     ==================================================
//     */

//     const memberIds = [];

//     for (
//       const member of
//         rawMembers
//     ) {
//       let id = null;

//       /*
//       NUMBER
//       */

//       if (
//         typeof member ===
//         "number"
//       ) {
//         id = member;
//       }

//       /*
//       STRING
//       */

//       else if (
//         typeof member ===
//         "string"
//       ) {
//         /*
//         If frontend sends:
//         "5"

//         or JSON-like:
//         "5"
//         */

//         id =
//           member.trim();
//       }

//       /*
//       OBJECT
//       */

//       else if (
//         member &&
//         typeof member ===
//           "object"
//       ) {
//         id =
//           member.user_id ??
//           member.userId ??
//           member.id ??
//           member.value ??
//           member.uid;
//       }

//       /*
//       CONVERT ID
//       */

//       const numericId =
//         Number(id);

//       if (
//         Number.isInteger(
//           numericId
//         ) &&
//         numericId > 0
//       ) {
//         memberIds.push(
//           numericId
//         );
//       }
//     }

//     /*
//     ==================================================
//     REMOVE DUPLICATES
//     ==================================================
//     */

//     const uniqueMemberIds = [
//       ...new Set(
//         memberIds
//       ),
//     ];

//     /*
//     ==================================================
//     ADD CREATOR
//     ==================================================
//     */

//     const creatorId =
//       Number(
//         currentUser.id
//       );

//     if (
//       !uniqueMemberIds.includes(
//         creatorId
//       )
//     ) {
//       uniqueMemberIds.unshift(
//         creatorId
//       );
//     }

//     /*
//     ==================================================
//     AT LEAST CREATOR
//     ==================================================
//     */

//     if (
//       uniqueMemberIds.length ===
//       0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "At least one member is required",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /*
//     ==================================================
//     VERIFY USERS
//     ==================================================
//     */

//     const placeholders =
//       uniqueMemberIds
//         .map(
//           () => "?"
//         )
//         .join(",");

//     const [
//       validUsers,
//     ] = await db.query(
//       `
//       SELECT
//         id,
//         name,
//         email

//       FROM users

//       WHERE id IN (${placeholders})
//       `,
//       uniqueMemberIds
//     );

//     const validUserIds =
//       validUsers.map(
//         (user) =>
//           Number(
//             user.id
//           )
//       );

//     /*
//     INVALID IDS
//     */

//     const invalidUsers =
//       uniqueMemberIds.filter(
//         (id) =>
//           !validUserIds.includes(
//             Number(id)
//           )
//       );

//     if (
//       invalidUsers.length > 0
//     ) {
//       console.error(
//         "INVALID GROUP USER IDS:",
//         invalidUsers
//       );

//       console.error(
//         "REQUESTED IDS:",
//         uniqueMemberIds
//       );

//       console.error(
//         "VALID IDS:",
//         validUserIds
//       );

//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "One or more selected users do not exist",

//           invalidUsers,

//           requestedUserIds:
//             uniqueMemberIds,

//           validUserIds,

//           /*
//           Helpful debugging
//           */

//           debug: {
//             currentUserId:
//               creatorId,

//             receivedMembers:
//               rawMembers,
//           },
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /*
//     ==================================================
//     DATABASE TRANSACTION
//     ==================================================
//     */

//     connection =
//       await db.getConnection();

//     await connection.beginTransaction();

//     /*
//     ==================================================
//     CREATE GROUP
//     ==================================================
//     */

//     const [
//       conversationResult,
//     ] =
//       await connection.query(
//         `
//         INSERT INTO conversations
//         (
//           type,
//           name,
//           created_by,
//           created_at,
//           updated_at
//         )

//         VALUES
//         (
//           'group',
//           ?,
//           ?,
//           NOW(),
//           NOW()
//         )
//         `,
//         [
//           name.trim(),
//           creatorId,
//         ]
//       );

//     const conversationId =
//       Number(
//         conversationResult.insertId
//       );

//     /*
//     ==================================================
//     ADD MEMBERS
//     ==================================================
//     */

//     for (
//       const userId of
//         uniqueMemberIds
//     ) {
//       const memberRole =
//         Number(userId) ===
//         creatorId
//           ? "admin"
//           : "member";

//       await connection.query(
//         `
//         INSERT INTO conversation_members
//         (
//           conversation_id,
//           user_id,
//           role
//         )

//         VALUES
//         (
//           ?,
//           ?,
//           ?
//         )
//         `,
//         [
//           conversationId,
//           userId,
//           memberRole,
//         ]
//       );
//     }

//     /*
//     ==================================================
//     COMMIT
//     ==================================================
//     */

//     await connection.commit();

//     /*
//     ==================================================
//     GET CREATED MEMBERS
//     ==================================================
//     */

//     const [createdMembers] =
//       await connection.query(
//         `
//         SELECT
//           cm.id AS member_id,
//           cm.user_id,
//           cm.role AS member_role,

//           u.name,
//           u.email,
//           u.phone,
//           u.role,
//           u.team,
//           u.status,
//           u.avatar

//         FROM conversation_members cm

//         INNER JOIN users u
//           ON u.id = cm.user_id

//         WHERE
//           cm.conversation_id = ?

//         ORDER BY cm.id ASC
//         `,
//         [conversationId]
//       );

//     const formattedMembers =
//       createdMembers.map(
//         (member) => ({
//           member_id:
//             Number(
//               member.member_id
//             ),

//           id:
//             Number(
//               member.user_id
//             ),

//           user_id:
//             Number(
//               member.user_id
//             ),

//           name:
//             member.name ||
//             member.email ||
//             "",

//           email:
//             member.email ||
//             "",

//           phone:
//             member.phone ||
//             "",

//           role:
//             member.role ||
//             "user",

//           member_role:
//             member.member_role ||
//             "member",

//           team:
//             member.team ||
//             "",

//           status:
//             member.status ||
//             "",

//           avatar:
//             member.avatar ||
//             null,

//           initials:
//             getInitials(
//               member.name,
//               member.email
//             ),
//         })
//       );

//     /*
//     ==================================================
//     SUCCESS
//     ==================================================
//     */

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Group created successfully",

//         conversationId,

//         conversation: {
//           id:
//             conversationId,

//           type:
//             "group",

//           name:
//             name.trim(),

//           created_by:
//             creatorId,

//           member_count:
//             formattedMembers.length,

//           members:
//             formattedMembers,

//           messages: [],

//           lastMsg:
//             "No messages yet",

//           last_msg:
//             "No messages yet",

//           unread_count:
//             0,
//         },
//       },
//       {
//         status: 201,
//       }
//     );
//   } catch (error) {
//     /*
//     ==================================================
//     ROLLBACK
//     ==================================================
//     */

//     if (connection) {
//       try {
//         await connection.rollback();
//       } catch (
//         rollbackError
//       ) {
//         console.error(
//           "Rollback Error:",
//           rollbackError
//         );
//       }
//     }

//     console.error(
//       "POST /api/conversations ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,

//         message:
//           error.message ||
//           "Group creation failed",

//         error:
//           process.env.NODE_ENV ===
//           "development"
//             ? error.message
//             : undefined,
//       },
//       {
//         status: 500,
//       }
//     );
//   } finally {
//     /*
//     ==================================================
//     RELEASE CONNECTION
//     ==================================================
//     */

//     if (connection) {
//       connection.release();
//     }
//   }
// }







// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";

// /* ==================================================
//    GET CURRENT USER FROM JWT
// ================================================== */

// function getCurrentUser(request) {
//   try {
//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return null;
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     const id =
//       decoded.id ??
//       decoded._id ??
//       decoded.userId;

//     const numericId = Number(id);

//     if (
//       !Number.isInteger(numericId) ||
//       numericId <= 0
//     ) {
//       return null;
//     }

//     return {
//       id: numericId,

//       name:
//         decoded.name ||
//         decoded.username ||
//         decoded.email ||
//         "",

//       email:
//         decoded.email || "",

//       role: String(
//         decoded.role || "user"
//       ).toLowerCase(),
//     };
//   } catch (error) {
//     console.error(
//       "JWT ERROR:",
//       error
//     );

//     return null;
//   }
// }

// /* ==================================================
//    GET INITIALS
// ================================================== */

// function getInitials(
//   name,
//   email = ""
// ) {
//   const value =
//     String(name || "").trim() ||
//     String(email || "").trim();

//   if (!value) {
//     return "";
//   }

//   const words = value
//     .split(/\s+/)
//     .filter(Boolean);

//   if (words.length >= 2) {
//     return (
//       words[0][0] +
//       words[1][0]
//     ).toUpperCase();
//   }

//   return value
//     .replace(
//       /[^a-zA-Z0-9]/g,
//       ""
//     )
//     .slice(0, 2)
//     .toUpperCase();
// }

// /* ==================================================
//    FORMAT LAST MESSAGE
// ================================================== */

// function formatLastMessage(
//   message
// ) {
//   if (!message) {
//     return "No messages yet";
//   }

//   if (
//     message.msg_type === "image"
//   ) {
//     return (
//       message.text ||
//       "📷 Image"
//     );
//   }

//   if (
//     message.msg_type === "file"
//   ) {
//     return (
//       message.text ||
//       `📎 ${
//         message.file_name || "File"
//       }`
//     );
//   }

//   return message.text || "";
// }

// /* ==================================================
//    GET CONVERSATION MEMBERS
// ================================================== */

// async function getConversationMembers(
//   conversationId
// ) {
//   const [rows] =
//     await db.query(
//       `
//       SELECT
//         cm.id AS member_id,
//         cm.user_id,
//         cm.role AS member_role,

//         u.name,
//         u.email,
//         u.phone,
//         u.role,
//         u.team,
//         u.status,
//         u.avatar

//       FROM conversation_members cm

//       INNER JOIN users u
//         ON u.id = cm.user_id

//       WHERE
//         cm.conversation_id = ?

//       ORDER BY
//         cm.id ASC
//       `,
//       [conversationId]
//     );

//   return rows.map(
//     (member) => ({
//       member_id:
//         Number(
//           member.member_id
//         ),

//       id:
//         Number(
//           member.user_id
//         ),

//       user_id:
//         Number(
//           member.user_id
//         ),

//       name:
//         member.name ||
//         member.email ||
//         "",

//       email:
//         member.email ||
//         "",

//       phone:
//         member.phone ||
//         "",

//       role:
//         member.role ||
//         "user",

//       member_role:
//         member.member_role ||
//         "member",

//       team:
//         member.team ||
//         "",

//       status:
//         member.status ||
//         "",

//       avatar:
//         member.avatar ||
//         null,

//       initials:
//         getInitials(
//           member.name,
//           member.email
//         ),
//     })
//   );
// }

// /* ==================================================
//    GET LAST MESSAGE
// ================================================== */

// async function getLastMessage(
//   conversationId
// ) {
//   const [rows] =
//     await db.query(
//       `
//       SELECT
//         m.id,
//         m.sender_id,
//         m.sender_type,
//         m.text,
//         m.msg_type,
//         m.file_name,
//         m.file_size,
//         m.file_url,
//         m.is_read,
//         m.created_at,

//         COALESCE(
//           NULLIF(
//             TRIM(u.name),
//             ''
//           ),
//           NULLIF(
//             TRIM(u.email),
//             ''
//           ),
//           ''
//         ) AS sender_name,

//         COALESCE(
//           u.email,
//           ''
//         ) AS sender_email

//       FROM messages m

//       LEFT JOIN users u
//         ON u.id = m.sender_id

//       WHERE
//         m.conversation_id = ?

//       ORDER BY
//         m.created_at DESC,
//         m.id DESC

//       LIMIT 1
//       `,
//       [conversationId]
//     );

//   return rows[0] || null;
// }

// /* ==================================================
//    GET UNREAD COUNT
// ================================================== */

// async function getUnreadCount(
//   conversationId,
//   userId
// ) {
//   const [rows] =
//     await db.query(
//       `
//       SELECT
//         COUNT(*) AS unread_count

//       FROM messages

//       WHERE
//         conversation_id = ?

//         AND sender_id != ?

//         AND is_read = 0
//       `,
//       [
//         conversationId,
//         userId,
//       ]
//     );

//   return Number(
//     rows[0]?.unread_count || 0
//   );
// }

// /* ==================================================
//    FORMAT USER
// ================================================== */

// function formatUser(user) {
//   return {
//     id: Number(user.id),

//     name:
//       user.name ||
//       user.email ||
//       "",

//     email:
//       user.email ||
//       "",

//     phone:
//       user.phone ||
//       "",

//     role:
//       user.role ||
//       "user",

//     team:
//       user.team ||
//       "",

//     status:
//       user.status ||
//       "",

//     avatar:
//       user.avatar ||
//       null,

//     last_login:
//       user.last_login ||
//       null,

//     login_time:
//       user.login_time ||
//       null,

//     logout_time:
//       user.logout_time ||
//       null,

//     created_at:
//       user.created_at ||
//       null,

//     updated_at:
//       user.updated_at ||
//       null,

//     initials:
//       getInitials(
//         user.name,
//         user.email
//       ),
//   };
// }

// /* ==================================================
//    GET ALL CONVERSATIONS
// ================================================== */

// export async function GET(
//   request
// ) {
//   try {
//     /* ================================================
//        CURRENT USER
//     ================================================ */

//     const currentUser =
//       getCurrentUser(request);

//     if (!currentUser?.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     /* ================================================
//        ADMIN CHECK
//     ================================================ */

//     const isAdmin =
//       currentUser.role === "admin" ||
//       currentUser.role ===
//         "administrator";

//     /* ================================================
//        GET ALL USERS
       
//        IMPORTANT:
//        New users created in users table
//        will automatically appear here
//        whenever this API is called again.
//     ================================================ */

//     const [userRows] =
//       await db.query(
//         `
//         SELECT
//           u.id,
//           u.name,
//           u.email,
//           u.phone,
//           u.role,
//           u.team,
//           u.status,
//           u.avatar,
//           u.last_login,
//           u.login_time,
//           u.logout_time,
//           u.created_at,
//           u.updated_at

//         FROM users u

//         WHERE
//           u.id != ?

//         ORDER BY
//           u.id ASC
//         `,
//         [currentUser.id]
//       );

//     const users =
//       userRows.map(
//         formatUser
//       );

//     console.log(
//       "USERS FROM DATABASE:",
//       users.length
//     );

//     /* ================================================
//        GET CONVERSATIONS
//     ================================================ */

//     let conversationRows;

//     if (isAdmin) {
//       /* ----------------------------------------------
//          ADMIN:
//          Can see every conversation
//       ---------------------------------------------- */

//       const [rows] =
//         await db.query(
//           `
//           SELECT
//             c.id,
//             c.type,
//             c.name,
//             c.created_by,
//             c.created_at,
//             c.updated_at

//           FROM conversations c

//           ORDER BY
//             COALESCE(
//               c.last_msg_time,
//               c.updated_at,
//               c.created_at
//             ) DESC,

//             c.id DESC
//           `
//         );

//       conversationRows = rows;
//     } else {
//       /* ----------------------------------------------
//          NORMAL USER:
//          Only conversations where user is member
//       ---------------------------------------------- */

//       const [rows] =
//         await db.query(
//           `
//           SELECT
//             c.id,
//             c.type,
//             c.name,
//             c.created_by,
//             c.created_at,
//             c.updated_at

//           FROM conversations c

//           INNER JOIN conversation_members cm
//             ON cm.conversation_id = c.id

//           WHERE
//             cm.user_id = ?

//           ORDER BY
//             COALESCE(
//               c.last_msg_time,
//               c.updated_at,
//               c.created_at
//             ) DESC,

//             c.id DESC
//           `,
//           [currentUser.id]
//         );

//       conversationRows = rows;
//     }

//     /* ================================================
//        BUILD CONVERSATIONS
//     ================================================ */

//     const conversations = [];

//     for (
//       const conversation
//       of conversationRows
//     ) {
//       const conversationId =
//         Number(
//           conversation.id
//         );

//       /* ----------------------------------------------
//          MEMBERS
//       ---------------------------------------------- */

//       const members =
//         await getConversationMembers(
//           conversationId
//         );

//       /* ----------------------------------------------
//          DIRECT CHAT VALIDATION
//       ---------------------------------------------- */

//       if (
//         conversation.type ===
//           "direct" &&
//         members.length !== 2
//       ) {
//         console.warn(
//           `Invalid direct conversation ${conversationId}. Members: ${members.length}`
//         );

//         continue;
//       }

//       /* ----------------------------------------------
//          LAST MESSAGE
//       ---------------------------------------------- */

//       const lastMessage =
//         await getLastMessage(
//           conversationId
//         );

//       /* ----------------------------------------------
//          UNREAD COUNT
//       ---------------------------------------------- */

//       const unreadCount =
//         await getUnreadCount(
//           conversationId,
//           currentUser.id
//         );

//       /* ----------------------------------------------
//          CHAT DISPLAY DATA
//       ---------------------------------------------- */

//       let chatName = "";
//       let chatEmail = "";
//       let chatAvatar = null;
//       let initials = "";

//       /* ==============================================
//          GROUP
//       ============================================== */

//       if (
//         conversation.type ===
//         "group"
//       ) {
//         chatName =
//           conversation.name ||
//           "Unnamed Group";

//         initials =
//           getInitials(
//             chatName
//           );
//       }

//       /* ==============================================
//          DIRECT
//       ============================================== */

//       else {
//         /* --------------------------------------------
//            ADMIN
//         -------------------------------------------- */

//         if (isAdmin) {
//           const participantNames =
//             members
//               .map(
//                 (member) =>
//                   member.name ||
//                   member.email
//               )
//               .filter(Boolean);

//           const participantEmails =
//             members
//               .map(
//                 (member) =>
//                   member.email
//               )
//               .filter(Boolean);

//           chatName =
//             participantNames.join(
//               " & "
//             ) ||
//             "Direct Chat";

//           chatEmail =
//             participantEmails.join(
//               ", "
//             );

//           chatAvatar =
//             members[0]?.avatar ||
//             null;

//           initials =
//             getInitials(
//               members[0]?.name,
//               members[0]?.email
//             );
//         }

//         /* --------------------------------------------
//            NORMAL USER
//         -------------------------------------------- */

//         else {
//           const otherUser =
//             members.find(
//               (member) =>
//                 Number(
//                   member.user_id
//                 ) !==
//                 Number(
//                   currentUser.id
//                 )
//             );

//           chatName =
//             otherUser?.name ||
//             otherUser?.email ||
//             "";

//           chatEmail =
//             otherUser?.email ||
//             "";

//           chatAvatar =
//             otherUser?.avatar ||
//             null;

//           initials =
//             getInitials(
//               chatName,
//               chatEmail
//             );
//         }
//       }

//       /* ----------------------------------------------
//          LAST MESSAGE TEXT
//       ---------------------------------------------- */

//       const lastMsg =
//         formatLastMessage(
//           lastMessage
//         );

//       /* ----------------------------------------------
//          PUSH CONVERSATION
//       ---------------------------------------------- */

//       conversations.push({
//         id:
//           conversationId,

//         type:
//           conversation.type ||
//           "direct",

//         name:
//           chatName,

//         email:
//           chatEmail,

//         initials,

//         avatar:
//           chatAvatar,

//         avatar_bg:
//           conversation.type ===
//           "group"
//             ? "bg-rose-100 text-rose-600"
//             : "bg-emerald-100 text-emerald-600",

//         avatarBg:
//           conversation.type ===
//           "group"
//             ? "bg-rose-100 text-rose-600"
//             : "bg-emerald-100 text-emerald-600",

//         members,

//         member_count:
//           members.length,

//         can_view:
//           true,

//         can_send:
//           isAdmin
//             ? true
//             : members.some(
//                 (member) =>
//                   Number(
//                     member.user_id
//                   ) ===
//                   Number(
//                     currentUser.id
//                   )
//               ),

//         is_admin:
//           isAdmin,

//         created_by:
//           Number(
//             conversation.created_by
//           ),

//         created_at:
//           conversation.created_at,

//         updated_at:
//           conversation.updated_at,

//         messages: [],

//         lastMsg,

//         last_msg:
//           lastMsg,

//         last_msg_time:
//           lastMessage?.created_at ||
//           null,

//         unread_count:
//           unreadCount,

//         last_message:
//           lastMessage || null,

//         time:
//           lastMessage?.created_at
//             ? new Date(
//                 lastMessage.created_at
//               ).toLocaleTimeString(
//                 [],
//                 {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 }
//               )
//             : "",
//       });
//     }

//     /* ================================================
//        RESPONSE
//     ================================================ */

//     return NextResponse.json({
//       success: true,

//       currentUser: {
//         id:
//           currentUser.id,

//         name:
//           currentUser.name,

//         email:
//           currentUser.email,

//         role:
//           currentUser.role,

//         isAdmin,
//       },

//       /*
//        IMPORTANT:
//        Latest users from users table
//       */

//       users,

//       /*
//        Conversations
//       */

//       conversations,

//       adminCanViewAllChats:
//         isAdmin,
//     });
//   } catch (error) {
//     console.error(
//       "GET /api/conversations ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,

//         message:
//           error.message ||
//           "Failed to load conversations",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

// /* ==================================================
//    CREATE GROUP
// ================================================== */

// export async function POST(
//   request
// ) {
//   let connection = null;

//   try {
//     /* ================================================
//        CURRENT USER
//     ================================================ */

//     const currentUser =
//       getCurrentUser(request);

//     if (!currentUser?.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     /* ================================================
//        READ BODY
//     ================================================ */

//     const body =
//       await request.json();

//     const type =
//       body?.type;

//     const name =
//       body?.name;

//     /* ================================================
//        GET MEMBERS
//     ================================================ */

//     let rawMembers =
//       body?.members;

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers =
//         body?.userIds;
//     }

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers =
//         body?.selectedUsers;
//     }

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers =
//         body?.selectedUserIds;
//     }

//     if (
//       !Array.isArray(
//         rawMembers
//       )
//     ) {
//       rawMembers = [];
//     }

//     /* ================================================
//        VALIDATE TYPE
//     ================================================ */

//     if (
//       String(type)
//         .toLowerCase() !==
//       "group"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "Only group conversations can be created here",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /* ================================================
//        VALIDATE NAME
//     ================================================ */

//     if (
//       typeof name !==
//         "string" ||
//       !name.trim()
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "Group name is required",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /* ================================================
//        EXTRACT USER IDS
//     ================================================ */

//     const memberIds = [];

//     for (
//       const member
//       of rawMembers
//     ) {
//       let id = null;

//       if (
//         typeof member ===
//         "number"
//       ) {
//         id = member;
//       } else if (
//         typeof member ===
//         "string"
//       ) {
//         id =
//           member.trim();
//       } else if (
//         member &&
//         typeof member ===
//           "object"
//       ) {
//         id =
//           member.user_id ??
//           member.userId ??
//           member.id ??
//           member.value ??
//           member.uid;
//       }

//       const numericId =
//         Number(id);

//       if (
//         Number.isInteger(
//           numericId
//         ) &&
//         numericId > 0
//       ) {
//         memberIds.push(
//           numericId
//         );
//       }
//     }

//     /* ================================================
//        REMOVE DUPLICATES
//     ================================================ */

//     const uniqueMemberIds = [
//       ...new Set(
//         memberIds
//       ),
//     ];

//     /* ================================================
//        ADD CREATOR
//     ================================================ */

//     const creatorId =
//       Number(
//         currentUser.id
//       );

//     if (
//       !uniqueMemberIds.includes(
//         creatorId
//       )
//     ) {
//       uniqueMemberIds.unshift(
//         creatorId
//       );
//     }

//     /* ================================================
//        VERIFY USERS
//     ================================================ */

//     const placeholders =
//       uniqueMemberIds
//         .map(
//           () => "?"
//         )
//         .join(",");

//     const [
//       validUsers,
//     ] = await db.query(
//       `
//       SELECT
//         id,
//         name,
//         email

//       FROM users

//       WHERE id IN (${placeholders})
//       `,
//       uniqueMemberIds
//     );

//     const validUserIds =
//       validUsers.map(
//         (user) =>
//           Number(
//             user.id
//           )
//       );

//     const invalidUsers =
//       uniqueMemberIds.filter(
//         (id) =>
//           !validUserIds.includes(
//             Number(id)
//           )
//       );

//     if (
//       invalidUsers.length > 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           message:
//             "One or more selected users do not exist",

//           invalidUsers,

//           requestedUserIds:
//             uniqueMemberIds,

//           validUserIds,
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     /* ================================================
//        DATABASE TRANSACTION
//     ================================================ */

//     connection =
//       await db.getConnection();

//     await connection.beginTransaction();

//     /* ================================================
//        CREATE CONVERSATION
//     ================================================ */

//     const [
//       conversationResult,
//     ] =
//       await connection.query(
//         `
//         INSERT INTO conversations
//         (
//           type,
//           name,
//           created_by,
//           created_at,
//           updated_at
//         )

//         VALUES
//         (
//           'group',
//           ?,
//           ?,
//           NOW(),
//           NOW()
//         )
//         `,
//         [
//           name.trim(),
//           creatorId,
//         ]
//       );

//     const conversationId =
//       Number(
//         conversationResult.insertId
//       );

//     /* ================================================
//        ADD MEMBERS
//     ================================================ */

//     for (
//       const userId
//       of uniqueMemberIds
//     ) {
//       const memberRole =
//         Number(userId) ===
//         creatorId
//           ? "admin"
//           : "member";

//       await connection.query(
//         `
//         INSERT INTO conversation_members
//         (
//           conversation_id,
//           user_id,
//           role
//         )

//         VALUES
//         (
//           ?,
//           ?,
//           ?
//         )
//         `,
//         [
//           conversationId,
//           userId,
//           memberRole,
//         ]
//       );
//     }

//     /* ================================================
//        COMMIT
//     ================================================ */

//     await connection.commit();

//     /* ================================================
//        GET CREATED MEMBERS
//     ================================================ */

//     const [
//       createdMembers,
//     ] =
//       await connection.query(
//         `
//         SELECT
//           cm.id AS member_id,
//           cm.user_id,
//           cm.role AS member_role,

//           u.name,
//           u.email,
//           u.phone,
//           u.role,
//           u.team,
//           u.status,
//           u.avatar

//         FROM conversation_members cm

//         INNER JOIN users u
//           ON u.id = cm.user_id

//         WHERE
//           cm.conversation_id = ?

//         ORDER BY
//           cm.id ASC
//         `,
//         [conversationId]
//       );

//     const formattedMembers =
//       createdMembers.map(
//         (member) => ({
//           member_id:
//             Number(
//               member.member_id
//             ),

//           id:
//             Number(
//               member.user_id
//             ),

//           user_id:
//             Number(
//               member.user_id
//             ),

//           name:
//             member.name ||
//             member.email ||
//             "",

//           email:
//             member.email ||
//             "",

//           phone:
//             member.phone ||
//             "",

//           role:
//             member.role ||
//             "user",

//           member_role:
//             member.member_role ||
//             "member",

//           team:
//             member.team ||
//             "",

//           status:
//             member.status ||
//             "",

//           avatar:
//             member.avatar ||
//             null,

//           initials:
//             getInitials(
//               member.name,
//               member.email
//             ),
//         })
//       );

//     /* ================================================
//        SUCCESS
//     ================================================ */

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Group created successfully",

//         conversationId,

//         conversation: {
//           id:
//             conversationId,

//           type:
//             "group",

//           name:
//             name.trim(),

//           created_by:
//             creatorId,

//           member_count:
//             formattedMembers.length,

//           members:
//             formattedMembers,

//           messages: [],

//           lastMsg:
//             "No messages yet",

//           last_msg:
//             "No messages yet",

//           unread_count:
//             0,
//         },
//       },
//       {
//         status: 201,
//       }
//     );
//   } catch (error) {
//     /* ================================================
//        ROLLBACK
//     ================================================ */

//     if (connection) {
//       try {
//         await connection.rollback();
//       } catch (
//         rollbackError
//       ) {
//         console.error(
//           "ROLLBACK ERROR:",
//           rollbackError
//         );
//       }
//     }

//     console.error(
//       "POST /api/conversations ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,

//         message:
//           error.message ||
//           "Group creation failed",

//         error:
//           process.env.NODE_ENV ===
//           "development"
//             ? error.message
//             : undefined,
//       },
//       {
//         status: 500,
//       }
//     );
//   } finally {
//     /* ================================================
//        RELEASE CONNECTION
//     ================================================ */

//     if (connection) {
//       connection.release();
//     }
//   }
// }
















import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const id =
      decoded.id ??
      decoded.userId ??
      decoded._id;

    const numericId = Number(id);

    if (
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      return null;
    }

    return {
      id: numericId,

      name:
        decoded.name ||
        decoded.username ||
        decoded.email ||
        "",

      email:
        decoded.email || "",

      role: String(
        decoded.role || "user"
      ).toLowerCase(),
    };
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;
  }
}

/* =========================================================
   ADMIN
========================================================= */

function isAdmin(user) {
  const role = String(
    user?.role || ""
  ).toLowerCase();

  return (
    role === "admin" ||
    role === "administrator"
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  name,
  email = ""
) {
  const value =
    String(name || "").trim() ||
    String(email || "").trim();

  if (!value) {
    return "";
  }

  const words = value
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();
  }

  return value
    .replace(
      /[^a-zA-Z0-9]/g,
      ""
    )
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   FORMAT USER
========================================================= */

function formatUser(user) {
  return {
    id: Number(user.id),

    name:
      user.name ||
      user.email ||
      "",

    email:
      user.email || "",

    phone:
      user.phone || "",

    role:
      user.role || "user",

    team:
      user.team || "",

    status:
      user.status || "",

    avatar:
      user.avatar || null,

    last_login:
      user.last_login || null,

    login_time:
      user.login_time || null,

    logout_time:
      user.logout_time || null,

    created_at:
      user.created_at || null,

    updated_at:
      user.updated_at || null,

    initials:
      getInitials(
        user.name,
        user.email
      ),
  };
}

/* =========================================================
   GET MEMBERS
========================================================= */

async function getConversationMembers(
  conversationId
) {
  const [rows] =
    await db.query(
      `
      SELECT
        cm.id AS member_id,
        cm.user_id,
        cm.role AS member_role,

        u.name,
        u.email,
        u.phone,
        u.role,
        u.team,
        u.status,
        u.avatar

      FROM conversation_members cm

      INNER JOIN users u
        ON u.id = cm.user_id

      WHERE
        cm.conversation_id = ?

      ORDER BY
        cm.id ASC
      `,
      [conversationId]
    );

  return rows.map(
    (member) => ({
      member_id:
        Number(
          member.member_id
        ),

      id:
        Number(
          member.user_id
        ),

      user_id:
        Number(
          member.user_id
        ),

      name:
        member.name ||
        member.email ||
        "",

      email:
        member.email || "",

      phone:
        member.phone || "",

      role:
        member.role || "user",

      member_role:
        member.member_role ||
        "member",

      team:
        member.team || "",

      status:
        member.status || "",

      avatar:
        member.avatar || null,

      initials:
        getInitials(
          member.name,
          member.email
        ),
    })
  );
}

/* =========================================================
   GET LAST MESSAGE
========================================================= */

async function getLastMessage(
  conversationId
) {
  const [rows] =
    await db.query(
      `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.sender_type,
        m.text,
        m.msg_type,
        m.file_name,
        m.file_size,
        m.file_url,
        m.is_read,
        m.created_at,

        COALESCE(
          NULLIF(
            TRIM(u.name),
            ''
          ),
          NULLIF(
            TRIM(u.email),
            ''
          ),
          ''
        ) AS sender_name,

        COALESCE(
          u.email,
          ''
        ) AS sender_email

      FROM messages m

      LEFT JOIN users u
        ON u.id = m.sender_id

      WHERE
        m.conversation_id = ?

      ORDER BY
        m.created_at DESC,
        m.id DESC

      LIMIT 1
      `,
      [conversationId]
    );

  return rows[0] || null;
}

/* =========================================================
   FORMAT LAST MESSAGE
========================================================= */

function formatLastMessage(
  message
) {
  if (!message) {
    return "No messages yet";
  }

  if (
    message.msg_type ===
    "image"
  ) {
    return (
      message.text ||
      "📷 Image"
    );
  }

  if (
    message.msg_type ===
    "file"
  ) {
    return (
      message.text ||
      `📎 ${
        message.file_name ||
        "File"
      }`
    );
  }

  return message.text || "";
}

/* =========================================================
   UNREAD COUNT
========================================================= */

async function getUnreadCount(
  conversationId,
  userId
) {
  const [rows] =
    await db.query(
      `
      SELECT
        COUNT(*) AS unread_count

      FROM messages

      WHERE
        conversation_id = ?

        AND sender_id != ?

        AND is_read = 0
      `,
      [
        conversationId,
        userId,
      ]
    );

  return Number(
    rows[0]?.unread_count || 0
  );
}

/* =========================================================
   GET
   /api/conversations
========================================================= */

export async function GET(request) {
  try {
    /* -----------------------------------------------------
       CURRENT USER
    ----------------------------------------------------- */

    const currentUser =
      getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const admin =
      isAdmin(currentUser);

    /* -----------------------------------------------------
       USERS
    ----------------------------------------------------- */

    const [userRows] =
      await db.query(
        `
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
          created_at,
          updated_at

        FROM users

        WHERE id != ?

        ORDER BY id ASC
        `,
        [currentUser.id]
      );

    const users =
      userRows.map(
        formatUser
      );

    /* -----------------------------------------------------
       CONVERSATIONS
    ----------------------------------------------------- */

    let conversationRows = [];

    if (admin) {
      const [rows] =
        await db.query(
          `
          SELECT
            c.id,
            c.type,
            c.name,
            c.created_by,
            c.created_at,
            c.updated_at,
            c.last_msg,
            c.last_msg_time

          FROM conversations c

          ORDER BY
            COALESCE(
              c.last_msg_time,
              c.updated_at,
              c.created_at
            ) DESC,

            c.id DESC
          `
        );

      conversationRows =
        rows;
    } else {
      const [rows] =
        await db.query(
          `
          SELECT DISTINCT
            c.id,
            c.type,
            c.name,
            c.created_by,
            c.created_at,
            c.updated_at,
            c.last_msg,
            c.last_msg_time

          FROM conversations c

          INNER JOIN conversation_members cm
            ON cm.conversation_id =
               c.id

          WHERE
            cm.user_id = ?

          ORDER BY
            COALESCE(
              c.last_msg_time,
              c.updated_at,
              c.created_at
            ) DESC,

            c.id DESC
          `,
          [currentUser.id]
        );

      conversationRows =
        rows;
    }

    /* -----------------------------------------------------
       BUILD RESULT
    ----------------------------------------------------- */

    const conversations = [];

    for (
      const conversation
      of conversationRows
    ) {
      const conversationId =
        Number(
          conversation.id
        );

      if (
        !Number.isInteger(
          conversationId
        ) ||
        conversationId <= 0
      ) {
        continue;
      }

      /* ---------------------------------------------------
         MEMBERS
      --------------------------------------------------- */

      const members =
        await getConversationMembers(
          conversationId
        );

      /* ---------------------------------------------------
         DIRECT CHAT MUST HAVE 2 MEMBERS
      --------------------------------------------------- */

      if (
        conversation.type ===
          "direct" &&
        members.length !== 2
      ) {
        console.warn(
          `Skipping invalid direct conversation ${conversationId}. Members=${members.length}`
        );

        continue;
      }

      /* ---------------------------------------------------
         LAST MESSAGE
      --------------------------------------------------- */

      const lastMessage =
        await getLastMessage(
          conversationId
        );

      /* ---------------------------------------------------
         UNREAD
      --------------------------------------------------- */

      const unreadCount =
        await getUnreadCount(
          conversationId,
          currentUser.id
        );

      /* ---------------------------------------------------
         DISPLAY
      --------------------------------------------------- */

      let chatName = "";
      let chatEmail = "";
      let chatAvatar = null;
      let initials = "";

      /* ===================================================
         GROUP
      =================================================== */

      if (
        conversation.type ===
        "group"
      ) {
        chatName =
          conversation.name ||
          "Unnamed Group";

        initials =
          getInitials(
            chatName
          );
      }

      /* ===================================================
         DIRECT
      =================================================== */

      else {
        /*
         NORMAL USER
         */

        if (!admin) {
          const otherUser =
            members.find(
              (member) =>
                Number(
                  member.user_id
                ) !==
                Number(
                  currentUser.id
                )
            );

          chatName =
            otherUser?.name ||
            otherUser?.email ||
            "Unknown User";

          chatEmail =
            otherUser?.email ||
            "";

          chatAvatar =
            otherUser?.avatar ||
            null;

          initials =
            getInitials(
              chatName,
              chatEmail
            );
        }

        /*
         ADMIN
         */

        else {
          const names =
            members
              .map(
                (member) =>
                  member.name ||
                  member.email
              )
              .filter(Boolean);

          const emails =
            members
              .map(
                (member) =>
                  member.email
              )
              .filter(Boolean);

          chatName =
            names.join(" & ") ||
            "Direct Chat";

          chatEmail =
            emails.join(", ");

          chatAvatar =
            members[0]?.avatar ||
            null;

          initials =
            getInitials(
              members[0]?.name,
              members[0]?.email
            );
        }
      }

      /* ---------------------------------------------------
         LAST MESSAGE TEXT
      --------------------------------------------------- */

      const lastMsg =
        formatLastMessage(
          lastMessage
        );

      /* ---------------------------------------------------
         TIME
      --------------------------------------------------- */

      const time =
        lastMessage?.created_at
          ? new Date(
              lastMessage.created_at
            ).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "";

      /* ---------------------------------------------------
         PUSH
      --------------------------------------------------- */

      conversations.push({
        /*
         IMPORTANT:
         ALWAYS NUMERIC DATABASE ID
        */

        id: conversationId,

        type:
          conversation.type ||
          "direct",

        name: chatName,

        email: chatEmail,

        initials,

        avatar: chatAvatar,

        avatar_bg:
          conversation.type ===
          "group"
            ? "bg-rose-100 text-rose-600"
            : "bg-emerald-100 text-emerald-600",

        avatarBg:
          conversation.type ===
          "group"
            ? "bg-rose-100 text-rose-600"
            : "bg-emerald-100 text-emerald-600",

        members,

        member_count:
          members.length,

        can_view: true,

        can_send:
          members.some(
            (member) =>
              Number(
                member.user_id
              ) ===
              Number(
                currentUser.id
              )
          ),

        is_admin: admin,

        created_by:
          Number(
            conversation.created_by
          ),

        created_at:
          conversation.created_at,

        updated_at:
          conversation.updated_at,

        messages: [],

        lastMsg,

        last_msg: lastMsg,

        last_msg_time:
          lastMessage?.created_at ||
          null,

        unread_count:
          unreadCount,

        last_message:
          lastMessage || null,

        time,
      });
    }

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return NextResponse.json({
      success: true,

      currentUser: {
        id: currentUser.id,

        name:
          currentUser.name,

        email:
          currentUser.email,

        role:
          currentUser.role,

        isAdmin: admin,
      },

      users,

      conversations,

      adminCanViewAllChats:
        admin,
    });
  } catch (error) {
    console.error(
      "GET /api/conversations ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Failed to load conversations",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   CREATE GROUP
========================================================= */

export async function POST(request) {
  let connection = null;

  try {
    /* -----------------------------------------------------
       CURRENT USER
    ----------------------------------------------------- */

    const currentUser =
      getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------------------
       BODY
    ----------------------------------------------------- */

    const body =
      await request.json();

    const type =
      String(
        body?.type || ""
      ).toLowerCase();

    const name =
      String(
        body?.name || ""
      ).trim();

    let rawMembers =
      body?.members;

    if (
      !Array.isArray(
        rawMembers
      )
    ) {
      rawMembers =
        body?.userIds;
    }

    if (
      !Array.isArray(
        rawMembers
      )
    ) {
      rawMembers =
        body?.selectedUsers;
    }

    if (
      !Array.isArray(
        rawMembers
      )
    ) {
      rawMembers = [];
    }

    /* -----------------------------------------------------
       VALIDATE
    ----------------------------------------------------- */

    if (type !== "group") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only group conversations can be created",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Group name is required",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       EXTRACT IDS
    ----------------------------------------------------- */

    const memberIds = [];

    for (
      const member
      of rawMembers
    ) {
      let id = null;

      if (
        typeof member ===
        "number"
      ) {
        id = member;
      } else if (
        typeof member ===
        "string"
      ) {
        id = member.trim();
      } else if (
        member &&
        typeof member ===
          "object"
      ) {
        id =
          member.user_id ??
          member.userId ??
          member.id ??
          member.value ??
          member.uid;
      }

      const numericId =
        Number(id);

      if (
        Number.isInteger(
          numericId
        ) &&
        numericId > 0
      ) {
        memberIds.push(
          numericId
        );
      }
    }

    /* -----------------------------------------------------
       UNIQUE
    ----------------------------------------------------- */

    const uniqueMemberIds =
      [
        ...new Set(
          memberIds
        ),
      ];

    /* -----------------------------------------------------
       ADD CREATOR
    ----------------------------------------------------- */

    if (
      !uniqueMemberIds.includes(
        currentUser.id
      )
    ) {
      uniqueMemberIds.unshift(
        currentUser.id
      );
    }

    /* -----------------------------------------------------
       AT LEAST 2 MEMBERS
    ----------------------------------------------------- */

    if (
      uniqueMemberIds.length <
      2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A group must have at least 2 members",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       VERIFY USERS
    ----------------------------------------------------- */

    const placeholders =
      uniqueMemberIds
        .map(() => "?")
        .join(",");

    const [validUsers] =
      await db.query(
        `
        SELECT
          id

        FROM users

        WHERE id IN (${placeholders})
        `,
        uniqueMemberIds
      );

    const validUserIds =
      validUsers.map(
        (user) =>
          Number(user.id)
      );

    const invalidUsers =
      uniqueMemberIds.filter(
        (id) =>
          !validUserIds.includes(
            Number(id)
          )
      );

    if (
      invalidUsers.length
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "One or more users do not exist",

          invalidUsers,
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       TRANSACTION
    ----------------------------------------------------- */

    connection =
      await db.getConnection();

    await connection.beginTransaction();

    /* -----------------------------------------------------
       CREATE GROUP
    ----------------------------------------------------- */

    const [
      conversationResult,
    ] =
      await connection.query(
        `
        INSERT INTO conversations
        (
          type,
          name,
          created_by,
          created_at,
          updated_at
        )

        VALUES
        (
          'group',
          ?,
          ?,
          NOW(),
          NOW()
        )
        `,
        [
          name,
          currentUser.id,
        ]
      );

    const conversationId =
      Number(
        conversationResult.insertId
      );

    /* -----------------------------------------------------
       MEMBERS
    ----------------------------------------------------- */

    for (
      const userId
      of uniqueMemberIds
    ) {
      const role =
        Number(userId) ===
        Number(
          currentUser.id
        )
          ? "admin"
          : "member";

      await connection.query(
        `
        INSERT INTO conversation_members
        (
          conversation_id,
          user_id,
          role
        )

        VALUES
        (
          ?,
          ?,
          ?
        )
        `,
        [
          conversationId,
          userId,
          role,
        ]
      );
    }

    await connection.commit();

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        message:
          "Group created successfully",

        conversationId,

        conversation: {
          id:
            conversationId,

          type:
            "group",

          name,

          created_by:
            currentUser.id,

          member_count:
            uniqueMemberIds.length,

          members:
            uniqueMemberIds,

          messages: [],

          lastMsg:
            "No messages yet",

          last_msg:
            "No messages yet",

          unread_count: 0,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error(
      "POST /api/conversations ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Failed to create group",
      },
      {
        status: 500,
      }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}