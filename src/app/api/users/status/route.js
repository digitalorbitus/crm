
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

const BREAK_STATUSES = [
  "Namaz Break",
  "Lunch Break",
  "Short Break",
];

const BREAK_KEYS = {
  "Namaz Break": "namaz",
  "Lunch Break": "lunch",
  "Short Break": "short",
};

const BREAK_DURATION_LIMITS_MINUTES = {
  "Namaz Break": 15,
  "Lunch Break": 30,
  "Short Break": 10,
};

const MAX_BREAKS_PER_WINDOW = 5;
const MAX_NAMAZ_BREAKS_PER_WINDOW = 1;
const MAX_LUNCH_BREAKS_PER_WINDOW = 1;
const MAX_SHORT_BREAKS_PER_WINDOW = 3;
const MAX_ADMIN_LIMIT_SECONDS = 12 * 60 * 60;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const USER_COLUMNS = `
  id,
  name,
  email,
  role,
  availability_status,
  DATE_FORMAT(status_started_at, '%Y-%m-%d %H:%i:%s') AS status_started_at
`;

// ============================================================
// AUTHENTICATION
// ============================================================

function getUserIdFromToken(request) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) return null;

    const decoded = jwt.verify(token, secret);
    const id =
      decoded?.id ??
      decoded?.userId ??
      decoded?.user_id ??
      decoded?.sub;

    const numericId = Number(id);

    return Number.isSafeInteger(numericId) && numericId > 0
      ? numericId
      : null;
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return null;
  }
}

// ============================================================
// CALIFORNIA TIME
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
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function getCaliforniaDate(date = new Date()) {
  const p = getCaliforniaParts(date);
  return formatDate(p.year, p.month, p.day);
}

function getCaliforniaDBDateTime(date = new Date()) {
  const p = getCaliforniaParts(date);

  return (
    `${formatDate(p.year, p.month, p.day)} ` +
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

function californiaWallClockToDate(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0
) {
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = desired;

  for (let i = 0; i < 10; i++) {
    const p = getCaliforniaParts(new Date(guess));
    const actual = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second
    );

    const difference = desired - actual;
    if (difference === 0) break;

    guess += difference;
  }

  return new Date(guess);
}

function californiaDateTimeToMs(value) {
  if (value == null) return null;

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

  const text = String(value)
    .trim()
    .replace("T", " ")
    .replace(/\.\d{1,6}$/, "");

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) return null;

  const [, y, mo, d, h, mi, s] = match;
  const values = [y, mo, d, h, mi, s].map(Number);
  const [year, month, day, hour, minute, second] = values;

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
}

