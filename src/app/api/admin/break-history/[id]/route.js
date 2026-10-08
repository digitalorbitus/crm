import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

const BREAK_STATUSES = [
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Washroom Break",
  "Other",
];

const BREAK_LIMITS = {
  "Namaz Break": 15 * 60,
  "Lunch Break": 30 * 60,
  "Short Break": 10 * 60,
  "Washroom Break": null,
  Other: null,
};

// ============================================================
// JSON HELPER
// ============================================================

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

// ============================================================
// AUTH
// ============================================================

async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers");

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        error: "Authentication required",
        status: 401,
      };
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded?.id ??
      decoded?._id ??
      decoded?.userId ??
      decoded?.user_id ??
      decoded?.sub ??
      null;

    if (!userId) {
      return {
        error: "Invalid authentication token",
        status: 401,
      };
    }

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          team,
          availability_status,
          status_started_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return {
        error: "User not found",
        status: 401,
      };
    }

    return {
      user: rows[0],
    };
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return {
      error: "Invalid or expired authentication token",
      status: 401,
    };
  }
}

// ============================================================
// ADMIN CHECK
// ============================================================

async function requireAdmin() {
  const auth = await getCurrentUser();

  if (auth.error) {
    return auth;
  }

  const role = String(
    auth.user.role || ""
  )
    .trim()
    .toLowerCase();

  if (role !== "admin") {
    return {
      error: "Admin access required",
      status: 403,
    };
  }

  return auth;
}

// ============================================================
// BREAK ID
// ============================================================

function getBreakId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const id = Number(
    String(value).trim()
  );

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

// ============================================================
// TIMEZONE OFFSET
// ============================================================

function getTimezoneOffsetMinutes(
  date,
  timeZone
) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      timeZoneName: "shortOffset",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  ).formatToParts(date);

  const timeZoneName =
    parts.find(
      (part) =>
        part.type === "timeZoneName"
    )?.value || "GMT";

  if (timeZoneName === "GMT") {
    return 0;
  }

  const match = timeZoneName.match(
    /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/
  );

  if (!match) {
    return 0;
  }

  const sign =
    match[1] === "+" ? 1 : -1;

  const hours = Number(
    match[2] || 0
  );

  const minutes = Number(
    match[3] || 0
  );

  return (
    sign *
    (hours * 60 + minutes)
  );
}

// ============================================================
// PARSE DATE PARTS
//
// Accepted:
//
// 2026-10-07 10:30:00
// 2026-10-07T10:30:00
// 2026-10-07T10:30
// ============================================================

function parseDateTimeParts(value) {
  if (value instanceof Date) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return null;
    }

    return {
      year: value.getUTCFullYear(),
      month:
        value.getUTCMonth() + 1,
      day: value.getUTCDate(),
      hour: value.getUTCHours(),
      minute:
        value.getUTCMinutes(),
      second:
        value.getUTCSeconds(),
      millisecond:
        value.getUTCMilliseconds(),
    };
  }

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/
  );

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(
      match[6] || 0
    ),
    millisecond: Number(
      String(match[7] || "0")
        .padEnd(3, "0")
        .slice(0, 3)
    ),
  };
}

// ============================================================
// CALIFORNIA WALL CLOCK -> REAL DATE
// ============================================================

function californiaWallClockToDate(
  parts
) {
  if (!parts) {
    return null;
  }

  const wallClockUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond
  );

  let guess = new Date(
    wallClockUtc
  );

  for (let i = 0; i < 5; i++) {
    const offsetMinutes =
      getTimezoneOffsetMinutes(
        guess,
        CALIFORNIA_TIMEZONE
      );

    const corrected =
      wallClockUtc -
      offsetMinutes * 60 * 1000;

    if (
      corrected ===
      guess.getTime()
    ) {
      break;
    }

    guess = new Date(
      corrected
    );
  }

  return Number.isNaN(
    guess.getTime()
  )
    ? null
    : guess;
}

// ============================================================
// INPUT -> CALIFORNIA DATE
// ============================================================

