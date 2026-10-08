
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================
// CONFIG
// ============================================================

const COOKIE_NAME = "token";
const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

// ============================================================
// ALLOWED STATUSES
// ============================================================

const ALLOWED_STATUSES = [
  "Active",
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Inactive",
  "On Call",
  "Meeting",
  "Washroom Break",
  "Other",
];

// Only these statuses consume break limits.
const BREAK_STATUSES = [
  "Namaz Break",
  "Lunch Break",
  "Short Break",
];

// ============================================================
// BREAK LIMITS
//
// IMPORTANT:
//
// These limits reset at:
//
// 08:00 AM California
//
// Example:
//
// Oct 07 08:00 AM
//        ↓
// Oct 08 08:00 AM
//
// is ONE break window.
// ============================================================

const MAX_BREAKS_PER_WINDOW = 5;

const MAX_NAMAZ_BREAKS_PER_WINDOW = 1;
const MAX_LUNCH_BREAKS_PER_WINDOW = 1;
const MAX_SHORT_BREAKS_PER_WINDOW = 3;

// ============================================================
// BREAK DURATION LIMITS
// ============================================================

const BREAK_DURATION_LIMITS_MINUTES = {
  "Namaz Break": 15,
  "Lunch Break": 30,
  "Short Break": 10,
};

// ============================================================
// AUTH
// ============================================================

function getUserIdFromToken(request) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is missing");
      return null;
    }

    const decoded = jwt.verify(token, secret);

    const id =
      decoded?.id ??
      decoded?.userId ??
      decoded?.user_id ??
      decoded?.sub;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      return null;
    }

    const numericId = Number(id);

    if (
      !Number.isFinite(numericId) ||
      numericId <= 0
    ) {
      return null;
    }

    return numericId;
  } catch (error) {
    console.error(
      "JWT verification error:",
      error
    );

    return null;
  }
}

// ============================================================
// CALIFORNIA DATE PARTS
// ============================================================

function getCaliforniaParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: CALIFORNIA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  );

  const parts = formatter.formatToParts(date);

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return {
    year: Number(result.year),
    month: Number(result.month),
    day: Number(result.day),
    hour: Number(result.hour),
    minute: Number(result.minute),
    second: Number(result.second),
  };
}

// ============================================================
// FORMAT YYYY-MM-DD
// ============================================================

function formatDate(year, month, day) {
  return (
    `${String(year).padStart(4, "0")}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`
  );
}

// ============================================================
// CALIFORNIA DATE
// ============================================================

function getCaliforniaDate(date = new Date()) {
  const parts = getCaliforniaParts(date);

  return formatDate(
    parts.year,
    parts.month,
    parts.day
  );
}

// ============================================================
// CALIFORNIA WALL CLOCK -> REAL JS DATE
//
// This converts a California wall-clock date/time
// into the correct real timestamp while respecting
// America/Los_Angeles DST.
// ============================================================

function californiaWallClockToDate(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0
) {
  const desiredWallAsUTC = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  );

  let guess = desiredWallAsUTC;

  for (let i = 0; i < 10; i++) {
    const parts = getCaliforniaParts(
      new Date(guess)
    );

    const actualWallAsUTC = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );

    const difference =
      desiredWallAsUTC -
      actualWallAsUTC;

    if (difference === 0) {
      break;
    }

    guess += difference;
  }

  return new Date(guess);
}

// ============================================================
// CALIFORNIA DATETIME FOR MYSQL
//
// Stored as California wall-clock DATETIME.
//
// Example:
//
// 2026-10-07 08:15:30
// ============================================================

function getCaliforniaDBDateTime(
  date = new Date()
) {
  const parts = getCaliforniaParts(date);

  return (
    `${String(parts.year).padStart(4, "0")}-` +
    `${String(parts.month).padStart(2, "0")}-` +
    `${String(parts.day).padStart(2, "0")} ` +
    `${String(parts.hour).padStart(2, "0")}:` +
    `${String(parts.minute).padStart(2, "0")}:` +
    `${String(parts.second).padStart(2, "0")}`
  );
}

// ============================================================
// CALIFORNIA DISPLAY TIME
// ============================================================

function getCaliforniaDisplayTime(
  date = new Date()
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: CALIFORNIA_TIMEZONE,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }
  ).format(date);
}

// ============================================================
// ADD / SUBTRACT CALENDAR DAYS
//
// Important:
// We manipulate California calendar dates,
// not raw milliseconds.
// This keeps the 8 AM boundary correct around DST.
// ============================================================

