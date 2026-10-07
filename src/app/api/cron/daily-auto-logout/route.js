import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import {
  getMostRecentCaliforniaLogout,
  formatCaliforniaDateTime,
} from "../../../../lib/california-logout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CALIFORNIA_TIME_ZONE = "America/Los_Angeles";

// ============================================================
// GET CURRENT CALIFORNIA TIME
// ============================================================

function getCaliforniaNow() {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date())
    .reduce((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = Number(part.value);
      }

      return acc;
    }, {});
}

// ============================================================
// CRON API
//
// DAILY AUTO LOGOUT:
// EVERY DAY AT 5:30 PM CALIFORNIA
// ============================================================

export async function GET(request) {
  let connection;

  try {
    // ========================================================
    // CRON SECURITY
    // ========================================================

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "CRON_SECRET is not configured",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    const suppliedSecret =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : request.headers.get("x-cron-secret");

    if (suppliedSecret !== cronSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // CURRENT CALIFORNIA TIME
    // ========================================================

    const californiaNow = getCaliforniaNow();

    const currentHour = californiaNow.hour;
    const currentMinute = californiaNow.minute;

    const californiaTime =
      `${String(currentHour).padStart(2, "0")}:` +
      `${String(currentMinute).padStart(2, "0")}:` +
      `${String(californiaNow.second).padStart(2, "0")}`;

    // ========================================================
    // ONLY RUN AFTER 5:30 PM CALIFORNIA
    //
    // 17:30 = 5:30 PM
    // ========================================================

    if (
      currentHour < 17 ||
      (currentHour === 17 && currentMinute < 30)
    ) {
      return NextResponse.json({
        success: true,
        processed: false,
        californiaTime,
        message:
          "California 5:30 PM cutoff has not arrived yet",
      });
    }

    // ========================================================
    // GET MOST RECENT 5:30 PM CALIFORNIA CUTOFF
    // ========================================================

    const cutoffTimestamp =
      getMostRecentCaliforniaLogout(new Date());

    const cutoffDate =
      new Date(cutoffTimestamp);

    const logoutTime =
      formatCaliforniaDateTime(cutoffDate);

    // ========================================================
    // DATABASE CONNECTION
    // ========================================================

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ========================================================
    // FIND USERS STILL LOGGED IN
    //
    // Only users who logged in BEFORE today's 5:30 PM
    // are automatically logged out.
    //
    // Users who login AFTER 5:30 PM remain Active.
    // ========================================================

    const [activeUsers] =
      await connection.query(
        `
        SELECT
          id,
          login_time,
          logout_time
        FROM users
        WHERE login_time IS NOT NULL
          AND logout_time IS NULL
          AND login_time < ?
        FOR UPDATE
        `,
        [logoutTime]
      );

    // ========================================================
    // NO ACTIVE USERS
    // ========================================================

    if (!activeUsers.length) {
      await connection.commit();

      return NextResponse.json({
        success: true,
        processed: true,
        logoutTime,
        affectedUsers: 0,
        userIds: [],
        californiaTime,
        message:
          "No active users required automatic logout",
      });
    }

    // ========================================================
    // GET USER IDS
    // ========================================================

    const userIds =
      activeUsers.map((user) => user.id);

    // ========================================================
    // LOGOUT USERS
    // ========================================================

    await connection.query(
      `
      UPDATE users
      SET logout_time = ?
      WHERE id IN (?)
        AND login_time IS NOT NULL
        AND logout_time IS NULL
      `,
      [logoutTime, userIds]
    );

    // ========================================================
    // CLOSE OPEN LOGIN HISTORY
    // ========================================================

    await connection.query(
      `
      UPDATE login_history
      SET logout_time = ?
      WHERE user_id IN (?)
        AND login_time IS NOT NULL
        AND logout_time IS NULL
      `,
      [logoutTime, userIds]
    );

    // ========================================================
    // COMMIT
    // ========================================================

    await connection.commit();

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,
      processed: true,
      californiaTime,
      logoutTime,
      affectedUsers: userIds.length,
      userIds,
      message:
        "Daily 5:30 PM California automatic logout completed successfully",
    });
  } catch (error) {
    // ========================================================
    // ROLLBACK
    // ========================================================

    try {
      if (connection) {
        await connection.rollback();
      }
    } catch {}

    console.error(
      "DAILY AUTO LOGOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Daily automatic logout failed",
      },
      { status: 500 }
    );
  } finally {
    // ========================================================
    // RELEASE CONNECTION
    // ========================================================

    try {
      if (connection) {
        connection.release();
      }
    } catch {}
  }
}