







import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";

// ============================================================
// CALIFORNIA TIMEZONE
// ============================================================

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// ============================================================
// ALLOWED STATUS
// ============================================================

const ALLOWED_STATUSES = [
  "Active",
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Washroom Break",
  "Inactive",
  "On Call",
  "Meeting",
  "Other",
];

// ============================================================
// BREAK STATUSES
// ============================================================

const BREAK_STATUSES = [
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Washroom Break",
  "Other",
];

const MAX_BREAKS_PER_24_HOURS = 5;

// ============================================================
// GET USER ID FROM JWT
// ============================================================

function getUserIdFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return (
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      null
    );
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);
    return null;
  }
}

// ============================================================
// CALIFORNIA DATE/TIME - DATABASE FORMAT
//
// IMPORTANT:
// Database always receives:
// YYYY-MM-DD HH:mm:ss
//
// Example:
// 2026-09-17 13:28:46
//
// This keeps MySQL calculations safe.
// ============================================================

function getCaliforniaDBDateTime() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return (
    `${values.year}-${values.month}-${values.day} ` +
    `${values.hour}:${values.minute}:${values.second}`
  );
}

// ============================================================
// CALIFORNIA DATE
//
// Example:
// 2026-09-17
// ============================================================

function getCaliforniaDate() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return (
    `${values.year}-${values.month}-${values.day}`
  );
}

// ============================================================
// CALIFORNIA TIME - 12 HOUR DISPLAY FORMAT
//
// Example:
// 1:28:46 PM
//
// This is ONLY for API/UI display.
// ============================================================

function getCaliforniaDisplayTime() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return (
    `${values.hour}:${values.minute}:${values.second} ${values.dayPeriod}`
  );
}

// ============================================================
// CALIFORNIA DATETIME - 12 HOUR DISPLAY
//
// Example:
// 2026-09-17 1:28:46 PM
//
// ONLY FOR RESPONSE.
// ============================================================

function getCaliforniaDisplayDateTime() {
  const date = getCaliforniaDate();
  const time = getCaliforniaDisplayTime();

  return `${date} ${time}`;
}

// ============================================================
// GET CALIFORNIA TIME INFO
// ============================================================

function getCaliforniaTimeInfo() {
  const dbDateTime =
    getCaliforniaDBDateTime();

  const date =
    getCaliforniaDate();

  const time =
    getCaliforniaDisplayTime();

  const displayDateTime =
    `${date} ${time}`;

  return {
    date,
    time,
    dbDateTime,
    displayDateTime,
  };
}

// ============================================================
// GET USER
// ============================================================

async function getUserById(
  connectionOrPool,
  userId
) {
  const [rows] =
    await connectionOrPool.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          availability_status,
          status_started_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

  return rows?.[0] || null;
}

// ============================================================
// GET BREAK COUNT
//
// Database timestamps stay in:
// YYYY-MM-DD HH:mm:ss
// ============================================================

async function getBreakCount(
  connectionOrPool,
  userId,
  californiaDBDateTime
) {
  const [rows] =
    await connectionOrPool.query(
      `
        SELECT
          COUNT(*) AS break_count
        FROM user_status_history
        WHERE
          user_id = ?
          AND status IN (
            'Namaz Break',
            'Lunch Break',
            'Short Break',
            'Washroom Break',
            'Other'
          )
          AND started_at >= DATE_SUB(
            ?,
            INTERVAL 24 HOUR
          )
      `,
      [
        userId,
        californiaDBDateTime,
      ]
    );

  return Number(
    rows?.[0]?.break_count || 0
  );
}

// ============================================================
// BREAK INFORMATION
// ============================================================

function getBreakInfo(breakCount) {
  const remainingBreaks =
    Math.max(
      0,
      MAX_BREAKS_PER_24_HOURS -
        breakCount
    );

  return {
    break_limit:
      MAX_BREAKS_PER_24_HOURS,

    break_count:
      breakCount,

    remaining_breaks:
      remainingBreaks,

    break_limit_reached:
      breakCount >=
      MAX_BREAKS_PER_24_HOURS,
  };
}

// ============================================================
// GET CURRENT STATUS
// ============================================================

