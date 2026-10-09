// src/app/api/admin/other-users-task-daily/route.js

import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { getTaskAuthenticatedUser } from "../../../../lib/adminTaskAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEZONE = "America/Los_Angeles";

const STATUSES = [
  "Active",
  "Pending",
  "Called",
  "In Progress",
  "Completed",
  "Cancelled",
];

const SELECT_TASK_FIELDS = `
  SELECT
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
`;

function jsonError(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

// California operational day starts at 8:00 AM.
// Before 8:00 AM, use the previous operational date.
function getOperationalDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  let result = `${values.year}-${values.month}-${values.day}`;

  if (Number(values.hour) < 8) {
    const previousDate = new Date(`${result}T12:00:00.000Z`);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    result = previousDate.toISOString().slice(0, 10);
  }

  return result;
}

function validDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function validId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function authorizeAdmin() {
  try {
    const auth = await getTaskAuthenticatedUser();

    if (auth?.error) {
      return {
        response: jsonError(
          auth.error,
          Number(auth.status) || 401
        ),
      };
    }

    const user = auth?.user;

    const role = String(user?.role || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ");

    const allowedRoles = [
      "admin",
      "super admin",
      "admin hr",
    ];

    if (!user || !allowedRoles.includes(role)) {
      return {
        response: jsonError("Admin access required.", 403),
      };
    }

    return { user };
  } catch (error) {
    console.error("Task admin authorization error:", error);

    return {
      response: jsonError("Authentication failed.", 401),
    };
  }
}

async function userExists(userId) {
  const [users] = await db.query(
    "SELECT id FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  return users.length > 0;
}

// ======================================================
// GET /api/admin/other-users-task-daily
//
// Optional query parameters:
// ?date=2026-10-09
// ?status=Pending
// ?assigned_to=12
// ?search=report
//
// Without date:
// Shows current operational-day tasks and unfinished
// tasks from previous operational dates.
// ======================================================

export async function GET(request) {
  try {
    const access = await authorizeAdmin();

    if (access.response) {
      return access.response;
    }

    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const status = (searchParams.get("status") || "").trim();
    const search = (searchParams.get("search") || "").trim();
    const assignedValue = searchParams.get("assigned_to");

    const today = getOperationalDate();

    let where = " WHERE 1 = 1 ";
    const params = [];

    if (date) {
      if (!validDate(date)) {
        return jsonError("Invalid date. Use YYYY-MM-DD.");
      }

      where += " AND task_date = ? ";
      params.push(date);
    } else {
      where += `
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
      `;

      params.push(today, today);
    }

    if (status && status !== "All") {
      if (!STATUSES.includes(status)) {
        return jsonError("Invalid status filter.");
      }

      where += " AND status = ? ";
      params.push(status);
    }

    if (search) {
      where += `
        AND (
          title LIKE ?
          OR description LIKE ?
          OR task_type LIKE ?
        )
      `;

      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (assignedValue && assignedValue !== "All") {
      const assignedId = validId(assignedValue);

      if (!assignedId) {
        return jsonError("Invalid assigned user ID.");
      }

      where += " AND assigned_to = ? ";
      params.push(assignedId);
    }

    const [tasks] = await db.query(
      `${SELECT_TASK_FIELDS}
       ${where}
       ORDER BY task_date DESC, created_at DESC`,
      params
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
    console.error("Admin daily tasks GET error:", error);

    return jsonError(
      "Failed to load tasks. Check the server terminal.",
      500
    );
  }
}

// ======================================================
// POST /api/admin/other-users-task-daily
// Create a new task.
// ======================================================

export async function POST(request) {
  try {
    const access = await authorizeAdmin();

    if (access.response) {
      return access.response;
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.");
    }

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const taskType = String(body.task_type || "Daily Task").trim();
    const status = String(body.status || "Pending").trim();
    const taskDate = body.task_date || getOperationalDate();

    let assignedTo = null;

    if (
      body.assigned_to !== undefined &&
      body.assigned_to !== null &&
      body.assigned_to !== ""
    ) {
      assignedTo = validId(body.assigned_to);

      if (!assignedTo) {
        return jsonError("Invalid assigned user ID.");
      }
    }

    if (!title) {
      return jsonError("Task title is required.");
    }

    if (title.length > 255) {
      return jsonError("Title cannot exceed 255 characters.");
    }

    if (!taskType || taskType.length > 100) {
      return jsonError(
        "Task type is required and cannot exceed 100 characters."
      );
    }

    if (!STATUSES.includes(status)) {
      return jsonError("Invalid task status.");
    }

    if (!validDate(taskDate)) {
      return jsonError("Invalid task date. Use YYYY-MM-DD.");
    }

    if (assignedTo !== null) {
      const exists = await userExists(assignedTo);

      if (!exists) {
        return jsonError("Assigned user was not found.", 404);
      }
    }

    const createdBy = validId(access.user.id);

    if (!createdBy) {
      return jsonError(
        "Authenticated admin ID is missing or invalid.",
        401
      );
    }

    const [result] = await db.query(
      `INSERT INTO admin_daily_tasks
        (
          title,
          description,
          task_type,
          status,
          assigned_to,
          task_date,
          created_by
        )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        taskType,
        status,
        assignedTo,
        taskDate,
        createdBy,
      ]
    );

    const [rows] = await db.query(
      `${SELECT_TASK_FIELDS} WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        task: rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin daily tasks POST error:", error);

    return jsonError(
      "Failed to create task. Check the database error in the terminal.",
      500
    );
  }
}

// ======================================================
// PATCH /api/admin/other-users-task-daily
//
// Body can contain:
// { id, title, description, task_type, status,
//   assigned_to, task_date }
// Only supplied fields are updated.
// ======================================================

export async function PATCH(request) {
  try {
    const access = await authorizeAdmin();

    if (access.response) {
      return access.response;
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request body.");
    }

    const id = validId(body.id);

    if (!id) {
      return jsonError("Valid task ID is required.");
    }

    const fields = [];
    const values = [];

    if (body.title !== undefined) {
      const title = String(body.title || "").trim();

      if (!title || title.length > 255) {
        return jsonError("Task title is required and must be 255 characters or less.");
      }

      fields.push("title = ?");
      values.push(title);
    }

    if (body.description !== undefined) {
      const description = String(body.description || "").trim();

      fields.push("description = ?");
      values.push(description || null);
    }

    if (body.task_type !== undefined) {
      const taskType = String(body.task_type || "").trim();

      if (!taskType || taskType.length > 100) {
        return jsonError("Invalid task type.");
      }

      fields.push("task_type = ?");
      values.push(taskType);
    }

    if (body.status !== undefined) {
      const status = String(body.status || "").trim();

      if (!STATUSES.includes(status)) {
        return jsonError("Invalid task status.");
      }

      fields.push("status = ?");
      values.push(status);
    }

    if (body.task_date !== undefined) {
      if (!validDate(body.task_date)) {
        return jsonError("Invalid task date. Use YYYY-MM-DD.");
      }

      fields.push("task_date = ?");
      values.push(body.task_date);
    }

    if (body.assigned_to !== undefined) {
      let assignedTo = null;

      if (body.assigned_to !== null && body.assigned_to !== "") {
        assignedTo = validId(body.assigned_to);

        if (!assignedTo) {
          return jsonError("Invalid assigned user ID.");
        }

        const exists = await userExists(assignedTo);

        if (!exists) {
          return jsonError("Assigned user was not found.", 404);
        }
      }

      fields.push("assigned_to = ?");
      values.push(assignedTo);
    }

    if (fields.length === 0) {
      return jsonError("No fields to update.");
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE admin_daily_tasks
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM admin_daily_tasks WHERE id = ? LIMIT 1",
        [id]
      );

      if (existing.length === 0) {
        return jsonError("Task not found.", 404);
      }
    }

    const [rows] = await db.query(
      `${SELECT_TASK_FIELDS} WHERE id = ? LIMIT 1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      task: rows[0],
    });
  } catch (error) {
    console.error("Admin daily tasks PATCH error:", error);

    return jsonError(
      "Failed to update task. Check the database error in the terminal.",
      500
    );
  }
}

// ======================================================
// DELETE /api/admin/other-users-task-daily?id=123
// ======================================================

export async function DELETE(request) {
  try {
    const access = await authorizeAdmin();

    if (access.response) {
      return access.response;
    }

    const { searchParams } = new URL(request.url);

    let id = validId(searchParams.get("id"));

    if (!id) {
      try {
        const body = await request.json();
        id = validId(body.id);
      } catch {
        // No valid JSON body; return the ID error below.
      }
    }

    if (!id) {
      return jsonError("Valid task ID is required.");
    }

    const [result] = await db.query(
      "DELETE FROM admin_daily_tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return jsonError("Task not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Admin daily tasks DELETE error:", error);

    return jsonError(
      "Failed to delete task. Check the server terminal.",
      500
    );
  }
}