function inputToCaliforniaDate(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  /*
   * Explicit timezone.
   *
   * Example:
   * 2026-10-07T10:30:00-07:00
   * 2026-10-07T17:30:00Z
   */

  if (
    /Z$/i.test(raw) ||
    /[+-]\d{2}:\d{2}$/.test(raw)
  ) {
    const date = new Date(raw);

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  /*
   * No timezone means
   * California wall-clock time.
   */

  const parts =
    parseDateTimeParts(raw);

  if (!parts) {
    return null;
  }

  return californiaWallClockToDate(
    parts
  );
}

// ============================================================
// DATE -> CALIFORNIA MYSQL DATETIME
// ============================================================

function dateToCaliforniaMySQL(
  date
) {
  if (
    !date ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          CALIFORNIA_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    ).formatToParts(date);

  const get = (type) =>
    parts.find(
      (part) =>
        part.type === type
    )?.value || "";

  return `${get("year")}-${get(
    "month"
  )}-${get("day")} ${get(
    "hour"
  )}:${get("minute")}:${get(
    "second"
  )}`;
}

// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  return (
    BREAK_STATUSES.find(
      (status) =>
        status.toLowerCase() ===
        raw.toLowerCase()
    ) || null
  );
}

// ============================================================
// DURATION
// ============================================================

function calculateDurationSeconds(
  startDate,
  endDate
) {
  if (
    !startDate ||
    !endDate
  ) {
    return 0;
  }

  const seconds = Math.floor(
    (
      endDate.getTime() -
      startDate.getTime()
    ) / 1000
  );

  return Math.max(
    0,
    seconds
  );
}

// ============================================================
// APPLY BREAK LIMIT
// ============================================================

function applyBreakLimit(
  status,
  durationSeconds
) {
  const limit =
    BREAK_LIMITS[status];

  /*
   * Washroom / Other
   * have no duration limit.
   */

  if (
    limit === null ||
    limit === undefined
  ) {
    return durationSeconds;
  }

  return Math.min(
    durationSeconds,
    limit
  );
}

// ============================================================
// GET BREAK BY ID
// ============================================================

async function getBreakById(
  id,
  connection = pool
) {
  const [rows] =
    await connection.query(
      `
        SELECT
          h.id,
          h.user_id,
          h.status,
          h.started_at,
          h.ended_at,
          h.duration_seconds,
          h.created_at,

          u.name,
          u.email,
          u.role,
          u.team,
          u.availability_status,
          u.status_started_at

        FROM user_status_history h

        INNER JOIN users u
          ON u.id = h.user_id

        WHERE h.id = ?

        LIMIT 1
      `,
      [id]
    );

  return rows?.[0] || null;
}

// ============================================================
// SYNC USER STATUS
// ============================================================

async function syncUserStatus(
  connection,
  userId
) {
  const [openBreaks] =
    await connection.query(
      `
        SELECT
          id,
          status,
          started_at

        FROM user_status_history

        WHERE user_id = ?
          AND ended_at IS NULL

          AND status IN (
            'Namaz Break',
            'Lunch Break',
            'Short Break',
            'Washroom Break',
            'Other'
          )

        ORDER BY
          COALESCE(
            started_at,
            created_at
          ) DESC,
          id DESC

        LIMIT 1
      `,
      [userId]
    );

  /*
   * User has an active break.
   */

  if (openBreaks?.length) {
    const openBreak =
      openBreaks[0];

    await connection.query(
      `
        UPDATE users

        SET
          availability_status = ?,
          status_started_at = ?

        WHERE id = ?
      `,
      [
        openBreak.status,
        openBreak.started_at,
        userId,
      ]
    );

    return {
      availability_status:
        openBreak.status,

      status_started_at:
        openBreak.started_at,
    };
  }

  /*
   * No active break.
   */

  await connection.query(
    `
      UPDATE users

      SET
        availability_status = 'Active',
        status_started_at = NULL

      WHERE id = ?
    `,
    [userId]
  );

  return {
    availability_status:
      "Active",

    status_started_at: null,
  };
}

// ============================================================
// PUT
// ADMIN EDIT BREAK
// ============================================================

