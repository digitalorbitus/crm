
import { NextResponse } from "next/server";
import db from "../../lib/db";
import { getTaskAuthenticatedUser } from "../../../lib/adminTaskAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = [
  "Active",
  "Pending",
  "Called",
  "In Progress",
  "Completed",
  "Cancelled",
];

const TIMEZONE = "America/Los_Angeles";

function errorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function getOperationalDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  let date = `${values.year}-${values.month}-${values.day}`;

  if (Number(values.hour) < 8) {
    const previous = new Date(`${date}T12:00:00.000Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    date = previous.toISOString().slice(0, 10);
  }

  return date;
}

async function getUser() {
  const auth = await getTaskAuthenticatedUser();

  if (auth?.error) {
    return {
      error: auth.error,
      status: Number(auth.status) || 401,
    };
  }

  if (!auth?.user?.id) {
    return { error: "Please log in again.", status: 401 };
  }

  return { user: auth.user };
}

// GET /api/other-users-task-daily
export async function GET() {
  try {
    const auth = await getUser();

    if (auth.error) {
      return errorResponse(auth.error, auth.status);
    }

    const today = getOperationalDate();

    const [tasks] = await db.query(
      `SELECT
         id,
         title,
         description,
         task_type,
         status,
         assigned_to,
         task_date,
         attachment_name,
         attachment_path,
         created_by,
         created_at,
         updated_at
       FROM admin_daily_tasks
       WHERE assigned_to = ?
         AND (
           task_date = ?
           OR (
             task_date < ?
             AND status IN (
               'Active',
               'Pending',
               'Called',
               'In Progress'
             )
           )
         )
       ORDER BY task_date DESC, created_at DESC`,
      [auth.user.id, today, today]
    );

    return NextResponse.json(
      {
        success: true,
        tasks,
        operational_date: today,
        timezone: TIMEZONE,
        operational_day_starts_at: "08:00",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Staff daily tasks GET error:", error);

    return errorResponse("Failed to load your tasks.", 500);
  }
}

// PATCH /api/other-users-task-daily
// Body: { id: 123, status: "Completed" }
export async function PATCH(request) {
  try {
    const auth = await getUser();

    if (auth.error) {
      return errorResponse(auth.error, auth.status);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.");
    }

    const id = Number(body.id);
    const status = String(body.status || "").trim();

    if (!Number.isSafeInteger(id) || id <= 0) {
      return errorResponse("Valid task ID is required.");
    }

    if (!STATUSES.includes(status)) {
      return errorResponse("Invalid task status.");
    }

    const [result] = await db.query(
      `UPDATE admin_daily_tasks
       SET status = ?
       WHERE id = ?
         AND assigned_to = ?`,
      [status, id, auth.user.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        `SELECT id
         FROM admin_daily_tasks
         WHERE id = ? AND assigned_to = ?
         LIMIT 1`,
        [id, auth.user.id]
      );

      if (!rows.length) {
        return errorResponse(
          "Task not found or not assigned to you.",
          404
        );
      }
    }

    const [tasks] = await db.query(
      `SELECT
         id,
         title,
         description,
         task_type,
         status,
         assigned_to,
         task_date,
         attachment_name,
         attachment_path,
         created_by,
         created_at,
         updated_at
       FROM admin_daily_tasks
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Task status updated successfully.",
      task: tasks[0],
    });
  } catch (error) {
    console.error("Staff daily tasks PATCH error:", error);

    return errorResponse("Failed to update task status.", 500);
  }
}