function shiftCalendarDate(
  year,
  month,
  day,
  days
) {
  const utc = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0
    )
  );

  utc.setUTCDate(
    utc.getUTCDate() + days
  );

  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

// ============================================================
// BREAK WINDOW
//
// BREAK WINDOW:
//
// 08:00 AM California
// ->
// next day 08:00 AM California
//
// If current California time is:
//
// 07:30 AM
//
// window started yesterday at 08:00 AM.
//
// If current California time is:
//
// 08:00 AM or later
//
// window started today at 08:00 AM.
// ============================================================

function getBreakWindowInfo(
  date = new Date()
) {
  const parts = getCaliforniaParts(date);

  const beforeEight =
    parts.hour < 8;

  let startDate = {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };

  if (beforeEight) {
    startDate = shiftCalendarDate(
      parts.year,
      parts.month,
      parts.day,
      -1
    );
  }

  const endDate = shiftCalendarDate(
    startDate.year,
    startDate.month,
    startDate.day,
    1
  );

  const startDateObject =
    californiaWallClockToDate(
      startDate.year,
      startDate.month,
      startDate.day,
      8,
      0,
      0
    );

  const endDateObject =
    californiaWallClockToDate(
      endDate.year,
      endDate.month,
      endDate.day,
      8,
      0,
      0
    );

  const startDB =
    getCaliforniaDBDateTime(
      startDateObject
    );

  const endDB =
    getCaliforniaDBDateTime(
      endDateObject
    );

  return {
    startDate: formatDate(
      startDate.year,
      startDate.month,
      startDate.day
    ),

    endDate: formatDate(
      endDate.year,
      endDate.month,
      endDate.day
    ),

    startDB,
    endDB,

    startMs:
      startDateObject.getTime(),

    endMs:
      endDateObject.getTime(),

    timezone:
      CALIFORNIA_TIMEZONE,

    label:
      `${startDB} → ${endDB}`,
  };
}

// ============================================================
// BREAK WINDOW START
// ============================================================

function getCurrentBreakWindowStartDB(
  date = new Date()
) {
  return getBreakWindowInfo(date)
    .startDB;
}

// ============================================================
// BREAK WINDOW END
// ============================================================

function getCurrentBreakWindowEndDB(
  date = new Date()
) {
  return getBreakWindowInfo(date)
    .endDB;
}

// ============================================================
// BREAK START RESTRICTION
//
// 12:00 AM - 7:59:59 AM = ALLOWED
// 8:00 AM  - 8:59:59 AM = BLOCKED
// 9:00 AM onward        = ALLOWED
//
// ONLY NEW BREAK STARTS ARE BLOCKED.
//
// Existing break is NOT automatically stopped.
// ============================================================

function isBreakAllowedAtCaliforniaTime(
  date = new Date()
) {
  const parts =
    getCaliforniaParts(date);

  const totalMinutes =
    parts.hour * 60 +
    parts.minute;

  const BLOCK_START =
    8 * 60;

  const BLOCK_END =
    9 * 60;

  return !(
    totalMinutes >= BLOCK_START &&
    totalMinutes < BLOCK_END
  );
}

// ============================================================
// RESTRICTION MESSAGE
// ============================================================

function getBreakRestrictionMessage(
  date = new Date()
) {
  const parts =
    getCaliforniaParts(date);

  const currentTime =
    `${String(parts.hour).padStart(2, "0")}:` +
    `${String(parts.minute).padStart(2, "0")}:` +
    `${String(parts.second).padStart(2, "0")}`;

  return (
    "Breaks are not allowed from 8:00 AM to 9:00 AM California time. " +
    `Current California time is ${currentTime}. ` +
    "Breaks are available again at 9:00 AM."
  );
}

// ============================================================
// STATUS HELPERS
// ============================================================

function isBreakStatus(status) {
  return BREAK_STATUSES.includes(status);
}

function getBreakDurationLimitMinutes(
  status
) {
  return (
    BREAK_DURATION_LIMITS_MINUTES[
      status
    ] || 0
  );
}

function getBreakDurationLimitSeconds(
  status
) {
  return (
    getBreakDurationLimitMinutes(
      status
    ) * 60
  );
}

// ============================================================
// CALIFORNIA DATETIME -> REAL TIMESTAMP
//
// MySQL DATETIME is treated as California wall-clock time.
// ============================================================

