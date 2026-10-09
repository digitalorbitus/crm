import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../lib/db";

export const runtime = "nodejs";

/* =========================================================
   AUTH
========================================================= */

async function getCurrentUser() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.id ?? decoded?._id ?? decoded?.userId;
    if (!userId) return null;

    const [rows] = await db.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    return rows?.[0] || null;
  } catch (error) {
    console.error("SALARY AUTH ERROR:", error);
    return null;
  }
}

function isAdmin(user) {
  return String(user?.role || "").trim().toLowerCase() === "admin";
}

/* =========================================================
   GET
   Admin  = all employees
   Normal = only own salary
========================================================= */

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [rows] = isAdmin(user)
      ? await db.query(
          `
          SELECT id, name, basic_salary, attendance_allowance
          FROM users
          WHERE status IS NULL OR LOWER(TRIM(status)) <> 'deleted'
          ORDER BY id ASC
          `
        )
      : await db.query(
          `
          SELECT id, name, basic_salary, attendance_allowance
          FROM users
          WHERE id = ?
          `,
          [user.id]
        );

    return NextResponse.json({ success: true, employees: rows });
  } catch (error) {
    console.error("EMPLOYEE SALARY GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load salary" },
      { status: 500 }
    );
  }
}

/* =========================================================
   PUT - ADMIN ONLY
   Saves basic salary + attendance allowance for ONE employee
========================================================= */

export async function PUT(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Only admin can update salary" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const userId = Number(body.user_id);
    const basic = Number(body.basic_salary);
    const allowance = Number(body.attendance_allowance);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid employee required" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(basic) ||
      basic < 0 ||
      !Number.isFinite(allowance) ||
      allowance < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Salary values must be 0 or more" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      UPDATE users
      SET basic_salary = ?, attendance_allowance = ?
      WHERE id = ?
      `,
      [basic, allowance, userId]
    );

    if (result.affectedRows !== 1) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Salary saved",
      user_id: userId,
      basic_salary: basic,
      attendance_allowance: allowance,
    });
  } catch (error) {
    console.error("EMPLOYEE SALARY PUT ERROR:", error);

    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save salary" },
      { status: 500 }
    );
  }
}
