// import { NextResponse } from "next/server";
// import db from "../../lib/db";

// export async function GET() {
//   try {
//     const [history] = await db.execute(`
//       SELECT
//         lh.id,
//         u.id AS user_id,
//         u.name,
//         u.email,
//         u.role,
//         u.team,
//         lh.login_time,
//         lh.logout_time,
//         lh.ip_address,
//         lh.user_agent
//       FROM login_history lh
//       INNER JOIN users u
//         ON lh.user_id = u.id
//       ORDER BY lh.login_time DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       history,
//     });
//   } catch (error) {
//     console.error("LOGIN HISTORY ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch login history",
//       },
//       { status: 500 }
//     );
//   }
// }







import { NextResponse } from "next/server";
import db from "../../lib/db";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Fetch all login history records
*/
export async function GET() {
  try {
    const [history] = await db.execute(`
      SELECT 
        lh.id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.team,
        lh.login_time,
        lh.logout_time,
        lh.ip_address,
        lh.user_agent
      FROM login_history lh
      INNER JOIN users u 
        ON lh.user_id = u.id
      ORDER BY lh.login_time DESC
    `);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("LOGIN HISTORY GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch login history",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Create new attendance/login-history record
|--------------------------------------------------------------------------
| Body:
| {
|   user_id: 7,
|   login_time: "2026-09-12 09:00:00",
|   logout_time: "2026-09-12 18:00:00",
|   ip_address: null,
|   user_agent: null
| }
*/
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      user_id,
      login_time,
      logout_time = null,
      ip_address = null,
      user_agent = null,
    } = body;

    // Validate user_id
    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "user_id is required",
        },
        { status: 400 }
      );
    }

    // Validate login time
    if (!login_time) {
      return NextResponse.json(
        {
          success: false,
          message: "login_time is required",
        },
        { status: 400 }
      );
    }

    // Check user exists
    const [users] = await db.execute(
      `
      SELECT id, name, email, role, team
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [user_id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Insert attendance
    const [result] = await db.execute(
      `
      INSERT INTO login_history
      (
        user_id,
        login_time,
        logout_time,
        ip_address,
        user_agent
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        user_id,
        login_time,
        logout_time,
        ip_address,
        user_agent,
      ]
    );

    // Get newly created record with employee information
    const [newRecord] = await db.execute(
      `
      SELECT 
        lh.id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.team,
        lh.login_time,
        lh.logout_time,
        lh.ip_address,
        lh.user_agent
      FROM login_history lh
      INNER JOIN users u
        ON lh.user_id = u.id
      WHERE lh.id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Attendance added successfully",
        record: newRecord[0] || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("LOGIN HISTORY POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to add attendance",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
| Update existing attendance/login-history record
|--------------------------------------------------------------------------
| Body:
| {
|   id: 116,
|   user_id: 7,
|   login_time: "2026-09-12 09:20:00",
|   logout_time: "2026-09-12 18:30:00"
| }
*/
export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      id,
      user_id,
      login_time,
      logout_time,
      ip_address,
      user_agent,
    } = body;

    // Validate ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record id is required",
        },
        { status: 400 }
      );
    }

    // Check existing attendance
    const [existing] = await db.execute(
      `
      SELECT id
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    // If user_id is being changed, verify user exists
    if (user_id !== undefined && user_id !== null) {
      const [users] = await db.execute(
        `
        SELECT id
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [user_id]
      );

      if (users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected user does not exist",
          },
          { status: 404 }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Dynamic UPDATE
    |--------------------------------------------------------------------------
    | Only fields sent by frontend will be updated.
    */
    const updates = [];
    const values = [];

    if (user_id !== undefined) {
      updates.push("user_id = ?");
      values.push(user_id);
    }

    if (login_time !== undefined) {
      updates.push("login_time = ?");
      values.push(login_time);
    }

    if (logout_time !== undefined) {
      updates.push("logout_time = ?");
      values.push(logout_time);
    }

    if (ip_address !== undefined) {
      updates.push("ip_address = ?");
      values.push(ip_address);
    }

    if (user_agent !== undefined) {
      updates.push("user_agent = ?");
      values.push(user_agent);
    }

    // Nothing to update
    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No fields provided for update",
        },
        { status: 400 }
      );
    }

    values.push(id);

    await db.execute(
      `
      UPDATE login_history
      SET ${updates.join(", ")}
      WHERE id = ?
      `,
      values
    );

    // Fetch updated record
    const [updated] = await db.execute(
      `
      SELECT 
        lh.id,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.team,
        lh.login_time,
        lh.logout_time,
        lh.ip_address,
        lh.user_agent
      FROM login_history lh
      INNER JOIN users u
        ON lh.user_id = u.id
      WHERE lh.id = ?
      LIMIT 1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      record: updated[0] || null,
    });
  } catch (error) {
    console.error("LOGIN HISTORY PUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update attendance",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| Delete attendance/login-history record
|--------------------------------------------------------------------------
| /api/login-history?id=116
|--------------------------------------------------------------------------
*/
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record id is required",
        },
        { status: 400 }
      );
    }

    // Check record exists
    const [existing] = await db.execute(
      `
      SELECT id
      FROM login_history
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Attendance record not found",
        },
        { status: 404 }
      );
    }

    // Delete
    await db.execute(
      `
      DELETE FROM login_history
      WHERE id = ?
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Attendance deleted successfully",
      deleted_id: Number(id),
    });
  } catch (error) {
    console.error("LOGIN HISTORY DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete attendance",
      },
      { status: 500 }
    );
  }
}