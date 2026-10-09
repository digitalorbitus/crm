
import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import { requireTaskAdmin } from "../../../../../lib/adminTaskAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// GET: List task types
export async function GET() {
  try {
    const auth = await requireTaskAdmin();

    if (auth.error) {
      return errorResponse(auth.error, auth.status);
    }

    const [rows] = await db.query(
      `SELECT id, name, created_at
       FROM admin_daily_task_types
       ORDER BY name ASC`
    );

    return NextResponse.json(
      { success: true, types: rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Task types GET error:", error);
    return errorResponse("Failed to load task types", 500);
  }
}

// POST: Add a custom task type
export async function POST(request) {
  try {
    const auth = await requireTaskAdmin();

    if (auth.error) {
      return errorResponse(auth.error, auth.status);
    }

    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return errorResponse("Task type name is required");
    }

    if (name.length > 100) {
      return errorResponse("Task type must be 100 characters or fewer");
    }

    const [result] = await db.query(
      `INSERT INTO admin_daily_task_types (name)
       VALUES (?)`,
      [name]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task type added",
        id: result.insertId,
        name,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return errorResponse("This task type already exists", 409);
    }

    console.error("Task types POST error:", error);
    return errorResponse("Failed to add task type", 500);
  }
}

// DELETE: Remove a task type by ID
export async function DELETE(request) {
  try {
    const auth = await requireTaskAdmin();

    if (auth.error) {
      return errorResponse(auth.error, auth.status);
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isSafeInteger(id) || id <= 0) {
      return errorResponse("Valid task type ID is required");
    }

    const [result] = await db.query(
      `DELETE FROM admin_daily_task_types
       WHERE id = ?`,
      [id]
    );

    if (!result.affectedRows) {
      return errorResponse("Task type not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Task type deleted",
    });
  } catch (error) {
    console.error("Task types DELETE error:", error);
    return errorResponse("Failed to delete task type", 500);
  }
}