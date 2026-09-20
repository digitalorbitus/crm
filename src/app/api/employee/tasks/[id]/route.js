
import { NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function PATCH(req, context) {
  const connection = await db.getConnection();

  try {
    // 1. Next.js 15+ Async params unwrap fix
    const { id } = await context.params;
    const assignmentId = id ? parseInt(id, 10) : null;

    const body = await req.json();

    const { status, comment } = body;

    // -----------------------------------------
    // Validate Status
    // -----------------------------------------

    if (!status) {
      return NextResponse.json(
        {
          error: "Status is required",
        },
        {
          status: 400,
        }
      );
    }

    await connection.beginTransaction();

    // -----------------------------------------
    // 1. Fetch Current Assignment
    // -----------------------------------------

    const [assignmentRows] =
      await connection.execute(
        `
          SELECT id, task_id
          FROM daily_assignments
          WHERE id = ?
        `,
        [assignmentId]
      );

    if (!assignmentRows.length) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Assignment record not found",
        },
        {
          status: 404,
        }
      );
    }

    const taskId = assignmentRows[0].task_id;

    // -----------------------------------------
    // 2. Get Status Configuration
    // -----------------------------------------

    const [statusConfig] =
      await connection.execute(
        `
          SELECT is_locking_status
          FROM status_configs
          WHERE status_name = ?
          LIMIT 1
        `,
        [status]
      );

    const isLocking =
      statusConfig.length > 0
        ? Boolean(
          statusConfig[0].is_locking_status
        )
        : false;

    // -----------------------------------------
    // 3. Update Daily Assignment
    // -----------------------------------------

    await connection.execute(
      `
        UPDATE daily_assignments
        SET
          status = ?,
          comment = ?,
          is_completed = TRUE,
          updated_at = NOW()
        WHERE id = ?
      `,
      [
        status,
        comment || null,
        assignmentId,
      ]
    );

    // -----------------------------------------
    // 4. Update Master Task
    // -----------------------------------------

    await connection.execute(
      `
        UPDATE master_tasks
        SET
          current_status = ?,
          is_locked = ?
        WHERE id = ?
      `,
      [
        status,
        isLocking,
        taskId,
      ]
    );

    // -----------------------------------------
    // 5. Commit
    // -----------------------------------------

    await connection.commit();

    // -----------------------------------------
    // Success Response
    // -----------------------------------------

    return NextResponse.json(
      {
        message: "Task updated successfully",
        assignmentId,
        taskId,
        status,
        isLocked: isLocking,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // -----------------------------------------
    // Rollback
    // -----------------------------------------

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "Rollback Error:",
        rollbackError
      );
    }

    console.error(
      "Update Task Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  } finally {
    // -----------------------------------------
    // Release Connection
    // -----------------------------------------

    connection.release();
  }
}