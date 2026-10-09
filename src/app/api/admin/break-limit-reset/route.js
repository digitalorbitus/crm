// app/api/admin/break-limit-reset/route.js
import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import {
  CALIFORNIA_TIMEZONE,
  getAuthenticatedUser,
  isAdmin,
  getUsageForUser,
  dateToMySQLUtc,
  NO_CACHE,
} from "../../../lib/breakTime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCaliforniaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CALIFORNIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// History is NEVER deleted. A reset only stores the moment
// from which the current 8 AM window starts counting again.
async function ensureResetTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS break_limit_resets (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NULL,
      reset_date DATE NOT NULL,
      reset_at DATETIME NOT NULL,
      created_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_user_date (user_id, reset_date),
      KEY idx_reset_date (reset_date),
      KEY idx_reset_at (reset_at)
    )
  `);
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (auth.error) return auth.error;

    if (!isAdmin(auth.user)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const admin = auth.user;

    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const resetAll = body?.all === true || body?.all === "true";

    let targetUserId = null;

    if (!resetAll) {
      const numericUserId = Number(body?.user_id);

      if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
        return NextResponse.json(
          { success: false, message: "Provide all=true or a valid user_id" },
          { status: 400 }
        );
      }

      targetUserId = numericUserId;

      const [users] = await pool.query(
        `SELECT id FROM users WHERE id = ? LIMIT 1`,
        [targetUserId]
      );

      if (!users || users.length === 0) {
        return NextResponse.json(
          { success: false, message: "Employee not found" },
          { status: 404 }
        );
      }
    }

    await ensureResetTable();

    const californiaDate = getCaliforniaDate();
    const resetAt = new Date();

    await pool.query(
      `
        INSERT INTO break_limit_resets
          (user_id, reset_date, reset_at, created_by)
        VALUES (?, ?, ?, ?)
      `,
      [
        resetAll ? null : targetUserId,
        californiaDate,
        dateToMySQLUtc(resetAt), // UTC
        admin.id,
      ]
    );

    // what the employee will see right now
    let usage = null;

    if (!resetAll) {
      try {
        usage = await getUsageForUser(targetUserId, pool);
      } catch (error) {
        console.error("RESET USAGE ERROR:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: resetAll
          ? "Break limit reset successfully for all employees."
          : "Break limit reset successfully for the selected employee.",
        reset: {
          all: resetAll,
          user_id: targetUserId,
          california_date: californiaDate,
          reset_at: resetAt.toISOString(),
          timezone: CALIFORNIA_TIMEZONE,
          daily_limit: 5,
          limits: { namaz: 1, lunch: 1, short_break: 3 },
        },
        break_usage: usage?.usage || null,
        created_by: { id: admin.id, name: admin.name, email: admin.email },
      },
      { status: 200, headers: NO_CACHE }
    );
  } catch (error) {
    console.error("BREAK LIMIT RESET API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset break limit.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