function toMySQLUtc(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function mysqlUtcToMs(value) {
  if (!value) return null;

  const raw = String(value).trim().replace(" ", "T");
  const ms = Date.parse(`${raw}Z`);

  return Number.isFinite(ms) ? ms : null;
}

function shiftCalendarDate(year, month, day, days) {
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  date.setUTCDate(date.getUTCDate() + days);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

// ============================================================
// BREAK WINDOW: 8 AM CALIFORNIA TO NEXT DAY 8 AM
// ============================================================

function getBreakWindowInfo(date = new Date()) {
  const p = getCaliforniaParts(date);

  let start = {
    year: p.year,
    month: p.month,
    day: p.day,
  };

  if (p.hour < 8) {
    start = shiftCalendarDate(p.year, p.month, p.day, -1);
  }

  const end = shiftCalendarDate(
    start.year,
    start.month,
    start.day,
    1
  );

  const startDate = californiaWallClockToDate(
    start.year, start.month, start.day, 8
  );

  const endDate = californiaWallClockToDate(
    end.year, end.month, end.day, 8
  );

  return {
    startDate: formatDate(start.year, start.month, start.day),
    endDate: formatDate(end.year, end.month, end.day),
    startDB: getCaliforniaDBDateTime(startDate),
    endDB: getCaliforniaDBDateTime(endDate),
    startMs: startDate.getTime(),
    endMs: endDate.getTime(),
    timezone: CALIFORNIA_TIMEZONE,
  };
}

function isBreakAllowedAtCaliforniaTime(date = new Date()) {
  const p = getCaliforniaParts(date);
  const minutes = p.hour * 60 + p.minute;

  return !(minutes >= 480 && minutes < 540);
}

function getBreakRestrictionMessage(date = new Date()) {
  const p = getCaliforniaParts(date);

  return (
    "Breaks are not allowed from 8:00 AM to 9:00 AM California time. " +
    `Current California time is ${String(p.hour).padStart(2, "0")}:` +
    `${String(p.minute).padStart(2, "0")}. Breaks resume at 9:00 AM.`
  );
}

function isBreakStatus(status) {
  return BREAK_STATUSES.includes(status);
}

function getBreakDurationLimitSeconds(status) {
  return (BREAK_DURATION_LIMITS_MINUTES[status] || 0) * 60;
}

function getTimeInfo() {
  const now = new Date();
  const p = getCaliforniaParts(now);
  const window = getBreakWindowInfo(now);

  return {
    serverNowMs: now.getTime(),
    californiaDate: getCaliforniaDate(now),
    californiaNow: getCaliforniaDBDateTime(now),
    californiaDisplayTime: getCaliforniaDisplayTime(now),
    californiaHour: p.hour,
    californiaMinute: p.minute,
    californiaSecond: p.second,
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
// DATABASE HELPERS
// ============================================================

async function getUserById(db, userId) {
  const [rows] = await db.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  return rows?.[0] || null;
}

async function findCurrentHistory(db, user) {
  if (!user?.status_started_at) return null;

  const [rows] = await db.query(
    `
      SELECT
        id,
        status,
        DATE_FORMAT(started_at, '%Y-%m-%d %H:%i:%s') AS started_at,
        DATE_FORMAT(ended_at, '%Y-%m-%d %H:%i:%s') AS ended_at
      FROM user_status_history
      WHERE user_id = ?
        AND status = ?
        AND started_at = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [
      user.id,
      user.availability_status,
      user.status_started_at,
    ]
  );

  return rows?.[0] || null;
}

function getAdminLimitSeconds(row) {
  if (!row?.started_at || !row?.ended_at) return 0;

  const startMs = californiaDateTimeToMs(row.started_at);
  const endMs = californiaDateTimeToMs(row.ended_at);

  if (startMs === null || endMs === null) return 0;

  const diff = Math.floor((endMs - startMs) / 1000);

  if (diff <= 0) return 0;

  return Math.min(diff, MAX_ADMIN_LIMIT_SECONDS);
}

async function resolveBreakLimit(db, user) {
  if (
    !user ||
    !isBreakStatus(user.availability_status) ||
    !user.status_started_at
  ) {
    return { limitSeconds: 0, setByAdmin: false, row: null };
  }

  const row = await findCurrentHistory(db, user);
  const limitSeconds = getAdminLimitSeconds(row);

  return {
    limitSeconds,
    setByAdmin: limitSeconds > 0,
    row,
  };
}

// ============================================================
// BREAK TIMER
// ============================================================

function calculateBreakTimer(
  status,
  startedAt,
  nowMs = Date.now(),
  limitOverrideSeconds = 0
) {
  if (!isBreakStatus(status) || !startedAt) {
    return {
      isBreak: false,
      elapsedSeconds: 0,
      remainingSeconds: 0,
      durationLimitMinutes: 0,
      durationLimitSeconds: 0,
      expired: false,
      setByAdmin: false,
    };
  }

  const setByAdmin = limitOverrideSeconds > 0;
  const durationLimitSeconds = setByAdmin
    ? limitOverrideSeconds
    : getBreakDurationLimitSeconds(status);

  const startedMs = californiaDateTimeToMs(startedAt);

  if (startedMs === null) {
    return {
      isBreak: true,
      elapsedSeconds: 0,
      remainingSeconds: durationLimitSeconds,
      durationLimitMinutes: Math.ceil(durationLimitSeconds / 60),
      durationLimitSeconds,
      expired: false,
      setByAdmin,
    };
  }

  const rawElapsed = Math.floor(
    Math.max(0, nowMs - startedMs) / 1000
  );

  const elapsedSeconds = Math.min(rawElapsed, durationLimitSeconds);

  return {
    isBreak: true,
    elapsedSeconds,
    remainingSeconds: Math.max(0, durationLimitSeconds - elapsedSeconds),
    durationLimitMinutes: Math.ceil(durationLimitSeconds / 60),
    durationLimitSeconds,
    expired: rawElapsed >= durationLimitSeconds,
    setByAdmin,
  };
}

function buildCurrentBreakInfo(user, nowMs, limitSeconds = 0) {
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
      setByAdmin: false,
    };
  }

  return {
    ...calculateBreakTimer(
      user.availability_status,
      user.status_started_at,
      nowMs,
      limitSeconds
    ),
    status: user.availability_status,
    startedAt: user.status_started_at,
  };
}

// ============================================================
// ADMIN RESET AND USAGE LIMITS
// ============================================================

async function getEffectiveWindowStart(db, userId, window) {
  const fallback = { startDB: window.startDB, resetAt: null };

  try {
    const [rows] = await db.query(
      `
        SELECT DATE_FORMAT(reset_at, '%Y-%m-%d %H:%i:%s') AS reset_at_raw
        FROM break_limit_resets
        WHERE (user_id = ? OR user_id IS NULL)
          AND reset_at >= ?
        ORDER BY reset_at DESC, id DESC
        LIMIT 1
      `,
      [userId, toMySQLUtc(new Date(window.startMs))]
    );

    const raw = rows?.[0]?.reset_at_raw;
    const resetMs = mysqlUtcToMs(raw);

    if (resetMs === null) return fallback;

    return {
      startDB: getCaliforniaDBDateTime(new Date(resetMs)),
      resetAt: new Date(resetMs).toISOString(),
    };
  } catch (error) {
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return fallback;
    }

    throw error;
  }
}

async function getBreakCounts(db, userId, fromDB, toDB) {
  const [rows] = await db.query(
    `
      SELECT status, COUNT(*) AS total
      FROM user_status_history
      WHERE user_id = ?
        AND status IN (?, ?, ?)
        AND started_at >= ?
        AND started_at < ?
      GROUP BY status
    `,
    [
      userId,
      "Namaz Break",
      "Lunch Break",
      "Short Break",
      fromDB,
      toDB,
    ]
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

async function buildLimitInfo(db, userId, now = new Date()) {
  const window = getBreakWindowInfo(now);
  const effective = await getEffectiveWindowStart(db, userId, window);

  const counts = await getBreakCounts(
    db,
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
// CLOSE OPEN HISTORY
// ============================================================

async function closeOpenHistory(db, userId, nowMs, fallbackEndedAt) {
  const [rows] = await db.query(
    `
      SELECT
        id,
        status,
        DATE_FORMAT(started_at, '%Y-%m-%d %H:%i:%s') AS started_at,
        DATE_FORMAT(ended_at, '%Y-%m-%d %H:%i:%s') AS ended_at
      FROM user_status_history
      WHERE user_id = ?
        AND started_at <= ?
        AND (ended_at IS NULL OR ended_at > ?)
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `,
    [userId, fallbackEndedAt, fallbackEndedAt]
  );

  const row = rows?.[0];

  if (!row) {
    console.warn("No open status history row found", {
      userId,
      fallbackEndedAt,
    });

    return { closed: false, durationSeconds: 0, status: null };
  }

  const startedMs = californiaDateTimeToMs(row.started_at);

  if (startedMs === null) {
    throw new Error(`Invalid history start time for row ${row.id}`);
  }

  const elapsed = Math.floor(Math.max(0, nowMs - startedMs) / 1000);
  let durationSeconds = elapsed;
  let endedAt = fallbackEndedAt;

  if (isBreakStatus(row.status)) {
    const adminLimit = getAdminLimitSeconds(row);
    const maxSeconds = adminLimit > 0
      ? adminLimit
      : getBreakDurationLimitSeconds(row.status);

    if (maxSeconds > 0 && elapsed >= maxSeconds) {
      durationSeconds = maxSeconds;
      endedAt = getCaliforniaDBDateTime(
        new Date(startedMs + maxSeconds * 1000)
      );
    }
  }

  await db.query(
    `
      UPDATE user_status_history
      SET ended_at = ?, duration_seconds = ?
      WHERE id = ?
      LIMIT 1
    `,
    [endedAt, durationSeconds, row.id]
  );

  return {
    closed: true,
    id: row.id,
    status: row.status,
    durationSeconds,
    endedAt,
  };
}

// ============================================================
// RECONCILE DELETED/EDITED BREAK
// ============================================================

async function reconcileBreak(user) {
  if (
    !user ||
    !isBreakStatus(user.availability_status) ||
    !user.status_started_at
  ) {
    return { reset: false, user };
  }

  const row = await findCurrentHistory(pool, user);

  if (row) return { reset: false, user };

  await pool.query(
    `
      UPDATE users
      SET availability_status = 'Active',
          status_started_at = NULL
      WHERE id = ?
        AND availability_status = ?
        AND status_started_at = ?
      LIMIT 1
    `,
    [user.id, user.availability_status, user.status_started_at]
  );

  return {
    reset: true,
    user: (await getUserById(pool, user.id)) || user,
  };
}

// ============================================================
// AUTO EXPIRE BREAK
// ============================================================

async function autoExpireBreak(user, nowMs) {
  if (
    !user ||
    !isBreakStatus(user.availability_status) ||
    !user.status_started_at
  ) {
    return { expired: false, user };
  }

  const resolved = await resolveBreakLimit(pool, user);
  const timer = calculateBreakTimer(
    user.availability_status,
    user.status_started_at,
    nowMs,
    resolved.limitSeconds
  );

  if (!timer.expired) return { expired: false, user };

  const status = user.availability_status;
  const limitSeconds = timer.durationLimitSeconds;
  const startedMs = californiaDateTimeToMs(user.status_started_at);

  if (startedMs === null) return { expired: false, user };

  const exactEndedAt = getCaliforniaDBDateTime(
    new Date(startedMs + limitSeconds * 1000)
  );

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [lockedRows] = await connection.query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = ? FOR UPDATE`,
      [user.id]
    );

    const lockedUser = lockedRows?.[0];

    if (
      !lockedUser ||
      lockedUser.availability_status !== status ||
      String(lockedUser.status_started_at || "") !==
        String(user.status_started_at || "")
    ) {
      await connection.rollback();

      return {
        expired: false,
        user: lockedUser || user,
      };
    }

    const [historyRows] = await connection.query(
      `
        SELECT id
        FROM user_status_history
        WHERE user_id = ?
          AND status = ?
          AND started_at = ?
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
      `,
      [user.id, status, user.status_started_at]
    );

    const history = historyRows?.[0];

    if (history) {
      await connection.query(
        `
          UPDATE user_status_history
          SET ended_at = ?, duration_seconds = ?
          WHERE id = ?
          LIMIT 1
        `,
        [exactEndedAt, limitSeconds, history.id]
      );
    } else {
      // Repair a missing history row before expiring the break.
      await connection.query(
        `
          INSERT INTO user_status_history
            (user_id, status, started_at, ended_at, duration_seconds, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          status,
          user.status_started_at,
          exactEndedAt,
          limitSeconds,
          toMySQLUtc(new Date(startedMs)),
        ]
      );
    }

    await connection.query(
      `
        UPDATE users
        SET availability_status = 'Active',
            status_started_at = NULL
        WHERE id = ?
        LIMIT 1
      `,
      [user.id]
    );

    await connection.commit();

    return {
      expired: true,
      user: await getUserById(pool, user.id),
      expiredStatus: status,
      durationSeconds: limitSeconds,
      endedAt: exactEndedAt,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    throw error;
  } finally {
    connection.release();
  }
}

// ============================================================
// RESPONSE
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
    break_usage: usage,
    breakUsage: usage,
    usage,
    limits,
    timer,
    elapsedSeconds: timer?.elapsedSeconds || 0,
    remainingSeconds: timer?.remainingSeconds || 0,
    durationLimitMinutes: timer?.durationLimitMinutes || 0,
    durationLimitSeconds: timer?.durationLimitSeconds || 0,
    setByAdmin: Boolean(timer?.setByAdmin),
    breakDurationLimits: BREAK_DURATION_LIMITS_MINUTES,
    breakWindow: {
      resetTime: "08:00 AM",
      timezone: CALIFORNIA_TIMEZONE,
      currentWindowStart: limits?.window?.start || null,
      currentWindowEnd: limits?.window?.end || null,
      adminResetAt: limits?.window?.adminResetAt || null,
      description:
        "Break limits reset at 8:00 AM California time or on admin reset.",
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

// ============================================================
// GET STATUS
// ============================================================

export async function GET(request) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const time = getTimeInfo();
    let user = await getUserById(pool, userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const reconciled = await reconcileBreak(user);
    if (reconciled.reset) user = reconciled.user;

    const expired = await autoExpireBreak(user, time.serverNowMs);
    if (expired.expired) user = expired.user;

    const connection = await pool.getConnection();

    let limits;
    let resolved;

    try {
      limits = await buildLimitInfo(connection, userId, new Date());
      resolved = await resolveBreakLimit(connection, user);
    } finally {
      connection.release();
    }

    const timer = buildCurrentBreakInfo(
      user,
      Date.now(),
      resolved.limitSeconds
    );

    return NextResponse.json(
      buildResponseData({
        user,
        limits,
        timer,
        time,
        autoExpired: expired.expired || reconciled.reset,
        autoExpiredStatus: expired.expired ? expired.expiredStatus : null,
        autoExpiredDurationSeconds: expired.expired
          ? expired.durationSeconds
          : null,
        autoExpiredEndedAt: expired.expired ? expired.endedAt : null,
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
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// ============================================================
// PUT STATUS + SAVE HISTORY
// ============================================================

export async function PUT(request) {
  let connection = null;

  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const requestedStatus = String(body?.status || "").trim();

    if (!ALLOWED_STATUSES.includes(requestedStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
          allowedStatuses: ALLOWED_STATUSES,
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const now = new Date();
    const nowMs = now.getTime();
    const californiaNow = getCaliforniaDBDateTime(now);

    // Block only starting a new break, never ending one.
    if (
      isBreakStatus(requestedStatus) &&
      !isBreakAllowedAtCaliforniaTime(now)
    ) {
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
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [userRows] = await connection.query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = ? FOR UPDATE`,
      [userId]
    );

    let user = userRows?.[0];

    if (!user) {
      await connection.rollback();

      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const currentStatus = user.availability_status || "Active";

    // Idempotent status request: don't create duplicate history.
    if (currentStatus === requestedStatus) {
      const limits = await buildLimitInfo(connection, userId, now);
      const resolved = await resolveBreakLimit(connection, user);
      const timer = buildCurrentBreakInfo(
        user,
        nowMs,
        resolved.limitSeconds
      );

      await connection.commit();

      return NextResponse.json(
        buildResponseData({
          user,
          limits,
          timer,
          time: getTimeInfo(),
        }),
        { status: 200, headers: NO_CACHE_HEADERS }
      );
    }

    // Enforce break limits only for limited break types.
    if (isBreakStatus(requestedStatus)) {
      const limits = await buildLimitInfo(connection, userId, now);

      if (limits.total.reached) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            code: "TOTAL_BREAK_LIMIT_REACHED",
            message:
              `Maximum ${MAX_BREAKS_PER_WINDOW} breaks are allowed ` +
              "from 8:00 AM to next day 8:00 AM California time.",
            break_usage: buildBreakUsageFromLimits(limits),
            limits,
          },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }

      const key = BREAK_KEYS[requestedStatus];
      const specific = key ? limits[key] : null;

      if (specific?.reached) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            code: "SPECIFIC_BREAK_LIMIT_REACHED",
            message:
              `${requestedStatus} limit of ${specific.max} ` +
              "has been reached for this break window.",
            status: requestedStatus,
            used: specific.used,
            max: specific.max,
            break_usage: buildBreakUsageFromLimits(limits),
            limits,
          },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }
    }

    // Close previous status history before switching status.
    if (currentStatus !== "Active" && user.status_started_at) {
      await closeOpenHistory(
        connection,
        userId,
        nowMs,
        californiaNow
      );
    }

    if (requestedStatus === "Active") {
      await connection.query(
        `
          UPDATE users
          SET availability_status = 'Active',
              status_started_at = NULL
          WHERE id = ?
          LIMIT 1
        `,
        [userId]
      );
    } else {
      // Save every new non-Active status with explicit created_at.
      const [historyResult] = await connection.query(
        `
          INSERT INTO user_status_history (
            user_id,
            status,
            started_at,
            ended_at,
            duration_seconds,
            created_at
          )
          VALUES (?, ?, ?, NULL, 0, ?)
        `,
        [
          userId,
          requestedStatus,
          californiaNow,
          toMySQLUtc(now),
        ]
      );

      if (!historyResult.insertId) {
        throw new Error("Failed to create status history record");
      }

      const [updateResult] = await connection.query(
        `
          UPDATE users
          SET availability_status = ?,
              status_started_at = ?
          WHERE id = ?
          LIMIT 1
        `,
        [requestedStatus, californiaNow, userId]
      );

      if (updateResult.affectedRows !== 1) {
        throw new Error("Failed to update user status");
      }
    }

    const updatedUser = await getUserById(connection, userId);

    if (!updatedUser) {
      throw new Error("Could not read updated user");
    }

    const limits = await buildLimitInfo(connection, userId, now);
    const resolved = await resolveBreakLimit(connection, updatedUser);
    const timer = buildCurrentBreakInfo(
      updatedUser,
      nowMs,
      resolved.limitSeconds
    );

    await connection.commit();

    return NextResponse.json(
      {
        ...buildResponseData({
          user: updatedUser,
          limits,
          timer,
          time: getTimeInfo(),
        }),
        history_saved: requestedStatus !== "Active",
      },
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
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  } finally {
    if (connection) connection.release();
  }
}