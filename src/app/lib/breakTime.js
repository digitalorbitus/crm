// app/lib/breakTime.js
// Shared helpers for admin break APIs.
//
// STORAGE RULES (must match /api/users/status):
//   started_at / ended_at  -> California wall-clock  (2026-10-09 10:30:00)
//   created_at             -> UTC start time (break-history GET reads this)
//   break_limit_resets.reset_at -> UTC
//
// LIMIT RULE: 08:00 AM California -> next 08:00 AM, plus admin resets.

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "./db";

export const CALIFORNIA_TIMEZONE = "America/Los_Angeles";

export const ALL_BREAK_STATUSES = [
  "Namaz Break",
  "Lunch Break",
  "Short Break",
  "Washroom Break",
  "Other",
];

// statuses that consume the daily limits
export const LIMITED_KEYS = {
  "Namaz Break": "namaz",
  "Lunch Break": "lunch",
  "Short Break": "short",
};

export const BREAK_LIMITS = { namaz: 1, lunch: 1, short: 3, total: 5 };

// ======================================================
// AUTH
// ======================================================

export async function getAuthenticatedUser(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, message: "Login required" },
        { status: 401 }
      ),
    };
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return {
      error: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  const userId = decoded?.id ?? decoded?._id ?? decoded?.userId ?? null;

  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, message: "User ID not found" },
        { status: 401 }
      ),
    };
  }

  const [rows] = await pool.query(
    `SELECT id, name, email, role, team FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  if (!rows || rows.length === 0) {
    return {
      error: NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      ),
    };
  }

  return { user: rows[0] };
}

export function isAdmin(user) {
  return String(user?.role || "").trim().toLowerCase() === "admin";
}

// ======================================================
// CALIFORNIA TIME
// ======================================================

export function getCaliforniaParts(date = new Date()) {
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

// California wall-clock -> real Date (DST safe)
export function californiaWallClockToDate(
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
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

    const diff = desired - actual;

    if (diff === 0) break;

    guess += diff;
  }

  return new Date(guess + millisecond);
}

// Date -> "2026-10-09 10:30:00" in California time
export function dateToCaliforniaDB(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

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

// Date -> "2026-10-09 17:30:00" in UTC
export function dateToMySQLUtc(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 19).replace("T", " ");
}

const DB_DATETIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/;

// "2026-10-09 17:30:00" (stored as UTC) -> Date
export function mysqlUtcToDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();

  if (raw.includes("T") && (raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw))) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const m = raw.match(DB_DATETIME);

  if (!m) return null;

  const ms = m[7] ? Number(m[7].padEnd(3, "0").slice(0, 3)) : 0;

  return new Date(
    Date.UTC(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      Number(m[6] || 0),
      ms
    )
  );
}

// "2026-10-09 10:30:00" (stored as California) -> Date
export function californiaDBToDate(value) {
  if (!value) return null;

  const m = String(value).trim().match(DB_DATETIME);

  if (!m) return null;

  const ms = m[7] ? Number(m[7].padEnd(3, "0").slice(0, 3)) : 0;

  return californiaWallClockToDate(
    Number(m[1]),
    Number(m[2]),
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6] || 0),
    ms
  );
}

// Admin form value. "2026-10-09T10:30" = California local time.
export function parseCaliforniaInput(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();

  if (!raw) return null;

  if (raw.includes("T") && (raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw))) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return californiaDBToDate(raw);
}

// ======================================================
// BREAK WINDOW (08:00 AM CA -> next 08:00 AM CA)
// ======================================================

function shiftCalendarDate(year, month, day, days) {
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + days);

  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function getBreakWindowInfo(date = new Date()) {
  const p = getCaliforniaParts(date);

  let start = { year: p.year, month: p.month, day: p.day };

  if (p.hour < 8) {
    start = shiftCalendarDate(p.year, p.month, p.day, -1);
  }

  const end = shiftCalendarDate(start.year, start.month, start.day, 1);

  const startDate = californiaWallClockToDate(
    start.year,
    start.month,
    start.day,
    8
  );

  const endDate = californiaWallClockToDate(end.year, end.month, end.day, 8);

  return {
    startMs: startDate.getTime(),
    endMs: endDate.getTime(),
    startDB: dateToCaliforniaDB(startDate),
    endDB: dateToCaliforniaDB(endDate),
  };
}

// ======================================================
// ADMIN RESETS
// ======================================================

// All resets (any user or everyone) made inside the current window
export async function getWindowResets(db, window) {
  try {
    const [rows] = await db.query(
      `
        SELECT
          user_id,
          DATE_FORMAT(reset_at, '%Y-%m-%d %H:%i:%s') AS reset_at_raw
        FROM break_limit_resets
        WHERE reset_at >= ?
      `,
      [dateToMySQLUtc(new Date(window.startMs))]
    );

    return (rows || [])
      .map((row) => ({
        userId: row.user_id === null ? null : Number(row.user_id),
        ms: mysqlUtcToDate(row.reset_at_raw)?.getTime(),
      }))
      .filter((row) => Number.isFinite(row.ms));
  } catch (error) {
    if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
      return [];
    }

    throw error;
  }
}

// Counting starts at the latest reset that applies to this user
export function effectiveStartMs(resets, userId, window) {
  let from = window.startMs;

  for (const reset of resets) {
    if (reset.userId === null || reset.userId === Number(userId)) {
      if (reset.ms > from) from = reset.ms;
    }
  }

  return from;
}

// ======================================================
// USAGE FOR ONE USER (same maths as /api/users/status)
// ======================================================

export async function getUsageForUser(userId, db = pool, now = new Date()) {
  const window = getBreakWindowInfo(now);
  const resets = await getWindowResets(db, window);
  const fromMs = effectiveStartMs(resets, userId, window);

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
      dateToCaliforniaDB(new Date(fromMs)),
      window.endDB,
    ]
  );

  const usage = { "Short Break": 0, "Lunch Break": 0, "Namaz Break": 0 };

  for (const row of rows || []) {
    if (row.status in usage) usage[row.status] = Number(row.total || 0);
  }

  return {
    usage,
    total: usage["Short Break"] + usage["Lunch Break"] + usage["Namaz Break"],
    window_start: window.startDB,
    window_end: window.endDB,
    counting_from: dateToCaliforniaDB(new Date(fromMs)),
  };
}

// ======================================================
// INPUT HELPERS
// ======================================================

const STATUS_MAP = {
  Namaz: "Namaz Break",
  "Namaz Break": "Namaz Break",
  Lunch: "Lunch Break",
  "Lunch Break": "Lunch Break",
  Short: "Short Break",
  "Short Break": "Short Break",
  Washroom: "Washroom Break",
  "Washroom Break": "Washroom Break",
  Other: "Other",
};

export function normalizeBreakStatus(value) {
  const key = String(value || "").trim();

  return STATUS_MAP[key] || null;
}

export function normalizeDuration(value) {
  if (value === null || value === undefined || value === "") return null;

  const n = Number(value);

  if (!Number.isFinite(n) || n < 0) return null;

  return Math.floor(n);
}

// body -> { startedDate, endedDate, durationSeconds } or { error }
export function resolveTimes(body) {
  const startedInput =
    body?.started_at ?? body?.startedAt ?? body?.start_time ?? null;

  if (!startedInput) return { error: "started_at is required." };

  const startedDate = parseCaliforniaInput(startedInput);

  if (!startedDate) {
    return { error: "Invalid started_at. Use California local date/time." };
  }

  const endedInput = body?.ended_at ?? body?.endedAt ?? body?.end_time ?? null;

  let endedDate = null;

  if (endedInput) {
    endedDate = parseCaliforniaInput(endedInput);

    if (!endedDate) {
      return { error: "Invalid ended_at. Use California local date/time." };
    }

    if (endedDate.getTime() < startedDate.getTime()) {
      return { error: "End time cannot be before start time." };
    }
  }

  let durationSeconds = normalizeDuration(
    body?.duration_seconds ?? body?.durationSeconds ?? null
  );

  if (durationSeconds === null && endedDate) {
    durationSeconds = Math.floor(
      (endedDate.getTime() - startedDate.getTime()) / 1000
    );
  }

  if (durationSeconds !== null && !endedDate) {
    endedDate = new Date(startedDate.getTime() + durationSeconds * 1000);
  }

  return { startedDate, endedDate, durationSeconds };
}

export const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};
