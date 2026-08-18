

// import { NextResponse } from "next/server";
// import pool from "../../../../lib/db";

// export async function POST(request) {
//   const connection = await pool.getConnection();

//   try {
//     const body = await request.json();

//     const {
//       numbers = [],
//       selectedStaff = [],
//       distribution = "equal",
//       sourceFile = null,
//     } = body;

//     // Validation
//     if (!numbers.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Numbers nahi mile.",
//         },
//         { status: 400 }
//       );
//     }

//     if (!selectedStaff.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Staff select nahi kiya gaya.",
//         },
//         { status: 400 }
//       );
//     }

//     await connection.beginTransaction();

//     let tasksSaved = 0;
//     let assignmentsSaved = 0;

//     for (let index = 0; index < numbers.length; index++) {
//       const item = numbers[index];

//       // Staff distribution
//       const staffId =
//         selectedStaff[index % selectedStaff.length];

//       // ==========================================
//       // 1. SAVE TASK
//       // ==========================================

//       const [taskResult] = await connection.execute(
//         `
//         INSERT INTO daily_desk_tasks
//         (
//           task_id,
//           phone,
//           source_file,
//           task_date
//         )
//         VALUES (?, ?, ?, CURDATE())
//         `,
//         [
//           item.taskId,
//           item.phone,
//           sourceFile,
//         ]
//       );

//       const taskDatabaseId = taskResult.insertId;

//       tasksSaved++;

//       // ==========================================
//       // 2. SAVE ASSIGNMENT
//       // ==========================================

//       await connection.execute(
//         `
//         INSERT INTO daily_desk_assignments
//         (
//           task_id,
//           staff_id,
//           assigned_date,
//           status
//         )
//         VALUES (?, ?, CURDATE(), 'Pending')
//         `,
//         [
//           taskDatabaseId,
//           staffId,
//         ]
//       );

//       assignmentsSaved++;
//     }

//     await connection.commit();

//     return NextResponse.json({
//       success: true,
//       message: "Daily Desk tasks successfully saved.",
//       data: {
//         tasksSaved,
//         assignmentsSaved,
//         staffCount: selectedStaff.length,
//         distribution,
//       },
//     });

//   } catch (error) {
//     await connection.rollback();

//     console.error(
//       "DAILY DESK DATABASE ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error.message ||
//           "Database mein data save nahi ho saka.",
//       },
//       { status: 500 }
//     );

//   } finally {
//     connection.release();
//   }
// }

import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// =====================================================
// 1. GET API (Date Wise Data Fetching)
// =====================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Target Date e.g. '2026-08-18'

    if (!dateParam) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Date parameter required hai (e.g. ?date=YYYY-MM-DD)." 
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `
      SELECT 
        dda.id AS assignment_id,
        ddt.task_id AS taskId,
        ddt.phone,
        ddt.source_file AS sourceFile,
        u.id AS staffId,
        u.name AS staffName,
        u.email AS staffEmail,
        dda.assigned_date AS assignedDate,
        dda.assigned_at AS assignedAt,
        dda.completed_at AS completedAt,
        dda.status
      FROM daily_desk_assignments dda
      INNER JOIN daily_desk_tasks ddt 
        ON dda.task_id = ddt.id
      INNER JOIN users u 
        ON dda.staff_id = u.id
      WHERE dda.assigned_date = ?
      ORDER BY dda.assigned_at DESC
      `,
      [dateParam]
    );

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows,
    });

  } catch (error) {
    console.error("DAILY DESK HISTORY FETCH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Database se data fetch nahi ho saka.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// 2. POST API (Aapka Existing Assign/Save Tasks Code)
// =====================================================
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