export async function GET(request) {
  try {
    // ========================================================
    // USER ID
    // ========================================================

    const userId =
      getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Login required",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // CALIFORNIA TIME
    // ========================================================

    const california =
      getCaliforniaTimeInfo();

    // ========================================================
    // GET USER
    // ========================================================

    const user =
      await getUserById(
        pool,
        userId
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        { status: 404 }
      );
    }

    // ========================================================
    // BREAK COUNT
    // ========================================================

    const breakCount =
      await getBreakCount(
        pool,
        userId,
        california.dbDateTime
      );

    const breakInfo =
      getBreakInfo(
        breakCount
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,

          availability_status:
            user.availability_status ||
            "Active",

          status_started_at:
            user.status_started_at ||
            null,
        },

        status:
          user.availability_status ||
          "Active",

        status_started_at:
          user.status_started_at ||
          null,

        // ====================================================
        // BREAK
        // ====================================================

        ...breakInfo,

        // ====================================================
        // TIMEZONE
        // ====================================================

        timezone:
          CALIFORNIA_TIMEZONE,

        california_date:
          california.date,

        // 12-hour display
        california_time:
          california.time,

        // 12-hour display
        california_datetime:
          california.displayDateTime,

        // Optional DB-safe time
        california_db_datetime:
          california.dbDateTime,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET USER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to get user status",
        error:
          error?.message ||
          "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// UPDATE CURRENT USER STATUS
// ============================================================

export async function PUT(request) {
  let connection = null;

  try {
    // ========================================================
    // USER ID
    // ========================================================

    const userId =
      getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Login required",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // REQUEST BODY
    // ========================================================

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const newStatus =
      body?.status;

    // ========================================================
    // VALIDATE STATUS
    // ========================================================

    if (!newStatus) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status is required",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_STATUSES.includes(
        newStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid availability status",

          allowedStatuses:
            ALLOWED_STATUSES,
        },
        { status: 400 }
      );
    }

    // ========================================================
    // CURRENT CALIFORNIA TIME
    // ========================================================

    const california =
      getCaliforniaTimeInfo();

    // IMPORTANT:
    // Use DB format for MySQL
    const californiaNow =
      california.dbDateTime;

    // ========================================================
    // DATABASE CONNECTION
    // ========================================================

    connection =
      await pool.getConnection();

    // ========================================================
    // START TRANSACTION
    // ========================================================

    await connection.beginTransaction();

    // ========================================================
    // GET CURRENT USER + LOCK
    // ========================================================

    const [currentRows] =
      await connection.query(
        `
          SELECT
            id,
            name,
            email,
            role,
            availability_status,
            status_started_at
          FROM users
          WHERE id = ?
          LIMIT 1
          FOR UPDATE
        `,
        [userId]
      );

    if (
      !currentRows ||
      currentRows.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        { status: 404 }
      );
    }

    const currentUser =
      currentRows[0];

    const currentStatus =
      currentUser.availability_status ||
      "Active";

    const currentStartedAt =
      currentUser.status_started_at;

    // ========================================================
    // SAME STATUS
    // ========================================================

    if (
      currentStatus ===
      newStatus
    ) {
      const sameStatusBreakCount =
        await getBreakCount(
          connection,
          userId,
          californiaNow
        );

      const breakInfo =
        getBreakInfo(
          sameStatusBreakCount
        );

      await connection.commit();

      return NextResponse.json(
        {
          success: true,

          message:
            "Status is already set",

          user: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,

            availability_status:
              currentStatus,

            status_started_at:
              currentStartedAt ||
              null,
          },

          status:
            currentStatus,

          status_started_at:
            currentStartedAt ||
            null,

          duration_seconds:
            null,

          ...breakInfo,

          // ==================================================
          // TIME
          // ==================================================

          timezone:
            CALIFORNIA_TIMEZONE,

          california_date:
            california.date,

          california_time:
            california.time,

          california_datetime:
            california.displayDateTime,

          california_db_datetime:
            california.dbDateTime,
        },
        { status: 200 }
      );
    }

    // ========================================================
    // BREAK LIMIT
    // ========================================================

    if (
      BREAK_STATUSES.includes(
        newStatus
      )
    ) {
      const breakCount =
        await getBreakCount(
          connection,
          userId,
          californiaNow
        );

      if (
        breakCount >=
        MAX_BREAKS_PER_24_HOURS
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,

            message:
              "Break limit reached. You can take maximum 5 breaks within 24 hours.",

            error:
              "MAX_BREAKS_REACHED",

            break_limit:
              MAX_BREAKS_PER_24_HOURS,

            break_count:
              breakCount,

            remaining_breaks:
              0,

            break_limit_reached:
              true,

            timezone:
              CALIFORNIA_TIMEZONE,

            california_date:
              california.date,

            california_time:
              california.time,

            california_datetime:
              california.displayDateTime,

            california_db_datetime:
              california.dbDateTime,
          },
          { status: 429 }
        );
      }
    }

    // ========================================================
    // CLOSE CURRENT OPEN HISTORY
    // ========================================================

    let closedDurationSeconds =
      null;

    if (
      currentStatus !==
        "Active" &&
      currentStartedAt
    ) {
      // ======================================================
      // FIND OPEN HISTORY
      // ======================================================

      const [
        openHistoryRows,
      ] =
        await connection.query(
          `
            SELECT
              id,
              started_at
            FROM user_status_history
            WHERE
              user_id = ?
              AND ended_at IS NULL
            ORDER BY id DESC
            LIMIT 1
            FOR UPDATE
          `,
          [userId]
        );

      // ======================================================
      // OPEN HISTORY FOUND
      // ======================================================

      if (
        openHistoryRows &&
        openHistoryRows.length > 0
      ) {
        const history =
          openHistoryRows[0];

        // ====================================================
        // CLOSE HISTORY
        // ====================================================

        const [
          closeResult,
        ] =
          await connection.query(
            `
              UPDATE user_status_history
              SET
                ended_at = ?,
                duration_seconds =
                  TIMESTAMPDIFF(
                    SECOND,
                    started_at,
                    ?
                  )
              WHERE id = ?
            `,
            [
              californiaNow,
              californiaNow,
              history.id,
            ]
          );

        // ====================================================
        // GET FINAL DURATION
        // ====================================================

        if (
          closeResult.affectedRows >
          0
        ) {
          const [
            durationRows,
          ] =
            await connection.query(
              `
                SELECT
                  duration_seconds
                FROM user_status_history
                WHERE id = ?
                LIMIT 1
              `,
              [history.id]
            );

          if (
            durationRows &&
            durationRows.length > 0
          ) {
            closedDurationSeconds =
              Number(
                durationRows[0]
                  .duration_seconds ||
                  0
              );
          }
        }
      }

      // ======================================================
      // SAFETY FALLBACK
      // ======================================================

      else {
        const [
          fallbackResult,
        ] =
          await connection.query(
            `
              INSERT INTO user_status_history
              (
                user_id,
                status,
                started_at,
                ended_at,
                duration_seconds
              )
              VALUES
              (
                ?,
                ?,
                ?,
                ?,
                TIMESTAMPDIFF(
                  SECOND,
                  ?,
                  ?
                )
              )
            `,
            [
              userId,
              currentStatus,
              currentStartedAt,
              californiaNow,
              currentStartedAt,
              californiaNow,
            ]
          );

        if (
          fallbackResult.insertId
        ) {
          const [
            durationRows,
          ] =
            await connection.query(
              `
                SELECT
                  duration_seconds
                FROM user_status_history
                WHERE id = ?
                LIMIT 1
              `,
              [
                fallbackResult.insertId,
              ]
            );

          if (
            durationRows &&
            durationRows.length > 0
          ) {
            closedDurationSeconds =
              Number(
                durationRows[0]
                  .duration_seconds ||
                  0
              );
          }
        }
      }
    }

    // ========================================================
    // NEW STATUS = ACTIVE
    // ========================================================

    if (
      newStatus === "Active"
    ) {
      const [result] =
        await connection.query(
          `
            UPDATE users
            SET
              availability_status = ?,
              status_started_at = NULL
            WHERE id = ?
          `,
          [
            "Active",
            userId,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "User not found",
          },
          { status: 404 }
        );
      }
    }

    // ========================================================
    // NEW STATUS = NON ACTIVE
    // ========================================================

    else {
      // ======================================================
      // INSERT OPEN HISTORY
      // ======================================================

      await connection.query(
        `
          INSERT INTO user_status_history
          (
            user_id,
            status,
            started_at,
            ended_at,
            duration_seconds
          )
          VALUES
          (
            ?,
            ?,
            ?,
            NULL,
            NULL
          )
        `,
        [
          userId,
          newStatus,
          californiaNow,
        ]
      );

      // ======================================================
      // UPDATE USER
      // ======================================================

      const [result] =
        await connection.query(
          `
            UPDATE users
            SET
              availability_status = ?,
              status_started_at = ?
            WHERE id = ?
          `,
          [
            newStatus,
            californiaNow,
            userId,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "User not found",
          },
          { status: 404 }
        );
      }
    }

    // ========================================================
    // GET UPDATED USER
    // ========================================================

    const updatedUser =
      await getUserById(
        connection,
        userId
      );

    if (!updatedUser) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        { status: 404 }
      );
    }

    // ========================================================
    // FINAL BREAK COUNT
    // ========================================================

    const finalBreakCount =
      await getBreakCount(
        connection,
        userId,
        californiaNow
      );

    const breakInfo =
      getBreakInfo(
        finalBreakCount
      );

    // ========================================================
    // COMMIT
    // ========================================================

    await connection.commit();

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Availability status updated successfully",

        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,

          availability_status:
            updatedUser.availability_status ||
            "Active",

          status_started_at:
            updatedUser.status_started_at ||
            null,
        },

        status:
          updatedUser.availability_status ||
          "Active",

        status_started_at:
          updatedUser.status_started_at ||
          null,

        // ====================================================
        // CLOSED STATUS DURATION
        // ====================================================

        duration_seconds:
          closedDurationSeconds,

        // ====================================================
        // BREAK
        // ====================================================

        ...breakInfo,

        // ====================================================
        // TIMEZONE
        // ====================================================

        timezone:
          CALIFORNIA_TIMEZONE,

        california_date:
          california.date,

        // 12-hour
        california_time:
          california.time,

        // 12-hour
        california_datetime:
          california.displayDateTime,

        // DB-safe 24-hour
        california_db_datetime:
          california.dbDateTime,
      },
      { status: 200 }
    );
  } catch (error) {
    // ========================================================
    // ROLLBACK
    // ========================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    console.error(
      "UPDATE USER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to update availability status",

        error:
          error?.message ||
          "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // ========================================================
    // RELEASE CONNECTION
    // ========================================================

    if (connection) {
      connection.release();
    }
  }
}