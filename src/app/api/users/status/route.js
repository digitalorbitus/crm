// app/api/users/status/route.js
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
const BREAK_STATUSES = ["Namaz Break", "Lunch Break", "Short Break"];

const BREAK_KEYS = {
  "Namaz Break": "namaz",
  "Lunch Break": "lunch",
  "Short Break": "short",
};

// ============================================================
// BREAK LIMITS
//
// ONE break window = 08:00 AM California -> next day 08:00 AM.
//
// ADMIN RESET:
// If an admin resets the limit (one user or everyone), only breaks
// that started AFTER the latest reset inside the current window are
// counted. History is never deleted.
// ============================================================

const MAX_BREAKS_PER_WINDOW = 5;
const MAX_NAMAZ_BREAKS_PER_WINDOW = 1;
const MAX_LUNCH_BREAKS_PER_WINDOW = 1;
const MAX_SHORT_BREAKS_PER_WINDOW = 3;

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
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing");
      return null;
    }

    const decoded = jwt.verify(token, secret);

    const id =
      decoded?.id ?? decoded?.userId ?? decoded?.user_id ?? decoded?.sub;

    if (id === undefined || id === null || id === "") return null;

    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) return null;

    return numericId;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

// ============================================================
// CALIFORNIA TIME HELPERS
// ============================================================

function getCaliforniaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") result[part.type] = part.value;
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

function formatDate(year, month, day) {
  return (
    `${String(year).padStart(4, "0")}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`
  );
}

function getCaliforniaDate(date = new Date()) {
  const p = getCaliforniaParts(date);
  return formatDate(p.year, p.month, p.day);
}

// California wall-clock -> real JS Date (DST safe)
function californiaWallClockToDate(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0
) {
  const desiredWallAsUTC = Date.UTC(year, month - 1, day, hour, minute, second);

  let guess = desiredWallAsUTC;

  for (let i = 0; i < 10; i++) {
    const p = getCaliforniaParts(new Date(guess));

    const actualWallAsUTC = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second
    );

    const difference = desiredWallAsUTC - actualWallAsUTC;

    if (difference === 0) break;

    guess += difference;
  }

  return new Date(guess);
}

// California wall-clock string for MySQL: 2026-10-07 08:15:30
function getCaliforniaDBDateTime(date = new Date()) {
  const p = getCaliforniaParts(date);

  return (
    `${String(p.year).padStart(4, "0")}-` +
    `${String(p.month).padStart(2, "0")}-` +
    `${String(p.day).padStart(2, "0")} ` +
    `${String(p.hour).padStart(2, "0")}:` +
    `${String(p.minute).padStart(2, "0")}:` +
    `${String(p.second).padStart(2, "0")}`
  );
}

function getCaliforniaDisplayTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