export async function PUT(
  request,
  context
) {
  const auth =
    await requireAdmin();

  if (auth.error) {
    return json(
      {
        success: false,
        error: auth.error,
      },
      auth.status
    );
  }

  /*
   * Next.js 15/16:
   * context.params is async.
   */

  const params =
    await context.params;

  const breakId =
    getBreakId(
      params?.id
    );

  if (!breakId) {
    return json(
      {
        success: false,
        error: "Invalid break ID",
        received_id:
          params?.id ?? null,
      },
      400
    );
  }

  let body;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        success: false,
        error:
          "Invalid JSON body",
      },
      400
    );
  }

  const connection =
    await pool.getConnection();

  let transactionStarted =
    false;

  try {
    await connection.beginTransaction();

    transactionStarted = true;

    // ========================================================
    // FIND ORIGINAL RECORD
    // ========================================================

    const existing =
      await getBreakById(
        breakId,
        connection
      );

    if (!existing) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Break record not found",
        },
        404
      );
    }

    // ========================================================
    // KEEP ORIGINAL USER
    // ========================================================

    const userId =
      Number(existing.user_id);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Invalid user assigned to this break.",
        },
        400
      );
    }

    // ========================================================
    // STATUS
    // ========================================================

    const status =
      body?.status !== undefined
        ? normalizeStatus(
            body.status
          )
        : normalizeStatus(
            existing.status
          );

    if (!status) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            `Invalid break status. Allowed values: ${BREAK_STATUSES.join(
              ", "
            )}`,
        },
        400
      );
    }

    // ========================================================
    // START
    // ========================================================

    const startValue =
      body?.started_at !==
      undefined
        ? body.started_at
        : existing.started_at;

    // ========================================================
    // END
    // ========================================================

    let endValue =
      body?.ended_at !==
      undefined
        ? body.ended_at
        : existing.ended_at;

    if (
      endValue === "" ||
      endValue === null ||
      endValue === undefined
    ) {
      endValue = null;
    }

    // ========================================================
    // PARSE START
    // ========================================================

    const startedDate =
      inputToCaliforniaDate(
        startValue
      );

    if (!startedDate) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Invalid started_at. Use California date/time such as 2026-10-07 10:30:00.",
        },
        400
      );
    }

    // ========================================================
    // PARSE END
    // ========================================================

    let endedDate = null;

    if (endValue !== null) {
      endedDate =
        inputToCaliforniaDate(
          endValue
        );

      if (!endedDate) {
        await connection.rollback();
        transactionStarted = false;

        return json(
          {
            success: false,
            error:
              "Invalid ended_at. Use California date/time such as 2026-10-07 10:45:00.",
          },
          400
        );
      }

      if (
        endedDate.getTime() <
        startedDate.getTime()
      ) {
        await connection.rollback();
        transactionStarted = false;

        return json(
          {
            success: false,
            error:
              "End time cannot be earlier than start time.",
          },
          400
        );
      }
    }

    // ========================================================
    // DURATION
    // ========================================================

    let durationSeconds =
      calculateDurationSeconds(
        startedDate,
        endedDate
      );

    if (endedDate) {
      durationSeconds =
        applyBreakLimit(
          status,
          durationSeconds
        );
    } else {
      durationSeconds = 0;
    }

    // ========================================================
    // MYSQL CALIFORNIA VALUES
    // ========================================================

    const startedMySQL =
      dateToCaliforniaMySQL(
        startedDate
      );

    const endedMySQL =
      endedDate
        ? dateToCaliforniaMySQL(
            endedDate
          )
        : null;

    if (!startedMySQL) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Could not convert start time.",
        },
        400
      );
    }

    // ========================================================
    // ACTIVE BREAK CHECK
    // ========================================================

    if (!endedDate) {
      const [
        otherOpenBreaks,
      ] = await connection.query(
        `
          SELECT
            id,
            status,
            started_at

          FROM user_status_history

          WHERE user_id = ?
            AND ended_at IS NULL
            AND id <> ?

            AND status IN (
              'Namaz Break',
              'Lunch Break',
              'Short Break',
              'Washroom Break',
              'Other'
            )

          ORDER BY
            started_at DESC,
            id DESC

          LIMIT 1
        `,
        [
          userId,
          breakId,
        ]
      );

      if (
        otherOpenBreaks?.length
      ) {
        await connection.rollback();
        transactionStarted = false;

        return json(
          {
            success: false,
            error:
              "This user already has an active break. End the existing break first.",

            existing_break:
              otherOpenBreaks[0],
          },
          409
        );
      }
    }

    // ========================================================
    // UPDATE SAME ROW
    //
    // IMPORTANT:
    // ID WILL NOT CHANGE.
    // ========================================================

    const [
      updateResult,
    ] = await connection.query(
      `
        UPDATE user_status_history

        SET
          status = ?,
          started_at = ?,
          ended_at = ?,
          duration_seconds = ?,
          created_at = ?

        WHERE id = ?

        LIMIT 1
      `,
      [
        status,
        startedMySQL,
        endedMySQL,
        durationSeconds,
        startedMySQL,
        breakId,
      ]
    );

    if (
      updateResult?.affectedRows !==
      1
    ) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Break record was not updated.",
          break_id: breakId,
        },
        404
      );
    }

    // ========================================================
    // SYNC USER STATUS
    // ========================================================

    const userStatus =
      await syncUserStatus(
        connection,
        userId
      );

    await connection.commit();
    transactionStarted = false;

    // ========================================================
    // FETCH UPDATED RECORD
    // ========================================================

    const updatedBreak =
      await getBreakById(
        breakId,
        pool
      );

    return json(
      {
        success: true,

        message:
          "Break updated successfully",

        break:
          updatedBreak,

        user_status:
          userStatus,

        timezone:
          CALIFORNIA_TIMEZONE,
      },
      200
    );
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error(
      "ADMIN BREAK UPDATE ERROR:",
      error
    );

    return json(
      {
        success: false,
        error:
          "Failed to update break",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      },
      500
    );
  } finally {
    connection.release();
  }
}

