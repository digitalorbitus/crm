








// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import db from "../../lib/db";
// import {
//   formatCaliforniaDateTime,
//   getMostRecentCaliforniaLogout,
//   isSessionCurrentForCaliforniaDay,
// } from "../../../lib/california-logout";

// export async function POST(request) {
//   try {
//     // ==========================================
//     // GET TOKEN FROM COOKIE
//     // ==========================================

//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No token found",
//         },
//         { status: 401 }
//       );
//     }

//     // ==========================================
//     // VERIFY JWT
//     // ==========================================

//     let decoded;

//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET, {
//         ignoreExpiration: true,
//       });
//     } catch (error) {
//       console.error("JWT VERIFY ERROR:", error);

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or expired token",
//         },
//         { status: 401 }
//       );
//     }

//     // ==========================================
//     // CHECK USER ID
//     // ==========================================

//     if (!decoded?.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User ID not found in token",
//         },
//         { status: 401 }
//       );
//     }

//     const now = Date.now();
//     const currentDate = new Date(now);
//     const latestCutoff = getMostRecentCaliforniaLogout(currentDate);
//     const isCurrentSession = isSessionCurrentForCaliforniaDay(
//       decoded,
//       currentDate
//     );
//     const isAutomaticLogout =
//       !isCurrentSession &&
//       now >= latestCutoff &&
//       now < latestCutoff + 2 * 60 * 1000 &&
//       (!decoded.logoutAt || decoded.logoutAt * 1000 === latestCutoff);

//     if (
//       (!isCurrentSession && !isAutomaticLogout) ||
//       (decoded.exp * 1000 <= now && !isAutomaticLogout)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Session expired" },
//         { status: 401 }
//       );
//     }

//     // ==========================================
//     // CALIFORNIA CURRENT TIME
//     //
//     // America/Los_Angeles
//     // Automatically handles:
//     // PST / PDT
//     // Daylight Saving Time
//     // ==========================================

//     const logoutDate = new Date(isAutomaticLogout ? latestCutoff : now);
//     const californiaTime = formatCaliforniaDateTime(logoutDate);

//     // ==========================================
//     // CALIFORNIA TIME
//     // FORMAT:
//     //
//     // YYYY-MM-DD HH:mm:ss
//     // ==========================================

//     const logoutTime = californiaTime;

//     console.log(
//       "LOGOUT TIME - CALIFORNIA:",
//       logoutTime
//     );

//     // ==========================================
//     // UPDATE USER LOGOUT TIME
//     //
//     // DO NOT CHANGE STATUS
//     // ==========================================

//     await db.execute(
//       `UPDATE users
//        SET
//          logout_time = ?
//        WHERE id = ?`,
//       [
//         logoutTime,
//         decoded.id,
//       ]
//     );

//     // ==========================================
//     // UPDATE LATEST OPEN LOGIN HISTORY
//     // WITH CALIFORNIA TIME
//     // ==========================================

//     await db.execute(
//       `UPDATE login_history
//        SET logout_time = ?
//        WHERE id = (
//          SELECT id
//          FROM (
//            SELECT id
//            FROM login_history
//            WHERE user_id = ?
//              AND logout_time IS NULL
//            ORDER BY login_time DESC
//            LIMIT 1
//          ) AS latest_login
//        )`,
//       [
//         logoutTime,
//         decoded.id,
//       ]
//     );

//     // ==========================================
//     // DELETE TOKEN COOKIE
//     // ==========================================

//     const response = NextResponse.json({
//       success: true,
//       message: "Logout successful",
//     });

//     response.cookies.set("token", "", {
//       httpOnly: true,

//       secure:
//         process.env.NODE_ENV === "production",

//       sameSite: "lax",

//       expires: new Date(0),

//       path: "/",
//     });

//     // ==========================================
//     // RETURN RESPONSE
//     // ==========================================

//     return response;

//   } catch (error) {
//     console.error(
//       "LOGOUT ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Logout failed",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }





import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

