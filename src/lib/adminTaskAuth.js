
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import db from "../app/lib/db";
import { isSessionCurrentForCaliforniaDay } from "../lib/california-logout";

export async function getTaskAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      user: null,
      error: "Authentication required",
      status: 401,
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isSessionCurrentForCaliforniaDay(decoded)) {
      return {
        user: null,
        error: "Session expired",
        status: 401,
      };
    }

    const userId =
      decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return {
        user: null,
        error: "User ID not found",
        status: 401,
      };
    }

    const [rows] = await db.query(
      `SELECT id, name, email, role, status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) {
      return {
        user: null,
        error: "User not found",
        status: 401,
      };
    }

    const user = rows[0];
    const role = String(user.role || "").trim().toLowerCase();

    if (
      user.status &&
      !["active", "enabled"].includes(
        String(user.status).trim().toLowerCase()
      )
    ) {
      return {
        user: null,
        error: "Account is not active",
        status: 403,
      };
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Daily Task authentication error:", error);

    return {
      user: null,
      error: "Invalid or expired session",
      status: 401,
    };
  }
}

export async function requireTaskAdmin() {
  const result = await getTaskAuthenticatedUser();

  if (result.error) return result;

  const adminRoles = ["admin", "super admin", "super_admin"];

  if (!adminRoles.includes(result.user.role)) {
    return {
      user: null,
      error: "Admin access required",
      status: 403,
    };
  }

  return result;
}