function californiaDateTimeToMs(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  try {
    // ========================================================
    // CASE 1: JavaScript Date
    // ========================================================

    if (value instanceof Date) {
      if (
        Number.isNaN(
          value.getTime()
        )
      ) {
        return null;
      }

      const year =
        value.getFullYear();

      const month =
        value.getMonth() + 1;

      const day =
        value.getDate();

      const hour =
        value.getHours();

      const minute =
        value.getMinutes();

      const second =
        value.getSeconds();

      return californiaWallClockToDate(
        year,
        month,
        day,
        hour,
        minute,
        second
      ).getTime();
    }

    // ========================================================
    // CASE 2: STRING
    // ========================================================

    let text =
      String(value).trim();

    if (!text) {
      return null;
    }

    text = text.replace(
      "T",
      " "
    );

    // Remove milliseconds.
    text = text.replace(
      /\.\d{1,6}$/,
      ""
    );

    const match =
      text.match(
        /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
      );

    if (!match) {
      console.error(
        "Invalid California DATETIME:",
        value
      );

      return null;
    }

    const year =
      Number(match[1]);

    const month =
      Number(match[2]);

    const day =
      Number(match[3]);

    const hour =
      Number(match[4]);

    const minute =
      Number(match[5]);

    const second =
      Number(match[6]);

    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59
    ) {
      return null;
    }

    return californiaWallClockToDate(
      year,
      month,
      day,
      hour,
      minute,
      second
    ).getTime();
  } catch (error) {
    console.error(
      "californiaDateTimeToMs error:",
      error
    );

    return null;
  }
}

// ============================================================
// TIME INFO
// ============================================================

function getTimeInfo() {
  const now = new Date();

  const parts =
    getCaliforniaParts(now);

  const window =
    getBreakWindowInfo(now);

  return {
    serverNowMs:
      now.getTime(),

    californiaDate:
      getCaliforniaDate(now),

    californiaNow:
      getCaliforniaDBDateTime(now),

    californiaDisplayTime:
      getCaliforniaDisplayTime(now),

    californiaHour:
      parts.hour,

    californiaMinute:
      parts.minute,

    californiaSecond:
      parts.second,

    iso:
      now.toISOString(),

    breakWindow: {
      start:
        window.startDB,

      end:
        window.endDB,

      startDate:
        window.startDate,

      endDate:
        window.endDate,

      timezone:
        CALIFORNIA_TIMEZONE,
    },
  };
}

// ============================================================
// BREAK TIMER
//
// HARD GUARANTEE:
//
// elapsedSeconds <= maximum
// remainingSeconds >= 0
// ============================================================