// Real UTC instant -> MySQL UTC string (used by break_limit_resets)
function toMySQLUtc(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// MySQL UTC string -> ms
function mysqlUtcToMs(value) {
  if (!value) return null;

  const raw = String(value).trim().replace(" ", "T");
  const ms = Date.parse(`${raw}Z`);

  return Number.isFinite(ms) ? ms : null;
}

function shiftCalendarDate(year, month, day, days) {
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + days);

  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

// ============================================================
// BREAK WINDOW (08:00 AM CA -> next 08:00 AM CA)
// ============================================================

function getBreakWindowInfo(date = new Date()) {
  const parts = getCaliforniaParts(date);

  let startDate = { year: parts.year, month: parts.month, day: parts.day };

  if (parts.hour < 8) {
    startDate = shiftCalendarDate(parts.year, parts.month, parts.day, -1);
  }

  const endDate = shiftCalendarDate(
    startDate.year,
    startDate.month,
    startDate.day,
    1
  );

  const startDateObject = californiaWallClockToDate(
    startDate.year,
    startDate.month,
    startDate.day,
    8,
    0,
    0
  );

  const endDateObject = californiaWallClockToDate(
    endDate.year,
    endDate.month,
    endDate.day,
    8,
    0,
    0
  );

  const startDB = getCaliforniaDBDateTime(startDateObject);
  const endDB = getCaliforniaDBDateTime(endDateObject);

  return {
    startDate: formatDate(startDate.year, startDate.month, startDate.day),
    endDate: formatDate(endDate.year, endDate.month, endDate.day),
    startDB,
    endDB,
    startMs: startDateObject.getTime(),
    endMs: endDateObject.getTime(),
    timezone: CALIFORNIA_TIMEZONE,
    label: `${startDB} → ${endDB}`,
  };
}

// 12:00-7:59 AM allowed, 8:00-8:59 AM BLOCKED, 9:00 AM+ allowed.
// Only NEW break starts are blocked.
function isBreakAllowedAtCaliforniaTime(date = new Date()) {
  const p = getCaliforniaParts(date);
  const totalMinutes = p.hour * 60 + p.minute;

  return !(totalMinutes >= 8 * 60 && totalMinutes < 9 * 60);
}

function getBreakRestrictionMessage(date = new Date()) {
  const p = getCaliforniaParts(date);

  const currentTime =
    `${String(p.hour).padStart(2, "0")}:` +
    `${String(p.minute).padStart(2, "0")}:` +
    `${String(p.second).padStart(2, "0")}`;

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

function getBreakDurationLimitMinutes(status) {
  return BREAK_DURATION_LIMITS_MINUTES[status] || 0;
}

function getBreakDurationLimitSeconds(status) {
  return getBreakDurationLimitMinutes(status) * 60;
}

// MySQL DATETIME (California wall-clock) -> real timestamp (ms)
function californiaDateTimeToMs(value) {
  if (value === null || value === undefined) return null;

  try {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;

      return californiaWallClockToDate(
        value.getFullYear(),
        value.getMonth() + 1,
        value.getDate(),
        value.getHours(),
        value.getMinutes(),
        value.getSeconds()
      ).getTime();
    }

    let text = String(value).trim();
    if (!text) return null;

    text = text.replace("T", " ").replace(/\.\d{1,6}$/, "");

    const match = text.match(
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
    );

    if (!match) {
      console.error("Invalid California DATETIME:", value);
      return null;
    }

    const [year, month, day, hour, minute, second] = match
      .slice(1)
      .map(Number);

    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hour > 23 ||
      minute > 59 ||
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
    console.error("californiaDateTimeToMs error:", error);
    return null;
  }
}

function getTimeInfo() {
  const now = new Date();
  const parts = getCaliforniaParts(now);
  const window = getBreakWindowInfo(now);

  return {
    serverNowMs: now.getTime(),
    californiaDate: getCaliforniaDate(now),
    californiaNow: getCaliforniaDBDateTime(now),
    californiaDisplayTime: getCaliforniaDisplayTime(now),
    californiaHour: parts.hour,
    californiaMinute: parts.minute,
    californiaSecond: parts.second,
    iso: now.toISOString(),
    breakWindow: {
      start: window.startDB,
      end: window.endDB,
      startDate: window.startDate,
      endDate: window.endDate,
      timezone: CALIFORNIA_TIMEZONE,
    },
  };
}

// ============================================================
// BREAK TIMER (elapsed never exceeds the maximum)
// ============================================================

function calculateBreakTimer(status, startedAt, serverNowMs = Date.now()) {
  if (!isBreakStatus(status) || !startedAt) {
    return {
      isBreak: false,
      elapsedSeconds: 0,
      remainingSeconds: 0,
      durationLimitMinutes: 0,
      durationLimitSeconds: 0,
      expired: false,
    };
  }

  const durationLimitMinutes = getBreakDurationLimitMinutes(status);
  const durationLimitSeconds = getBreakDurationLimitSeconds(status);

  const startedMs = californiaDateTimeToMs(startedAt);

  if (startedMs === null) {
    return {
      isBreak: true,
      elapsedSeconds: 0,
      remainingSeconds: durationLimitSeconds,
      durationLimitMinutes,
      durationLimitSeconds,
      expired: false,
    };
  }

  const rawElapsedSeconds = Math.floor(
    Math.max(0, serverNowMs - startedMs) / 1000
  );

  const elapsedSeconds = Math.min(rawElapsedSeconds, durationLimitSeconds);

  return {
    isBreak: true,
    elapsedSeconds,
    remainingSeconds: Math.max(0, durationLimitSeconds - elapsedSeconds),
    durationLimitMinutes,
    durationLimitSeconds,
    expired: rawElapsedSeconds >= durationLimitSeconds,
  };
}

// ============================================================
// USER
// ============================================================

async function getUserById(connectionOrPool, userId) {
  const [rows] = await connectionOrPool.query(
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
// ADMIN RESET -> EFFECTIVE WINDOW START
//
// break_limit_resets.reset_at is stored in UTC.
// user_status_history.started_at is California wall-clock.
// So the reset time is converted to California wall-clock
// before it is used as the counting start.
// ============================================================

async function getEffectiveWindowStart(connection, userId, window) {
  const fallback = { startDB: window.startDB, resetAt: null };

  try {
    const windowStartUtc = toMySQLUtc(new Date(window.startMs));

    const [rows] = await connection.query(
      `
        SELECT
          DATE_FORMAT(reset_at, '%Y-%m-%d %H:%i:%s') AS reset_at_raw
        FROM break_limit_resets
        WHERE (user_id = ? OR user_id IS NULL)
          AND reset_at >= ?
        ORDER BY reset_at DESC, id DESC
        LIMIT 1
      `,
      [userId, windowStartUtc]
    );

    const raw = rows?.[0]?.reset_at_raw;

    if (!raw) return fallback;

    const resetMs = mysqlUtcToMs(raw);

    if (resetMs === null) return fallback;

    return {
      startDB: getCaliforniaDBDateTime(new Date(resetMs)),
      resetAt: new Date(resetMs).toISOString(),
    };
  } catch (error) {
    // Table may not exist yet (no reset has ever been made).
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return fallback;
    }

    throw error;
  }
}

// ============================================================
// BREAK COUNTS (one query)
// ============================================================

async function getBreakCounts(connection, userId, fromDB, toDB) {
  const [rows] = await connection.query(
    `
      SELECT status, COUNT(*) AS total
      FROM user_status_history
      WHERE user_id = ?
        AND status IN (?, ?, ?)
        AND started_at >= ?
        AND started_at < ?
      GROUP BY status
    `,
    [userId, "Namaz Break", "Lunch Break", "Short Break", fromDB, toDB]
  );

  const counts = { namaz: 0, lunch: 0, short: 0 };

  for (const row of rows || []) {
    const key = BREAK_KEYS[row.status];
    if (key) counts[key] = Number(row.total || 0);
  }

  return counts;
}

function buildCounter(used, max) {
  return {
    used,
    max,
    remaining: Math.max(0, max - used),
    reached: used >= max,
  };
}

async function buildLimitInfo(connection, userId, now = new Date()) {
  const window = getBreakWindowInfo(now);

  const effective = await getEffectiveWindowStart(connection, userId, window);

  const counts = await getBreakCounts(
    connection,
    userId,
    effective.startDB,
    window.endDB
  );

  const total = counts.namaz + counts.lunch + counts.short;

  return {
    window: {
      start: window.startDB,
      end: window.endDB,
      startDate: window.startDate,
      endDate: window.endDate,
      timezone: CALIFORNIA_TIMEZONE,
      resetAt: "08:00 AM California",
      adminResetAt: effective.resetAt,
      countingFrom: effective.startDB,
    },
    total: buildCounter(total, MAX_BREAKS_PER_WINDOW),
    namaz: buildCounter(counts.namaz, MAX_NAMAZ_BREAKS_PER_WINDOW),
    lunch: buildCounter(counts.lunch, MAX_LUNCH_BREAKS_PER_WINDOW),
    short: buildCounter(counts.short, MAX_SHORT_BREAKS_PER_WINDOW),
  };
}

function buildBreakUsageFromLimits(limits) {
  return {
    "Short Break": Number(limits?.short?.used || 0),
    "Lunch Break": Number(limits?.lunch?.used || 0),
    "Namaz Break": Number(limits?.namaz?.used || 0),
  };
}

// ============================================================
// CURRENT BREAK INFO
// ============================================================

function buildCurrentBreakInfo(user, serverNowMs) {
  if (!user || !isBreakStatus(user.availability_status)) {
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

  const timer = calculateBreakTimer(
    user.availability_status,
    user.status_started_at,
    serverNowMs
  );

  return {
    ...timer,
    status: user.availability_status,
    startedAt: user.status_started_at,
  };
}

// ============================================================
// CLOSE CURRENT OPEN HISTORY
//
// Manual end: duration = real elapsed time (capped at the maximum).
// ============================================================

async function closeOpenHistory(
  connection,
  userId,
  serverNowMs,
  fallbackEndedAt
) {
  const [openRows] = await connection.query(
    `
      SELECT id, status, started_at
      FROM user_status_history
      WHERE user_id = ?
        AND ended_at IS NULL
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `,
    [userId]
  );

  const openHistory = openRows?.[0];

  if (!openHistory) {
    return {
      closed: false,
      durationSeconds: 0,
      endedAt: fallbackEndedAt,
      status: null,
    };
  }

  const startedMs = californiaDateTimeToMs(openHistory.started_at);

  if (startedMs === null) {
    console.error("Invalid started_at:", openHistory.started_at);

    return {
      closed: false,
      durationSeconds: 0,
      endedAt: fallbackEndedAt,
      status: openHistory.status,
    };
  }

  const rawElapsedSeconds = Math.floor(
    Math.max(0, serverNowMs - startedMs) / 1000
  );

  let durationSeconds = rawElapsedSeconds;
  let endedAt = getCaliforniaDBDateTime(new Date(serverNowMs));

  if (isBreakStatus(openHistory.status)) {
    const maxSeconds = getBreakDurationLimitSeconds(openHistory.status);

    if (rawElapsedSeconds >= maxSeconds) {
      durationSeconds = maxSeconds;
      endedAt = getCaliforniaDBDateTime(
        new Date(startedMs + maxSeconds * 1000)
      );
    } else {
      durationSeconds = rawElapsedSeconds;
    }
  }

  await connection.query(
    `
      UPDATE user_status_history
      SET
        ended_at = ?,
        duration_seconds = ?
      WHERE id = ?
      LIMIT 1
    `,
    [endedAt, durationSeconds, openHistory.id]
  );

  return {
    closed: true,
    durationSeconds,
    endedAt,
    status: openHistory.status,
  };
}

// ============================================================
// AUTO EXPIRE BREAK
// ============================================================

async function autoExpireBreak(user, serverNowMs) {
  if (
    !user ||
    !isBreakStatus(user.availability_status) ||
    !user.status_started_at
  ) {
    return { expired: false, user };
  }

  const timer = calculateBreakTimer(
    user.availability_status,
    user.status_started_at,
    serverNowMs
  );

  if (!timer.expired) return { expired: false, user };

  const status = user.availability_status;
  const limitSeconds = getBreakDurationLimitSeconds(status);
  const startedMs = californiaDateTimeToMs(user.status_started_at);

  if (startedMs === null) return { expired: false, user };

  const exactEndedAt = getCaliforniaDBDateTime(
    new Date(startedMs + limitSeconds * 1000)
  );

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [lockedUsers] = await connection.query(
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

    const lockedUser = lockedUsers?.[0];

    if (!lockedUser) {
      await connection.rollback();
      return { expired: false, user };
    }

    if (
      lockedUser.availability_status !== status ||
      String(lockedUser.status_started_at || "") !==
        String(user.status_started_at || "")
    ) {
      await connection.rollback();
      return { expired: false, user: lockedUser };
    }

    const [historyRows] = await connection.query(
      `
        SELECT id
        FROM user_status_history
        WHERE user_id = ?
          AND status = ?
          AND ended_at IS NULL
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
      `,
      [user.id, status]
    );

    const history = historyRows?.[0];

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
        [exactEndedAt, limitSeconds, history.id]
      );
    }

    await connection.query(
      `
        UPDATE users
        SET
          availability_status = ?,
          status_started_at = NULL
        WHERE id = ?
        LIMIT 1
      `,
      ["Active", user.id]
    );

    await connection.commit();

    const updatedUser = await getUserById(pool, user.id);

    return {
      expired: true,
      user: updatedUser,
      expiredStatus: status,
      durationSeconds: limitSeconds,
      endedAt: exactEndedAt,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error("autoExpireBreak error:", error);
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
  const usage = buildBreakUsageFromLimits(limits);

  return {
    success: true,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },

    status: user.availability_status || "Active",
    status_started_at: user.status_started_at,

    // BREAK USAGE (TopBar reads any of these keys)
    break_usage: usage,
    breakUsage: usage,
    usage,

    limits,

    timer,
    elapsedSeconds: timer?.elapsedSeconds || 0,
    remainingSeconds: timer?.remainingSeconds || 0,
    durationLimitMinutes: timer?.durationLimitMinutes || 0,
    durationLimitSeconds: timer?.durationLimitSeconds || 0,

    breakDurationLimits: BREAK_DURATION_LIMITS_MINUTES,

    breakWindow: {
      resetTime: "08:00 AM",
      timezone: CALIFORNIA_TIMEZONE,
      currentWindowStart: limits?.window?.start || null,
      currentWindowEnd: limits?.window?.end || null,
      adminResetAt: limits?.window?.adminResetAt || null,
      description:
        "Every break limit resets at 8:00 AM California time, or when an admin resets it.",
    },

    breakTimeRules: {
      allowed: isBreakAllowedAtCaliforniaTime(),
      blockedFrom: "08:00 AM",
      blockedUntil: "09:00 AM",
      allowedFrom: "09:00 AM",
      timezone: CALIFORNIA_TIMEZONE,
    },

    autoExpired,
    autoExpiredStatus,
    autoExpiredDurationSeconds,
    autoExpiredEndedAt,

    serverClock: {
      nowMs: Date.now(),
      iso: new Date().toISOString(),
      californiaDate: time.californiaDate,
      californiaNow: time.californiaNow,
      californiaDisplayTime: time.californiaDisplayTime,
      californiaHour: time.californiaHour,
      californiaMinute: time.californiaMinute,
      californiaSecond: time.californiaSecond,
      breakWindow: time.breakWindow,
    },
  };
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// ============================================================
// GET
// ============================================================

export async function GET(request) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const time = getTimeInfo();

    let user = await getUserById(pool, userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const autoExpired = await autoExpireBreak(user, time.serverNowMs);

    if (autoExpired.expired) {
      user = autoExpired.user;
    }

    const connection = await pool.getConnection();

    let limits;

    try {
      limits = await buildLimitInfo(connection, userId, new Date());
    } finally {
      connection.release();
    }

    const timer = buildCurrentBreakInfo(user, Date.now());

    return NextResponse.json(
      buildResponseData({
        user,
        limits,
        timer,
        time,
        autoExpired: autoExpired.expired,
        autoExpiredStatus: autoExpired.expired
          ? autoExpired.expiredStatus
          : null,
        autoExpiredDurationSeconds: autoExpired.expired
          ? autoExpired.durationSeconds
          : null,
        autoExpiredEndedAt: autoExpired.expired ? autoExpired.endedAt : null,
      }),
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/users/status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT
// ============================================================

export async function PUT(request) {
  let connection = null;

  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const requestedStatus = String(body?.status || "").trim();

    if (!ALLOWED_STATUSES.includes(requestedStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const now = new Date();
    const serverNowMs = now.getTime();
    const californiaNow = getCaliforniaDBDateTime(now);

    // 8-9 AM block: only NEW break starts. Ending a break is always allowed.
    if (isBreakStatus(requestedStatus) && !isBreakAllowedAtCaliforniaTime(now)) {
      return NextResponse.json(
        {
          success: false,
          code: "BREAK_TIME_RESTRICTED",
          message: getBreakRestrictionMessage(now),
          breakAllowed: false,
          breakTimeRules: {
            timezone: CALIFORNIA_TIMEZONE,
            blockedFrom: "08:00 AM",
            blockedUntil: "09:00 AM",
            allowedFrom: "09:00 AM",
          },
          serverClock: {
            californiaNow,
            californiaDisplayTime: getCaliforniaDisplayTime(now),
          },
        },
        { status: 403 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [userRows] = await connection.query(
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

    let user = userRows?.[0];

    if (!user) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentStatus = user.availability_status || "Active";

    // ------------------------------------------------------
    // SAME STATUS
    // ------------------------------------------------------

    if (currentStatus === requestedStatus) {
      const limits = await buildLimitInfo(connection, userId, now);
      const timer = buildCurrentBreakInfo(user, serverNowMs);

      await connection.commit();

      return NextResponse.json(
        buildResponseData({ user, limits, timer, time: getTimeInfo() }),
        { status: 200, headers: NO_CACHE_HEADERS }
      );
    }

    // ------------------------------------------------------
    // NEW BREAK: LIMIT CHECK (includes admin reset + admin added breaks)
    // ------------------------------------------------------

    if (isBreakStatus(requestedStatus)) {
      const limits = await buildLimitInfo(connection, userId, now);

      if (limits.total.reached) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            code: "TOTAL_BREAK_LIMIT_REACHED",
            message: `Maximum ${MAX_BREAKS_PER_WINDOW} breaks are allowed from 8:00 AM to next day 8:00 AM California time.`,
            break_usage: buildBreakUsageFromLimits(limits),
            limits,
          },
          { status: 403 }
        );
      }

      const key = BREAK_KEYS[requestedStatus];
      const specific = limits[key];

      if (specific.reached) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            code: "SPECIFIC_BREAK_LIMIT_REACHED",
            message: `${requestedStatus} limit of ${specific.max} from 8:00 AM to next day 8:00 AM California time has been reached.`,
            status: requestedStatus,
            used: specific.used,
            max: specific.max,
            break_usage: buildBreakUsageFromLimits(limits),
            limits,
          },
          { status: 403 }
        );
      }
    }

    // ------------------------------------------------------
    // CLOSE CURRENT OPEN HISTORY
    // ------------------------------------------------------

    if (currentStatus !== "Active" && user.status_started_at) {
      await closeOpenHistory(connection, userId, serverNowMs, californiaNow);
    }

    // ------------------------------------------------------
    // SET ACTIVE
    // ------------------------------------------------------

    if (requestedStatus === "Active") {
      await connection.query(
        `
          UPDATE users
          SET
            availability_status = ?,
            status_started_at = NULL
          WHERE id = ?
          LIMIT 1
        `,
        ["Active", userId]
      );
    }

    // ------------------------------------------------------
    // START NEW STATUS / BREAK
    // ------------------------------------------------------

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
          VALUES (?, ?, ?, NULL, 0)
        `,
        [userId, requestedStatus, californiaNow]
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
        [requestedStatus, californiaNow, userId]
      );
    }

    const [updatedRows] = await connection.query(
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

    user = updatedRows?.[0];

    const limits = await buildLimitInfo(connection, userId, now);
    const timer = buildCurrentBreakInfo(user, serverNowMs);

    await connection.commit();

    return NextResponse.json(
      buildResponseData({ user, limits, timer, time: getTimeInfo() }),
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error("PUT /api/users/status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