// ============================================================
// DELETE
// ADMIN DELETE BREAK
// ============================================================

export async function DELETE(
  request,
  context
) {
  const auth =
    await requireAdmin();

  if (auth.error) {
    return json(
      {
        success: false,
        error: auth.error,
      },
      auth.status
    );
  }

  const params =
    await context.params;

  const breakId =
    getBreakId(
      params?.id
    );

  if (!breakId) {
    return json(
      {
        success: false,
        error: "Invalid break ID",
        received_id:
          params?.id ?? null,
      },
      400
    );
  }

  const connection =
    await pool.getConnection();

  let transactionStarted =
    false;

  try {
    await connection.beginTransaction();

    transactionStarted = true;

    // ========================================================
    // FIND RECORD
    // ========================================================

    const existing =
      await getBreakById(
        breakId,
        connection
      );

    if (!existing) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Break record not found",
        },
        404
      );
    }

    const userId =
      Number(existing.user_id);

    const wasOpen =
      existing.ended_at ===
        null ||
      existing.ended_at ===
        undefined;

    // ========================================================
    // DELETE EXACT RECORD
    // ========================================================

    const [
      deleteResult,
    ] = await connection.query(
      `
        DELETE FROM user_status_history

        WHERE id = ?

        LIMIT 1
      `,
      [breakId]
    );

    if (
      deleteResult?.affectedRows !==
      1
    ) {
      await connection.rollback();
      transactionStarted = false;

      return json(
        {
          success: false,
          error:
            "Break record was not deleted.",
          break_id: breakId,
        },
        404
      );
    }

    // ========================================================
    // SYNC USER STATUS
    // ========================================================

    const userStatus =
      await syncUserStatus(
        connection,
        userId
      );

    await connection.commit();
    transactionStarted = false;

    return json(
      {
        success: true,

        message:
          "Break deleted successfully",

        deleted_break_id:
          breakId,

        was_active:
          wasOpen,

        user_status:
          userStatus,

        timezone:
          CALIFORNIA_TIMEZONE,
      },
      200
    );
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error(
      "ADMIN BREAK DELETE ERROR:",
      error
    );

    return json(
      {
        success: false,
        error:
          "Failed to delete break",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      },
      500
    );
  } finally {
    connection.release();
  }
}