import {
  formatCaliforniaDateTime,
  getMostRecentCaliforniaLogout,
  isSessionCurrentForCaliforniaDay,
} from "../../../lib/california-logout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // ============================================================
    // GET TOKEN
    // ============================================================

    const token = request.cookies.get("token")?.value;

    if (!token) {
      const response = NextResponse.json(
        {
          success: false,
          message: "No token found",
        },
        { status: 401 }
      );

      response.cookies.delete("token");

      return response;
    }

    // ============================================================
    // VERIFY JWT
    //
    // Ignore expiration temporarily so we can determine
    // whether this is the California daily automatic logout.
    // ============================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          ignoreExpiration: true,
        }
      );
    } catch (error) {
      console.error("JWT VERIFY ERROR:", error);

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

    // ============================================================
    // USER ID
    // ============================================================

    const userId =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      null;

    if (!userId) {
      const response = NextResponse.json(
        {
          success: false,
          message: "User ID not found in token",
        },
        { status: 401 }
      );

      response.cookies.delete("token");

      return response;
    }

    // ============================================================
    // CURRENT TIME
    // ============================================================

    const now = Date.now();
    const currentDate = new Date(now);

    // ============================================================
    // MOST RECENT CALIFORNIA 5:30 PM CUTOFF
    //
    // This uses california-logout.js.
    //
    // IMPORTANT:
    // california-logout.js must have:
    //
    // LOGOUT_HOUR = 17
    // LOGOUT_MINUTE = 30
    //
    // ============================================================

    const latestCutoff =
      getMostRecentCaliforniaLogout(currentDate);

    // ============================================================
    // CHECK CURRENT CALIFORNIA SESSION
    // ============================================================

    const isCurrentSession =
      isSessionCurrentForCaliforniaDay(
        decoded,
        currentDate
      );

    // ============================================================
    // AUTOMATIC 5:30 PM CALIFORNIA LOGOUT
    //
    // Old session + cutoff passed
    // = automatic logout
    // ============================================================

    const isAutomaticLogout =
      !isCurrentSession &&
      now >= latestCutoff &&
      (
        !decoded.logoutAt ||
        Number(decoded.logoutAt) * 1000 <= latestCutoff
      );

    // ============================================================
    // EXPIRED / INVALID SESSION
    // ============================================================

    if (
      !isCurrentSession &&
      !isAutomaticLogout
    ) {
      const response = NextResponse.json(
        {
          success: false,
          message: "Session expired",
        },
        { status: 401 }
      );

      response.cookies.delete("token");

      return response;
    }

    // ============================================================
    // JWT EXPIRATION
    // ============================================================

    if (
      decoded.exp &&
      Number(decoded.exp) * 1000 <= now &&
      !isAutomaticLogout
    ) {
      const response = NextResponse.json(
        {
          success: false,
          message: "Session expired",
        },
        { status: 401 }
      );

      response.cookies.delete("token");

      return response;
    }

    // ============================================================
    // LOGOUT TIME
    //
    // Automatic:
    //     Exact California 5:30 PM
    //
    // Manual:
    //     Current California time
    // ============================================================

    const logoutDate = isAutomaticLogout
      ? new Date(latestCutoff)
      : currentDate;

    const logoutTime =
      formatCaliforniaDateTime(logoutDate);

    console.log(
      isAutomaticLogout
        ? "AUTOMATIC CALIFORNIA 5:30 PM LOGOUT:"
        : "MANUAL LOGOUT:",
      logoutTime,
      "USER:",
      userId
    );

    // ============================================================
    // UPDATE USERS TABLE
    // ============================================================

    await db.execute(
      `
      UPDATE users
      SET logout_time = ?
      WHERE id = ?
      `,
      [
        logoutTime,
        userId,
      ]
    );

    // ============================================================
    // UPDATE LATEST OPEN LOGIN HISTORY
    // ============================================================

    await db.execute(
      `
      UPDATE login_history
      SET logout_time = ?
      WHERE id = (
        SELECT id
        FROM (
          SELECT id
          FROM login_history
          WHERE user_id = ?
            AND logout_time IS NULL
          ORDER BY login_time DESC
          LIMIT 1
        ) AS latest_login
      )
      `,
      [
        logoutTime,
        userId,
      ]
    );

    // ============================================================
    // DELETE TOKEN
    // ============================================================

    const response = NextResponse.json(
      {
        success: true,

        automatic:
          isAutomaticLogout,

        logout_time:
          logoutTime,

        message:
          isAutomaticLogout
            ? "Automatically logged out at 5:30 PM California time"
            : "Logout successful",
      },
      {
        status: 200,
      }
    );

    response.cookies.set(
      "token",
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === "production",

        sameSite: "lax",

        expires: new Date(0),

        maxAge: 0,

        path: "/",
      }
    );

    return response;

  } catch (error) {
    console.error(
      "LOGOUT ERROR:",
      error
    );

    const response = NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Logout failed",
      },
      {
        status: 500,
      }
    );

    // ============================================================
    // ALWAYS REMOVE BROWSER TOKEN
    // ============================================================

    response.cookies.set(
      "token",
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === "production",

        sameSite: "lax",

        expires: new Date(0),

        maxAge: 0,

        path: "/",
      }
    );

    return response;
  }
}