import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export async function GET(request) {
  try {
    // ========================================================
    // AUTH COOKIE
    // ========================================================

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // VERIFY TOKEN
    // ========================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded.user_id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // QUERY PARAMS
    // ========================================================

    const { searchParams } = new URL(request.url);

    const unreadOnly =
      searchParams.get("unread") === "true";

    const limitParam =
      Number(searchParams.get("limit") || 20);

    const limit = Math.min(
      Math.max(limitParam, 1),
      100
    );

    // ========================================================
    // GET NOTIFICATIONS
    // ========================================================

    let notifications;

    if (unreadOnly) {
      notifications = await query(
        `
        SELECT
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          created_at,
          read_at
        FROM notifications
        WHERE user_id = ?
          AND is_read = 0
        ORDER BY created_at DESC
        LIMIT ${limit}
        `,
        [userId]
      );
    } else {
      notifications = await query(
        `
        SELECT
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          created_at,
          read_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ${limit}
        `,
        [userId]
      );
    }

    // ========================================================
    // UNREAD COUNT
    // ========================================================

    const countResult = await query(
      `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = ?
        AND is_read = 0
      `,
      [userId]
    );

    const unreadCount =
      Number(
        countResult?.[0]?.unread_count || 0
      );

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,
        notifications: notifications || [],
        unread_count: unreadCount,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/notifications error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// CREATE NOTIFICATION
// ============================================================

export async function POST(request) {
  try {
    // ========================================================
    // AUTH COOKIE
    // ========================================================

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ========================================================
    // VERIFY TOKEN
    // ========================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    const creatorId =
      decoded.id ||
      decoded.userId ||
      decoded.user_id;

    // ========================================================
    // BODY
    // ========================================================

    const body = await request.json();

    const {
      user_id,
      title,
      message,
      type = "info",
    } = body;

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "user_id is required",
        },
        { status: 400 }
      );
    }

    if (!title || !message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "title and message are required",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // CHECK USER
    // ========================================================

    const users = await query(
      `
      SELECT id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [user_id]
    );

    if (!users?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // ========================================================
    // INSERT
    // ========================================================

    const result = await query(
      `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        type,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, 0, NOW())
      `,
      [
        user_id,
        title,
        message,
        type,
      ]
    );

    // ========================================================
    // GET CREATED NOTIFICATION
    // ========================================================

    const created = await query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        created_at,
        read_at
      FROM notifications
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Notification created successfully",
        notification:
          created?.[0] || null,
        created_by: creatorId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/notifications error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create notification",
      },
      { status: 500 }
    );
  }
}