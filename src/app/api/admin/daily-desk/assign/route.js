// import { NextResponse } from "next/server";
// import db from "../../../../lib/db";

// export async function POST(request) {
//   let connection;

//   try {
//     const body = await request.json();

//     const {
//       numbers,
//       selectedStaff,
//       distribution = "equal",
//       sourceFile = null,
//     } = body;

//     // ==========================================
//     // VALIDATION
//     // ==========================================

//     if (!Array.isArray(numbers) || numbers.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No phone numbers found.",
//         },
//         { status: 400 }
//       );
//     }

//     if (!Array.isArray(selectedStaff) || selectedStaff.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Please select at least one staff member.",
//         },
//         { status: 400 }
//       );
//     }

//     // ==========================================
//     // DATABASE CONNECTION
//     // ==========================================

//     connection = await db.getConnection();

//     await connection.beginTransaction();

//     // ==========================================
//     // CHECK STAFF
//     // ==========================================

//     const placeholders = selectedStaff.map(() => "?").join(",");

//     const [staffRows] = await connection.execute(
//       `
//       SELECT id, name, email, role, status
//       FROM users
//       WHERE id IN (${placeholders})
//       `,
//       selectedStaff
//     );

//     if (staffRows.length !== selectedStaff.length) {
//       await connection.rollback();

//       return NextResponse.json(
//         {
//           success: false,
//           message: "One or more selected staff members do not exist.",
//         },
//         { status: 400 }
//       );
//     }

//     // ==========================================
//     // TODAY DATE
//     // ==========================================

//     const today = new Date().toISOString().slice(0, 10);

//     let savedTasks = 0;
//     let savedAssignments = 0;

//     // ==========================================
//     // SAVE EVERY EXCEL RECORD
//     // ==========================================

//     for (let index = 0; index < numbers.length; index++) {
//       const item = numbers[index];

//       const phone = String(item.phone || "").trim();

//       if (!phone) {
//         continue;
//       }

//       const taskId =
//         String(item.taskId || "").trim() ||
//         `TSK-${Date.now()}-${index}`;

//       // ========================================
//       // SAVE TASK
//       // ========================================

//       const [taskResult] = await connection.execute(
//         `
//         INSERT INTO daily_desk_tasks
//         (
//           task_id,
//           phone,
//           source_file,
//           task_date
//         )
//         VALUES (?, ?, ?, ?)
//         `,
//         [
//           taskId,
//           phone,
//           sourceFile,
//           today,
//         ]
//       );

//       const taskDatabaseId = taskResult.insertId;

//       savedTasks++;

//       // ========================================
//       // STAFF DISTRIBUTION
//       // ========================================

//       let staffIndex;

//       if (distribution === "round") {
//         // Round Robin
//         staffIndex = index % selectedStaff.length;
//       } else {
//         // Equal distribution
//         // Sequential distribution is also balanced
//         staffIndex = index % selectedStaff.length;
//       }

//       const staffId = selectedStaff[staffIndex];

//       // ========================================
//       // SAVE ASSIGNMENT
//       // ========================================

//       await connection.execute(
//         `
//         INSERT INTO daily_desk_assignments
//         (
//           task_id,
//           staff_id,
//           assigned_date,
//           status
//         )
//         VALUES (?, ?, ?, 'Pending')
//         `,
//         [
//           taskDatabaseId,
//           staffId,
//           today,
//         ]
//       );

//       savedAssignments++;
//     }

//     // ==========================================
//     // COMMIT
//     // ==========================================

//     await connection.commit();

//     return NextResponse.json({
//       success: true,
//       message: "Daily Desk tasks assigned successfully.",
//       data: {
//         tasksSaved: savedTasks,
//         assignmentsSaved: savedAssignments,
//         staffCount: selectedStaff.length,
//         date: today,
//       },
//     });

//   } catch (error) {
//     console.error("DAILY DESK ASSIGN ERROR:", error);

//     if (connection) {
//       try {
//         await connection.rollback();
//       } catch (rollbackError) {
//         console.error("ROLLBACK ERROR:", rollbackError);
//       }
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to assign Daily Desk tasks.",
//       },
//       { status: 500 }
//     );
//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(request) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const {
      numbers = [],
      selectedStaff = [],
      distribution = "equal",
      sourceFile = null,
    } = body;

    // Validation
    if (!numbers.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Numbers nahi mile.",
        },
        { status: 400 }
      );
    }

    if (!selectedStaff.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff select nahi kiya gaya.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    let tasksSaved = 0;
    let assignmentsSaved = 0;

    for (let index = 0; index < numbers.length; index++) {
      const item = numbers[index];

      // Staff distribution
      const staffId =
        selectedStaff[index % selectedStaff.length];

      // ==========================================
      // 1. SAVE TASK
      // ==========================================

      const [taskResult] = await connection.execute(
        `
        INSERT INTO daily_desk_tasks
        (
          task_id,
          phone,
          source_file,
          task_date
        )
        VALUES (?, ?, ?, CURDATE())
        `,
        [
          item.taskId,
          item.phone,
          sourceFile,
        ]
      );

      const taskDatabaseId = taskResult.insertId;

      tasksSaved++;

      // ==========================================
      // 2. SAVE ASSIGNMENT
      // ==========================================

      await connection.execute(
        `
        INSERT INTO daily_desk_assignments
        (
          task_id,
          staff_id,
          assigned_date,
          status
        )
        VALUES (?, ?, CURDATE(), 'Pending')
        `,
        [
          taskDatabaseId,
          staffId,
        ]
      );

      assignmentsSaved++;
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Daily Desk tasks successfully saved.",
      data: {
        tasksSaved,
        assignmentsSaved,
        staffCount: selectedStaff.length,
        distribution,
      },
    });

  } catch (error) {
    await connection.rollback();

    console.error(
      "DAILY DESK DATABASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Database mein data save nahi ho saka.",
      },
      { status: 500 }
    );

  } finally {
    connection.release();
  }
}