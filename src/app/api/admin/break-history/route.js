// app/api/admin/break-history/route.js
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import {
  CALIFORNIA_TIMEZONE,
  ALL_BREAK_STATUSES,
  LIMITED_KEYS,
  getAuthenticatedUser,
  isAdmin,
  getBreakWindowInfo,
  getWindowResets,
  effectiveStartMs,
  getUsageForUser,
  californiaDBToDate,
  mysqlUtcToDate,
  dateToCaliforniaDB,
  dateToMySQLUtc,
  normalizeBreakStatus,
  normalizeDuration,
  resolveTimes,
  NO_CACHE,
} from "../../../lib/breakTime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sirf inhi breaks ka timer modal user ke top bar mein chalta hai
const LIVE_TIMER_STATUSES = ["Namaz Break", "Lunch Break", "Short Break"];

// ======================================================
// DISPLAY HELPERS
// ======================================================

function fmt(date, options) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: CALIFORNIA_TIMEZONE,
    ...options,
  }).format(date);
}

const longDateTime = (d) =>
  fmt(d, {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

const shortDateTime = (d) =>
  fmt(d, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

const longDate = (d) =>
  fmt(d, { weekday: "long", month: "long", day: "2-digit", year: "numeric" });

const timeOnly = (d) =>
  fmt(d, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

const SELECT_COLUMNS = `
  h.id,
  h.user_id,
  u.name,
  u.email,
  u.team,
  u.role,
  h.status AS break_type,
  h.status,
  DATE_FORMAT(h.started_at, '%Y-%m-%d %H:%i:%s.%f') AS started_at_raw,
  DATE_FORMAT(h.ended_at,   '%Y-%m-%d %H:%i:%s.%f') AS ended_at_raw,
  h.duration_seconds,
  DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s.%f') AS created_at_raw
`;

const BREAK_IN = `h.status IN ('Namaz Break','Lunch Break','Short Break','Washroom Break','Other')`;

// ======================================================
// GET
// ======================================================

export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (auth.error) return auth.error;

    const currentUser = auth.user;

    let rows;

    if (isAdmin(currentUser)) {
      [rows] = await pool.query(
        `
          SELECT ${SELECT_COLUMNS}
          FROM user_status_history h
          LEFT JOIN users u ON u.id = h.user_id
          WHERE ${BREAK_IN}
          ORDER BY h.started_at DESC, h.id DESC
        `
      );
    } else {
      [rows] = await pool.query(
        `
          SELECT ${SELECT_COLUMNS}
          FROM user_status_history h
          LEFT JOIN users u ON u.id = h.user_id
          WHERE h.user_id = ?
            AND ${BREAK_IN}
          ORDER BY h.started_at DESC, h.id DESC
        `,
        [currentUser.id]
      );
    }

    // ==================================================
    // USAGE PER USER (current window + admin resets)
    // ==================================================

    const now = new Date();
    const nowMs = now.getTime();
    const window = getBreakWindowInfo(now);
    const resets = await getWindowResets(pool, window);

    const usageByUser = {};

    for (const row of rows || []) {
      const key = LIMITED_KEYS[row.status];

      if (!key) continue;

      const startedCa = californiaDBToDate(row.started_at_raw);

      if (!startedCa) continue;

      const ms = startedCa.getTime();

      if (ms >= window.endMs) continue;
      if (ms < effectiveStartMs(resets, row.user_id, window)) continue;

      const bucket =
        usageByUser[row.user_id] ||
        (usageByUser[row.user_id] = { namaz: 0, lunch: 0, short: 0, total: 0 });

      bucket[key] += 1;
      bucket.total += 1;
    }

    // ==================================================
    // FORMAT
    // ==================================================

    const breaks = (rows || []).map((row) => {
      const durationSeconds = normalizeDuration(row.duration_seconds);

      // created_at holds the UTC start time
      let startedDate = mysqlUtcToDate(row.created_at_raw);

      if (!startedDate) startedDate = mysqlUtcToDate(row.started_at_raw);

      let endedDate = null;

      if (startedDate && durationSeconds !== null) {
        endedDate = new Date(startedDate.getTime() + durationSeconds * 1000);
      } else {
        // ended_at is stored as California time
        endedDate = californiaDBToDate(row.ended_at_raw);
      }

      const createdDate = mysqlUtcToDate(row.created_at_raw);

      // Active = end time nahi hai, YA admin ka set kiya end time abhi future mein hai
      const endsInFuture = Boolean(
        row.ended_at_raw && endedDate && endedDate.getTime() > nowMs
      );

      const isActive = !!startedDate && (!row.ended_at_raw || endsInFuture);

      return {
        id: row.id,
        user_id: row.user_id,
        name: row.name || "Unknown User",
        email: row.email || "",
        team: row.team || "",
        role: row.role || "user",
        break_type: row.break_type || "Other",
        status: row.status || row.break_type || "Other",

        started_at: startedDate ? startedDate.toISOString() : null,
        ended_at: endedDate ? endedDate.toISOString() : null,
        created_at: createdDate ? createdDate.toISOString() : null,

        // California wall-clock text for the Edit modal (YYYY-MM-DD HH:mm:ss)
        started_at_ca: dateToCaliforniaDB(startedDate),

        // end time hamesha bheja jata hai (sirf bina end wale break mein null)
        ended_at_ca: row.ended_at_raw ? dateToCaliforniaDB(endedDate) : null,

        started_at_california: longDateTime(startedDate),
        ended_at_california: longDateTime(endedDate),
        created_at_california: longDateTime(createdDate),

        started_date_california: longDate(startedDate),
        ended_date_california: longDate(endedDate),
        created_date_california: longDate(createdDate),

        started_time_california: timeOnly(startedDate),
        ended_time_california: timeOnly(endedDate),
        created_time_california: timeOnly(createdDate),

        started_short_california: shortDateTime(startedDate),
        ended_short_california: shortDateTime(endedDate),
        created_short_california: shortDateTime(createdDate),

        duration_seconds: durationSeconds,
        is_active: isActive,
      };
    });

    const count = (type) =>
      breaks.filter((item) => item.break_type === type).length;

    const stats = {
      total: breaks.length,
      namaz: count("Namaz Break"),
      lunch: count("Lunch Break"),
      shortBreak: count("Short Break"),
      washroom: count("Washroom Break"),
      other: count("Other"),
      active: breaks.filter((item) => item.is_active === true).length,
    };

    let myUsage = null;

    try {
      myUsage = await getUsageForUser(currentUser.id, pool, now);
    } catch (error) {
      console.error("BREAK USAGE ERROR:", error);
    }

    return NextResponse.json(
      {
        success: true,
        timezone: CALIFORNIA_TIMEZONE,
        breaks,
        stats,

        usage_by_user: usageByUser,
        break_window: {
          start: window.startDB,
          end: window.endDB,
          resets_at: "08:00 AM California",
        },

        my_usage: myUsage,

        current_user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          team: currentUser.team,
        },
      },
      { status: 200, headers: NO_CACHE }
    );
  } catch (error) {
    console.error("BREAK HISTORY GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch break history",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// POST  (admin adds a break)
//
// started_at / ended_at California time mein save hote hain.
// Agar break abhi chal raha hai (start <= now < end), to user ka
// live status bhi set hota hai -> user ke top bar mein timer modal
// khulta hai, admin ke set kiye hue end time tak.
// ======================================================

export async function POST(request) {
  let connection = null;

  try {
    const auth = await getAuthenticatedUser(request);

    if (auth.error) return auth.error;

    if (!isAdmin(auth.user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only administrators can add break records.",
        },
        { status: 403 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // USER
    const targetUserId = Number(
      body?.user_id ?? body?.userId ?? body?.employee_id ?? 0
    );

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return NextResponse.json(
        { success: false, message: "user_id is required." },
        { status: 400 }
      );
    }

    const [targetUsers] = await pool.query(
      `SELECT id, name, email, role, team FROM users WHERE id = ? LIMIT 1`,
      [targetUserId]
    );

    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: "Selected user was not found." },
        { status: 404 }
      );
    }

    const targetUser = targetUsers[0];

    // STATUS
    const status = normalizeBreakStatus(
      body?.status ?? body?.break_type ?? body?.breakType
    );

    if (!status || !ALL_BREAK_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid break type.",
          allowed: ALL_BREAK_STATUSES,
        },
        { status: 400 }
      );
    }

    // TIMES
    const times = resolveTimes(body);

    if (times.error) {
      return NextResponse.json(
        { success: false, message: times.error },
        { status: 400 }
      );
    }

    const { startedDate, endedDate, durationSeconds } = times;

    const startedCaDB = dateToCaliforniaDB(startedDate);
    const endedCaDB = endedDate ? dateToCaliforniaDB(endedDate) : null;

    const nowMs = Date.now();

    // Kya ye break abhi chal raha hai?
    const isLiveNow =
      LIVE_TIMER_STATUSES.includes(status) &&
      startedDate.getTime() <= nowMs &&
      (!endedDate || endedDate.getTime() > nowMs);

    let liveStatusApplied = false;
    let liveStatusSkippedReason = null;
    let insertId = null;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // INSERT HISTORY
    const [result] = await connection.query(
      `
        INSERT INTO user_status_history
        (
          user_id,
          status,
          started_at,
          ended_at,
          duration_seconds,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        targetUserId,
        status,
        startedCaDB, // California
        endedCaDB, // California (future ho sakta hai)
        durationSeconds,
        dateToMySQLUtc(startedDate), // UTC
      ]
    );

    insertId = result.insertId;

    // USER KA LIVE STATUS (timer modal ke liye)
    if (isLiveNow) {
      const [userRows] = await connection.query(
        `
          SELECT availability_status
          FROM users
          WHERE id = ?
          FOR UPDATE
        `,
        [targetUserId]
      );

      const currentStatus = userRows?.[0]?.availability_status || "Active";

      if (currentStatus === "Active") {
        await connection.query(
          `
            UPDATE users
            SET
              availability_status = ?,
              status_started_at = ?
            WHERE id = ?
            LIMIT 1
          `,
          [status, startedCaDB, targetUserId]
        );

        liveStatusApplied = true;
      } else {
        // user pehle se kisi aur status / break mein hai, usay disturb nahi karte
        liveStatusSkippedReason = `User is currently "${currentStatus}".`;
      }
    }

    await connection.commit();

    let usage = null;

    try {
      usage = await getUsageForUser(targetUserId, pool);
    } catch (error) {
      console.error("POST USAGE ERROR:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Break added successfully.",
        id: insertId,
        live_status_applied: liveStatusApplied,
        live_status_skipped_reason: liveStatusSkippedReason,
        timer_limit_seconds:
          liveStatusApplied && endedDate
            ? Math.max(
                0,
                Math.floor((endedDate.getTime() - startedDate.getTime()) / 1000)
              )
            : null,
        break: {
          id: insertId,
          user_id: targetUserId,
          name: targetUser.name,
          email: targetUser.email,
          team: targetUser.team,
          role: targetUser.role,
          break_type: status,
          status,
          started_at: startedDate.toISOString(),
          ended_at: endedDate ? endedDate.toISOString() : null,
          duration_seconds: durationSeconds,
          is_active: !endedDate || endedDate.getTime() > nowMs,
        },
        break_usage: usage?.usage || null,
        usage,
      },
      { status: 201, headers: NO_CACHE }
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    console.error("BREAK HISTORY POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add break.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}