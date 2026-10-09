// app/api/admin/break-history/[id]/route.js
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import {
  ALL_BREAK_STATUSES,
  getAuthenticatedUser,
  isAdmin,
  getUsageForUser,
  dateToCaliforniaDB,
  dateToMySQLUtc,
  normalizeBreakStatus,
  resolveTimes,
  NO_CACHE,
} from "../../../../lib/breakTime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readId(context) {
  // works for Next 14 (object) and Next 15 (promise)
  const params = await context?.params;
  const id = Number(params?.id);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function adminOnly(user) {
  if (isAdmin(user)) return null;

  return NextResponse.json(
    { success: false, message: "Admin access required." },
    { status: 403 }
  );
}

// ======================================================
// PUT  (admin edits a break)
// ======================================================

export async function PUT(request, context) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (auth.error) return auth.error;

    const denied = adminOnly(auth.user);

    if (denied) return denied;

    const id = await readId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid break id." },
        { status: 400 }
      );
    }

    const [existingRows] = await pool.query(
      `SELECT id, user_id FROM user_status_history WHERE id = ? LIMIT 1`,
      [id]
    );

    const existing = existingRows?.[0];

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Break record not found." },
        { status: 404 }
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

    // USER (employee cannot be changed in the UI, but keep it valid)
    const userId = Number(body?.user_id ?? existing.user_id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user_id." },
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

    await pool.query(
      `
        UPDATE user_status_history
        SET
          user_id = ?,
          status = ?,
          started_at = ?,
          ended_at = ?,
          duration_seconds = ?,
          created_at = ?
        WHERE id = ?
        LIMIT 1
      `,
      [
        userId,
        status,
        dateToCaliforniaDB(startedDate), // California
        endedDate ? dateToCaliforniaDB(endedDate) : null, // California
        durationSeconds,
        dateToMySQLUtc(startedDate), // UTC (GET reads this)
        id,
      ]
    );

    let usage = null;

    try {
      usage = await getUsageForUser(userId, pool);
    } catch (error) {
      console.error("PUT USAGE ERROR:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Break updated successfully.",
        id,
        break_usage: usage?.usage || null,
        usage,
      },
      { status: 200, headers: NO_CACHE }
    );
  } catch (error) {
    console.error("BREAK HISTORY PUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update break.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE  (admin deletes a break)
// ======================================================

export async function DELETE(request, context) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (auth.error) return auth.error;

    const denied = adminOnly(auth.user);

    if (denied) return denied;

    const id = await readId(context);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid break id." },
        { status: 400 }
      );
    }

    const [existingRows] = await pool.query(
      `SELECT id, user_id FROM user_status_history WHERE id = ? LIMIT 1`,
      [id]
    );

    const existing = existingRows?.[0];

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Break record not found." },
        { status: 404 }
      );
    }

    await pool.query(
      `DELETE FROM user_status_history WHERE id = ? LIMIT 1`,
      [id]
    );

    let usage = null;

    try {
      usage = await getUsageForUser(existing.user_id, pool);
    } catch (error) {
      console.error("DELETE USAGE ERROR:", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Break deleted successfully.",
        id,
        break_usage: usage?.usage || null,
        usage,
      },
      { status: 200, headers: NO_CACHE }
    );
  } catch (error) {
    console.error("BREAK HISTORY DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete break.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