function calculateBreakTimer(
  status,
  startedAt,
  serverNowMs = Date.now()
) {
  if (
    !isBreakStatus(status) ||
    !startedAt
  ) {
    return {
      isBreak: false,
      elapsedSeconds: 0,
      remainingSeconds: 0,
      durationLimitMinutes: 0,
      durationLimitSeconds: 0,
      expired: false,
    };
  }

  const durationLimitMinutes =
    getBreakDurationLimitMinutes(
      status
    );

  const durationLimitSeconds =
    getBreakDurationLimitSeconds(
      status
    );

  const startedMs =
    californiaDateTimeToMs(
      startedAt
    );

  if (startedMs === null) {
    return {
      isBreak: true,
      elapsedSeconds: 0,
      remainingSeconds:
        durationLimitSeconds,
      durationLimitMinutes,
      durationLimitSeconds,
      expired: false,
    };
  }

  const rawElapsedSeconds =
    Math.floor(
      Math.max(
        0,
        serverNowMs - startedMs
      ) / 1000
    );

  const elapsedSeconds =
    Math.min(
      rawElapsedSeconds,
      durationLimitSeconds
    );

  const remainingSeconds =
    Math.max(
      0,
      durationLimitSeconds -
        elapsedSeconds
    );

  return {
    isBreak: true,

    elapsedSeconds,

    remainingSeconds,

    durationLimitMinutes,

    durationLimitSeconds,

    expired:
      rawElapsedSeconds >=
      durationLimitSeconds,
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
// TOTAL BREAK COUNT
//
// IMPORTANT:
//
// NO MORE:
//
// DATE_SUB(now, INTERVAL 24 HOUR)
//
// Instead:
//
// current 8 AM California
// ->
// next 8 AM California
// ============================================================

async function getTotalBreakCount(
  connection,
  userId,
  windowStartDB,
  windowEndDB
) {
  const [rows] =
    await connection.query(
      `
        SELECT COUNT(*) AS count
        FROM user_status_history
        WHERE user_id = ?
          AND status IN (?, ?, ?)
          AND started_at >= ?
          AND started_at < ?
      `,
      [
        userId,
        "Namaz Break",
        "Lunch Break",
        "Short Break",
        windowStartDB,
        windowEndDB,
      ]
    );

  return Number(
    rows?.[0]?.count || 0
  );
}

// ============================================================
// NAMAZ COUNT
// ============================================================

async function getNamazBreakCount(
  connection,
  userId,
  windowStartDB,
  windowEndDB
) {
  const [rows] =
    await connection.query(
      `
        SELECT COUNT(*) AS count
        FROM user_status_history
        WHERE user_id = ?
          AND status = ?
          AND started_at >= ?
          AND started_at < ?
      `,
      [
        userId,
        "Namaz Break",
        windowStartDB,
        windowEndDB,
      ]
    );

  return Number(
    rows?.[0]?.count || 0
  );
}

// ============================================================
// LUNCH COUNT
// ============================================================

async function getLunchBreakCount(
  connection,
  userId,
  windowStartDB,
  windowEndDB
) {
  const [rows] =
    await connection.query(
      `
        SELECT COUNT(*) AS count
        FROM user_status_history
        WHERE user_id = ?
          AND status = ?
          AND started_at >= ?
          AND started_at < ?
      `,
      [
        userId,
        "Lunch Break",
        windowStartDB,
        windowEndDB,
      ]
    );

  return Number(
    rows?.[0]?.count || 0
  );
}

// ============================================================
// SHORT COUNT
// ============================================================

async function getShortBreakCount(
  connection,
  userId,
  windowStartDB,
  windowEndDB
) {
  const [rows] =
    await connection.query(
      `
        SELECT COUNT(*) AS count
        FROM user_status_history
        WHERE user_id = ?
          AND status = ?
          AND started_at >= ?
          AND started_at < ?
      `,
      [
        userId,
        "Short Break",
        windowStartDB,
        windowEndDB,
      ]
    );

  return Number(
    rows?.[0]?.count || 0
  );
}

// ============================================================
// LIMIT INFO
// ============================================================

async function buildLimitInfo(
  connection,
  userId,
  now = new Date()
) {
  const window =
    getBreakWindowInfo(now);

  const [
    total,
    namaz,
    lunch,
    short,
  ] = await Promise.all([
    getTotalBreakCount(
      connection,
      userId,
      window.startDB,
      window.endDB
    ),

    getNamazBreakCount(
      connection,
      userId,
      window.startDB,
      window.endDB
    ),

    getLunchBreakCount(
      connection,
      userId,
      window.startDB,
      window.endDB
    ),

    getShortBreakCount(
      connection,
      userId,
      window.startDB,
      window.endDB
    ),
  ]);

  return {
    window: {
      start:
        window.startDB,

      end:
        window.endDB,

      startDate:
        window.startDate,

      endDate:
        window.endDate,

      timezone:
        CALIFORNIA_TIMEZONE,

      resetAt:
        "08:00 AM California",
    },

    total: {
      used: total,

      max:
        MAX_BREAKS_PER_WINDOW,

      remaining:
        Math.max(
          0,
          MAX_BREAKS_PER_WINDOW -
            total
        ),

      reached:
        total >=
        MAX_BREAKS_PER_WINDOW,
    },

    namaz: {
      used: namaz,

      max:
        MAX_NAMAZ_BREAKS_PER_WINDOW,

      remaining:
        Math.max(
          0,
          MAX_NAMAZ_BREAKS_PER_WINDOW -
            namaz
        ),

      reached:
        namaz >=
        MAX_NAMAZ_BREAKS_PER_WINDOW,
    },

    lunch: {
      used: lunch,

      max:
        MAX_LUNCH_BREAKS_PER_WINDOW,

      remaining:
        Math.max(
          0,
          MAX_LUNCH_BREAKS_PER_WINDOW -
            lunch
        ),

      reached:
        lunch >=
        MAX_LUNCH_BREAKS_PER_WINDOW,
    },

    short: {
      used: short,

      max:
        MAX_SHORT_BREAKS_PER_WINDOW,

      remaining:
        Math.max(
          0,
          MAX_SHORT_BREAKS_PER_WINDOW -
            short
        ),

      reached:
        short >=
        MAX_SHORT_BREAKS_PER_WINDOW,
    },
  };
}

// ============================================================
// SIMPLE USAGE
// ============================================================

function buildBreakUsageFromLimits(
  limits
) {
  return {
    "Short Break":
      Number(
        limits?.short?.used || 0
      ),

    "Lunch Break":
      Number(
        limits?.lunch?.used || 0
      ),

    "Namaz Break":
      Number(
        limits?.namaz?.used || 0
      ),
  };
}

// ============================================================
// CURRENT BREAK INFO
// ============================================================

function buildCurrentBreakInfo(
  user,
  serverNowMs
) {
  if (
    !user ||
    !isBreakStatus(
      user.availability_status
    )
  ) {
    return {
      isBreak: false,
      status: null,
      startedAt: null,
      elapsedSeconds: 0,
      remainingSeconds: 0,
      durationLimitMinutes: 0,
      durationLimitSeconds: 0,
      expired: false,
    };
  }

  const timer =
    calculateBreakTimer(
      user.availability_status,
      user.status_started_at,
      serverNowMs
    );

  return {
    ...timer,

    status:
      user.availability_status,

    startedAt:
      user.status_started_at,
  };
}

// ============================================================
// CLOSE CURRENT OPEN HISTORY
//
// Manual ending:
//
// Start 01:41:18
// End   01:45:18
//
// duration_seconds = 240
//
// NOT 600.
//
// Maximum is ONLY a ceiling.
// ============================================================

async function closeOpenHistory(
  connection,
  userId,
  serverNowMs,
  fallbackEndedAt
) {
  const [openRows] =
    await connection.query(
      `
        SELECT
          id,
          status,
          started_at
        FROM user_status_history
        WHERE user_id = ?
          AND ended_at IS NULL
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
      `,
      [userId]
    );

  const openHistory =
    openRows?.[0];

  if (!openHistory) {
    return {
      closed: false,
      durationSeconds: 0,
      endedAt:
        fallbackEndedAt,
      status: null,
    };
  }

  const startedMs =
    californiaDateTimeToMs(
      openHistory.started_at
    );

  if (startedMs === null) {
    console.error(
      "Invalid started_at:",
      openHistory.started_at
    );

    return {
      closed: false,
      durationSeconds: 0,
      endedAt:
        fallbackEndedAt,
      status:
        openHistory.status,
    };
  }

  // ==========================================================
  // ACTUAL ELAPSED
  // ==========================================================

  const rawElapsedSeconds =
    Math.floor(
      Math.max(
        0,
        serverNowMs -
          startedMs
      ) / 1000
    );

  let durationSeconds =
    Math.max(
      0,
      rawElapsedSeconds
    );

  let endedAt =
    fallbackEndedAt;

  // ==========================================================
  // CONTROLLED BREAK
  // ==========================================================

  if (
    isBreakStatus(
      openHistory.status
    )
  ) {
    const maxSeconds =
      getBreakDurationLimitSeconds(
        openHistory.status
      );

    // HARD MAX
    durationSeconds =
      Math.min(
        durationSeconds,
        maxSeconds
      );

    // ========================================================
    // MAXIMUM REACHED
    // ========================================================

    if (
      rawElapsedSeconds >=
      maxSeconds
    ) {
      durationSeconds =
        maxSeconds;

      endedAt =
        getCaliforniaDBDateTime(
          new Date(
            startedMs +
              maxSeconds *
                1000
          )
        );
    }

    // ========================================================
    // EARLY MANUAL END
    // ========================================================

    else {
      durationSeconds =
        Math.min(
          Math.max(
            0,
            rawElapsedSeconds
          ),
          maxSeconds
        );

      endedAt =
        getCaliforniaDBDateTime(
          new Date(
            serverNowMs
          )
        );
    }
  }

  // ==========================================================
  // NON-BREAK STATUS
  // ==========================================================

  else {
    durationSeconds =
      Math.max(
        0,
        rawElapsedSeconds
      );

    endedAt =
      getCaliforniaDBDateTime(
        new Date(
          serverNowMs
        )
      );
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  await connection.query(
    `
      UPDATE user_status_history
      SET
        ended_at = ?,
        duration_seconds = ?
      WHERE id = ?
      LIMIT 1
    `,
    [
      endedAt,
      durationSeconds,
      openHistory.id,
    ]
  );

  console.log(
    "STATUS HISTORY CLOSED",
    {
      userId,

      historyId:
        openHistory.id,

      status:
        openHistory.status,

      startedAt:
        openHistory.started_at,

      endedAt,

      rawElapsedSeconds,

      savedDurationSeconds:
        durationSeconds,
    }
  );

  return {
    closed: true,

    durationSeconds,

    endedAt,

    status:
      openHistory.status,
  };
}

// ============================================================
// AUTO EXPIRE BREAK
// ============================================================

async function autoExpireBreak(
  user,
  serverNowMs
) {
  if (
    !user ||
    !isBreakStatus(
      user.availability_status
    ) ||
    !user.status_started_at
  ) {
    return {
      expired: false,
      user,
    };
  }

  const timer =
    calculateBreakTimer(
      user.availability_status,
      user.status_started_at,
      serverNowMs
    );

  if (!timer.expired) {
    return {
      expired: false,
      user,
    };
  }

  const status =
    user.availability_status;

  const limitSeconds =
    getBreakDurationLimitSeconds(
      status
    );

  const startedMs =
    californiaDateTimeToMs(
      user.status_started_at
    );

  if (startedMs === null) {
    return {
      expired: false,
      user,
    };
  }

  const expiryMs =
    startedMs +
    limitSeconds *
      1000;

  const exactEndedAt =
    getCaliforniaDBDateTime(
      new Date(expiryMs)
    );

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ========================================================
    // LOCK USER
    // ========================================================

    const [lockedUsers] =
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
          FOR UPDATE
        `,
        [user.id]
      );

    const lockedUser =
      lockedUsers?.[0];

    if (!lockedUser) {
      await connection.rollback();

      return {
        expired: false,
        user,
      };
    }

    // ========================================================
    // STATUS CHANGED
    // ========================================================

    if (
      lockedUser.availability_status !==
        status ||
      String(
        lockedUser.status_started_at ||
          ""
      ) !==
        String(
          user.status_started_at ||
            ""
        )
    ) {
      await connection.rollback();

      return {
        expired: false,
        user: lockedUser,
      };
    }

    // ========================================================
    // LOCK OPEN HISTORY
    // ========================================================

    const [historyRows] =
      await connection.query(
        `
          SELECT
            id,
            status,
            started_at
          FROM user_status_history
          WHERE user_id = ?
            AND status = ?
            AND ended_at IS NULL
          ORDER BY id DESC
          LIMIT 1
          FOR UPDATE
        `,
        [
          user.id,
          status,
        ]
      );

    const history =
      historyRows?.[0];

    if (history) {
      await connection.query(
        `
          UPDATE user_status_history
          SET
            ended_at = ?,
            duration_seconds = ?
          WHERE id = ?
          LIMIT 1
        `,
        [
          exactEndedAt,
          limitSeconds,
          history.id,
        ]
      );
    }

    // ========================================================
    // RESET USER TO ACTIVE
    // ========================================================

    await connection.query(
      `
        UPDATE users
        SET
          availability_status = ?,
          status_started_at = NULL
        WHERE id = ?
        LIMIT 1
      `,
      [
        "Active",
        user.id,
      ]
    );

    await connection.commit();

    const updatedUser =
      await getUserById(
        pool,
        user.id
      );

    return {
      expired: true,

      user:
        updatedUser,

      expiredStatus:
        status,

      durationSeconds:
        limitSeconds,

      endedAt:
        exactEndedAt,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error(
      "autoExpireBreak error:",
      error
    );

    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================
// RESPONSE BUILDER
// ============================================================

function buildResponseData({
  user,
  limits,
  timer,
  time,
  autoExpired = false,
  autoExpiredStatus = null,
  autoExpiredDurationSeconds = null,
  autoExpiredEndedAt = null,
}) {
  return {
    success: true,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },

    status:
      user.availability_status ||
      "Active",

    status_started_at:
      user.status_started_at,

    // ========================================================
    // BREAK USAGE
    // ========================================================

    break_usage:
      buildBreakUsageFromLimits(
        limits
      ),

    breakUsage:
      buildBreakUsageFromLimits(
        limits
      ),

    usage:
      buildBreakUsageFromLimits(
        limits
      ),

    // ========================================================
    // LIMITS
    // ========================================================

    limits,

    // ========================================================
    // TIMER
    // ========================================================

    timer,

    elapsedSeconds:
      timer?.elapsedSeconds || 0,

    remainingSeconds:
      timer?.remainingSeconds || 0,

    durationLimitMinutes:
      timer?.durationLimitMinutes || 0,

    durationLimitSeconds:
      timer?.durationLimitSeconds || 0,

    // ========================================================
    // BREAK CONFIG
    // ========================================================

    breakDurationLimits:
      BREAK_DURATION_LIMITS_MINUTES,

    // ========================================================
    // BREAK WINDOW
    // ========================================================

    breakWindow: {
      resetTime:
        "08:00 AM",

      timezone:
        CALIFORNIA_TIMEZONE,

      currentWindowStart:
        limits?.window?.start || null,

      currentWindowEnd:
        limits?.window?.end || null,

      description:
        "Every break limit resets at 8:00 AM California time.",
    },

    // ========================================================
    // BREAK TIME RULES
    // ========================================================

    breakTimeRules: {
      allowed:
        isBreakAllowedAtCaliforniaTime(),

      blockedFrom:
        "08:00 AM",

      blockedUntil:
        "09:00 AM",

      allowedFrom:
        "09:00 AM",

      timezone:
        CALIFORNIA_TIMEZONE,
    },

    // ========================================================
    // AUTO EXPIRY
    // ========================================================

    autoExpired,

    autoExpiredStatus,

    autoExpiredDurationSeconds,

    autoExpiredEndedAt,

    // ========================================================
    // SERVER CLOCK
    // ========================================================

    serverClock: {
      nowMs:
        Date.now(),

      iso:
        new Date().toISOString(),

      californiaDate:
        time.californiaDate,

      californiaNow:
        time.californiaNow,

      californiaDisplayTime:
        time.californiaDisplayTime,

      californiaHour:
        time.californiaHour,

      californiaMinute:
        time.californiaMinute,

      californiaSecond:
        time.californiaSecond,

      breakWindow:
        time.breakWindow,
    },
  };
}

// ============================================================
// GET
// ============================================================

export async function GET(request) {
  try {
    const userId =
      getUserIdFromToken(
        request
      );

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const time =
      getTimeInfo();

    let user =
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
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // AUTO EXPIRE
    // ========================================================

    const autoExpired =
      await autoExpireBreak(
        user,
        time.serverNowMs
      );

    if (
      autoExpired.expired
    ) {
      user =
        autoExpired.user;
    }

    // ========================================================
    // LIMITS
    // ========================================================

    const connection =
      await pool.getConnection();

    let limits;

    try {
      limits =
        await buildLimitInfo(
          connection,
          userId,
          new Date()
        );
    } finally {
      connection.release();
    }

    // ========================================================
    // TIMER
    // ========================================================

    const timer =
      buildCurrentBreakInfo(
        user,
        Date.now()
      );

    return NextResponse.json(
      buildResponseData({
        user,

        limits,

        timer,

        time,

        autoExpired:
          autoExpired.expired,

        autoExpiredStatus:
          autoExpired.expired
            ? autoExpired.expiredStatus
            : null,

        autoExpiredDurationSeconds:
          autoExpired.expired
            ? autoExpired.durationSeconds
            : null,

        autoExpiredEndedAt:
          autoExpired.expired
            ? autoExpired.endedAt
            : null,
      }),
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/users/status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to get user status",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PUT
// ============================================================

export async function PUT(request) {
  let connection = null;

  try {
    const userId =
      getUserIdFromToken(
        request
      );

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const requestedStatus =
      String(
        body?.status || ""
      ).trim();

    // ========================================================
    // VALIDATE STATUS
    // ========================================================

    if (
      !ALLOWED_STATUSES.includes(
        requestedStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status",
        },
        {
          status: 400,
        }
      );
    }

    const now =
      new Date();

    const serverNowMs =
      now.getTime();

    const californiaNow =
      getCaliforniaDBDateTime(
        now
      );

    // ========================================================
    // BREAK TIME RESTRICTION
    //
    // Only NEW break starts are blocked.
    //
    // Ending current break is always allowed.
    // ========================================================

    if (
      isBreakStatus(
        requestedStatus
      ) &&
      !isBreakAllowedAtCaliforniaTime(
        now
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          code:
            "BREAK_TIME_RESTRICTED",

          message:
            getBreakRestrictionMessage(
              now
            ),

          breakAllowed:
            false,

          breakTimeRules: {
            timezone:
              CALIFORNIA_TIMEZONE,

            blockedFrom:
              "08:00 AM",

            blockedUntil:
              "09:00 AM",

            allowedFrom:
              "09:00 AM",
          },

          serverClock: {
            californiaNow,

            californiaDisplayTime:
              getCaliforniaDisplayTime(
                now
              ),
          },
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // CONNECTION
    // ========================================================

    connection =
      await pool.getConnection();

    await connection.beginTransaction();

    // ========================================================
    // LOCK USER
    // ========================================================

    const [userRows] =
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
          FOR UPDATE
        `,
        [userId]
      );

    let user =
      userRows?.[0];

    if (!user) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const currentStatus =
      user.availability_status ||
      "Active";

    // ========================================================
    // SAME STATUS
    // ========================================================

    if (
      currentStatus ===
      requestedStatus
    ) {
      const limits =
        await buildLimitInfo(
          connection,
          userId,
          now
        );

      const timer =
        buildCurrentBreakInfo(
          user,
          serverNowMs
        );

      await connection.commit();

      return NextResponse.json(
        buildResponseData({
          user,

          limits,

          timer,

          time:
            getTimeInfo(),
        }),
        {
          status: 200,

          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // ========================================================
    // NEW BREAK
    // ========================================================

    if (
      isBreakStatus(
        requestedStatus
      )
    ) {
      const window =
        getBreakWindowInfo(
          now
        );

      // ======================================================
      // TOTAL LIMIT
      // ======================================================

      const totalBreakCount =
        await getTotalBreakCount(
          connection,
          userId,
          window.startDB,
          window.endDB
        );

      if (
        totalBreakCount >=
        MAX_BREAKS_PER_WINDOW
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,

            code:
              "TOTAL_BREAK_LIMIT_REACHED",

            message:
              `Maximum ${MAX_BREAKS_PER_WINDOW} breaks are allowed from 8:00 AM to next day 8:00 AM California time.`,

            limits: {
              totalUsed:
                totalBreakCount,

              totalMax:
                MAX_BREAKS_PER_WINDOW,

              windowStart:
                window.startDB,

              windowEnd:
                window.endDB,

              timezone:
                CALIFORNIA_TIMEZONE,
            },
          },
          {
            status: 403,
          }
        );
      }

      // ======================================================
      // SPECIFIC LIMIT
      // ======================================================

      let specificCount = 0;
      let specificMax = 0;

      if (
        requestedStatus ===
        "Namaz Break"
      ) {
        specificCount =
          await getNamazBreakCount(
            connection,
            userId,
            window.startDB,
            window.endDB
          );

        specificMax =
          MAX_NAMAZ_BREAKS_PER_WINDOW;
      }

      if (
        requestedStatus ===
        "Lunch Break"
      ) {
        specificCount =
          await getLunchBreakCount(
            connection,
            userId,
            window.startDB,
            window.endDB
          );

        specificMax =
          MAX_LUNCH_BREAKS_PER_WINDOW;
      }

      if (
        requestedStatus ===
        "Short Break"
      ) {
        specificCount =
          await getShortBreakCount(
            connection,
            userId,
            window.startDB,
            window.endDB
          );

        specificMax =
          MAX_SHORT_BREAKS_PER_WINDOW;
      }

      if (
        specificCount >=
        specificMax
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,

            code:
              "SPECIFIC_BREAK_LIMIT_REACHED",

            message:
              `${requestedStatus} limit of ${specificMax} from 8:00 AM to next day 8:00 AM California time has been reached.`,

            status:
              requestedStatus,

            used:
              specificCount,

            max:
              specificMax,

            window: {
              start:
                window.startDB,

              end:
                window.endDB,

              timezone:
                CALIFORNIA_TIMEZONE,
            },
          },
          {
            status: 403,
          }
        );
      }
    }

    // ========================================================
    // CLOSE CURRENT OPEN HISTORY
    //
    // Example:
    //
    // Short Break:
    //
    // Start = 01:41:18
    // End   = 01:45:18
    //
    // duration_seconds = 240
    // ========================================================

    if (
      currentStatus !==
        "Active" &&
      user.status_started_at
    ) {
      await closeOpenHistory(
        connection,
        userId,
        serverNowMs,
        californiaNow
      );
    }

    // ========================================================
    // SET ACTIVE
    // ========================================================

    if (
      requestedStatus ===
      "Active"
    ) {
      await connection.query(
        `
          UPDATE users
          SET
            availability_status = ?,
            status_started_at = NULL
          WHERE id = ?
          LIMIT 1
        `,
        [
          "Active",
          userId,
        ]
      );
    }

    // ========================================================
    // START NEW STATUS / BREAK
    // ========================================================

    else {
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
            0
          )
        `,
        [
          userId,
          requestedStatus,
          californiaNow,
        ]
      );

      await connection.query(
        `
          UPDATE users
          SET
            availability_status = ?,
            status_started_at = ?
          WHERE id = ?
          LIMIT 1
        `,
        [
          requestedStatus,
          californiaNow,
          userId,
        ]
      );
    }

    // ========================================================
    // GET UPDATED USER
    // ========================================================

    const [updatedRows] =
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
        `,
        [userId]
      );

    user =
      updatedRows?.[0];

    // ========================================================
    // UPDATED LIMITS
    // ========================================================

    const limits =
      await buildLimitInfo(
        connection,
        userId,
        now
      );

    // ========================================================
    // UPDATED TIMER
    // ========================================================

    const timer =
      buildCurrentBreakInfo(
        user,
        serverNowMs
      );

    await connection.commit();

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      buildResponseData({
        user,

        limits,

        timer,

        time:
          getTimeInfo(),
      }),
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error(
      "PUT /api/users/status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to update user status",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
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

