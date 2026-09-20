import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
    let connection;

    try {
        connection = await db.getConnection();
        const body = await req.json();

        const { title, selectedEmployees, csvData } = body;

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Login required" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const createdBy = decoded.id || decoded._id || decoded.userId || null;

        if (!createdBy) {
            return NextResponse.json(
                { success: false, message: "User ID not found" },
                { status: 401 }
            );
        }

        if (
            !csvData ||
            !Array.isArray(csvData) ||
            csvData.length === 0 ||
            !selectedEmployees ||
            !Array.isArray(selectedEmployees) ||
            selectedEmployees.length === 0
        ) {
            return NextResponse.json(
                { error: "Missing required fields or empty sheet" },
                { status: 400 }
            );
        }

        // Validate total tasks against minimum needed for 500 per employee
        const requiredTasks = selectedEmployees.length * 500;
        if (csvData.length < requiredTasks) {
            return NextResponse.json(
                { 
                  error: `Sheet must contain at least ${requiredTasks} tasks for ${selectedEmployees.length} employees (500 each). Provided: ${csvData.length}` 
                },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        // 1. Create Task Pool
        const [poolResult] = await connection.execute(
            `INSERT INTO task_pools (title, total_records, created_by) VALUES (?, ?, ?)`,
            [title || "Task Pool", csvData.length, createdBy]
        );
        const poolId = poolResult.insertId;

        // 2. Insert Master Tasks
        const masterTaskValues = [];
        csvData.forEach((row, index) => {
            masterTaskValues.push([
                poolId,
                index + 1, // Sequence No (1, 2, 3...)
                row.date || null,
                row.name || "",
                row.phoneNumber || "",
                row.businessName || ""
            ]);
        });

        if (masterTaskValues.length > 0) {
            await connection.query(
                `INSERT INTO master_tasks 
                 (pool_id, sequence_no, task_date, name, phone_number, business_name) 
                 VALUES ?`,
                [masterTaskValues]
            );
        }

        // 3. Fetch Master Tasks
        const [masterTasks] = await connection.execute(
            `SELECT id, sequence_no FROM master_tasks WHERE pool_id = ? ORDER BY sequence_no ASC`,
            [poolId]
        );

        // Operational Date (Current Shift Date)
        const todayStr = new Date().toISOString().split("T")[0];

        // 4. Exact 500 Tasks Per Employee
        const dailyAssignmentsValues = [];
        const FIXED_LIMIT = 500;

        selectedEmployees.forEach((empId, empIndex) => {
            const startIdx = empIndex * FIXED_LIMIT;
            const endIdx = startIdx + FIXED_LIMIT;

            const employeeTasks = masterTasks.slice(startIdx, endIdx);

            employeeTasks.forEach((task) => {
                dailyAssignmentsValues.push([
                    todayStr,
                    task.id,
                    empId,
                    "PENDING",
                    false
                ]);
            });
        });

        // 5. Insert Daily Assignments
        if (dailyAssignmentsValues.length > 0) {
            await connection.query(
                `INSERT INTO daily_assignments 
                 (assignment_date, task_id, employee_id, status, is_completed) 
                 VALUES ?`,
                [dailyAssignmentsValues]
            );
        }

        await connection.commit();

        return NextResponse.json(
            {
                message: "Task pool created with exact 500 tasks per employee",
                poolId,
                totalAssigned: dailyAssignmentsValues.length
            },
            { status: 201 }
        );

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("API Error:", error);
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}






// import { NextResponse } from "next/server";
// import db from "../../../lib/db";
// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";


// export async function POST(req) {
//     let connection;

//     try {
//         connection = await db.getConnection();

//         const body = await req.json();

//         const {
//             title,
//             selectedEmployees,
//             csvData,
//         } = body;

//         console.log("Body: ", body)

//         const cookieStore = await cookies()
//         const token = cookieStore.get("token")?.value;

//         if (!token) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Login required",
//                 },
//                 { status: 401 }
//             );
//         }

//         // ==================================================
//         // VERIFY TOKEN
//         // ==================================================
//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         console.log(decoded, "decoded")

//         const createdBy =
//             decoded.id ||
//             decoded._id ||
//             decoded.userId ||
//             null;

//         if (!createdBy) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "User ID not found",
//                 },
//                 { status: 401 }
//             );
//         }


//         // Validate required fields
//         if (
//             !csvData ||
//             !Array.isArray(csvData) ||
//             csvData.length === 0 ||
//             !selectedEmployees ||
//             !Array.isArray(selectedEmployees) ||
//             selectedEmployees.length === 0
//         ) {
//             return NextResponse.json(
//                 {
//                     error: "Missing required fields or empty sheet",
//                 },
//                 { status: 400 }
//             );
//         }

//         await connection.beginTransaction();

//         // --------------------------------------------------
//         // 1. Create Task Pool
//         // --------------------------------------------------

//         const [poolResult] = await connection.execute(
//             `
//         INSERT INTO task_pools
//         (title, total_records, created_by)
//         VALUES (?, ?, ?)
//       `,
//             [
//                 title || "Task Pool",
//                 csvData.length,
//                 createdBy,
//             ]
//         );

//         const poolId = poolResult.insertId;

//         // --------------------------------------------------
//         // 2. Insert Master Tasks
//         // --------------------------------------------------

//         const masterTaskValues = [];

//         csvData.forEach((row, index) => {
//             masterTaskValues.push([
//                 poolId,
//                 index + 1,
//                 row.date || null,
//                 row.name || "",
//                 row.phoneNumber || "",
//                 row.businessName || "",
//             ]);
//         });

//         if (masterTaskValues.length > 0) {
//             await connection.query(
//                 `
//           INSERT INTO master_tasks
//           (
//             pool_id,
//             sequence_no,
//             task_date,
//             name,
//             phone_number,
//             business_name
//           )
//           VALUES ?
//         `,
//                 [masterTaskValues]
//             );
//         }

//         // --------------------------------------------------
//         // 3. Get Inserted Master Tasks
//         // --------------------------------------------------

//         const [masterTasks] = await connection.execute(
//             `
//         SELECT id, sequence_no
//         FROM master_tasks
//         WHERE pool_id = ?
//         ORDER BY sequence_no ASC
//       `,
//             [poolId]
//         );

//         // --------------------------------------------------
//         // 4. Divide Tasks Equally Among Employees
//         // --------------------------------------------------

//         const totalTasks = masterTasks.length;
//         const totalEmployees = selectedEmployees.length;

//         const chunkSize = Math.ceil(
//             totalTasks / totalEmployees
//         );

//         // Current date: YYYY-MM-DD
//         const todayStr = new Date()
//             .toISOString()
//             .split("T")[0];

//         const dailyAssignmentsValues = [];

//         selectedEmployees.forEach((empId, empIndex) => {
//             const startIdx = empIndex * chunkSize;

//             const endIdx = Math.min(
//                 startIdx + chunkSize,
//                 totalTasks
//             );

//             const employeeTasks = masterTasks.slice(
//                 startIdx,
//                 endIdx
//             );

//             employeeTasks.forEach((task) => {
//                 dailyAssignmentsValues.push([
//                     todayStr,
//                     task.id,
//                     empId,
//                     "PENDING",
//                     false,
//                 ]);
//             });
//         });

//         // --------------------------------------------------
//         // 5. Insert Daily Assignments
//         // --------------------------------------------------

//         if (dailyAssignmentsValues.length > 0) {
//             await connection.query(
//                 `
//           INSERT INTO daily_assignments
//           (
//             assignment_date,
//             task_id,
//             employee_id,
//             status,
//             is_completed
//           )
//           VALUES ?
//         `,
//                 [dailyAssignmentsValues]
//             );
//         }

//         // --------------------------------------------------
//         // 6. Commit Transaction
//         // --------------------------------------------------

//         await connection.commit();

//         return NextResponse.json(
//             {
//                 message:
//                     "Task pool created and initial distribution completed successfully",
//                 poolId,
//                 totalAssigned: masterTasks.length,
//             },
//             { status: 201 }
//         );
//     } catch (error) {
//         // Rollback if transaction started
//         if (connection) {
//             try {
//                 await connection.rollback();
//             } catch (rollbackError) {
//                 console.error(
//                     "Rollback error:",
//                     rollbackError
//                 );
//             }
//         }

//         console.error(
//             "Create Task Pool API Error:",
//             error
//         );

//         return NextResponse.json(
//             {
//                 error:
//                     error?.message ||
//                     "Internal server error",
//             },
//             { status: 500 }
//         );
//     } finally {
//         if (connection) {
//             connection.release();
//         }
//     }
// }
