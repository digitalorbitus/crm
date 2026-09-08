import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query, zoomConfig } from "../../../lib/db";

export async function GET(request) {
  try {
    // ==========================================
    // 1. CRM LOGIN
    // ==========================================

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM login required",
        },
        { status: 401 }
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      console.error("JWT ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired CRM session",
        },
        { status: 401 }
      );
    }

    const crmUserId = decoded?.id;

    if (!crmUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM user ID not found",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. GET ZOOM CONNECTION
    // ==========================================

    const connections = await query(
      `
      SELECT
        id,
        user_id,
        zoom_account_id,
        zoom_user_id,
        zoom_email,
        access_token,
        refresh_token,
        expires_at
      FROM zoom_connections
      WHERE user_id = ?
      LIMIT 1
      `,
      [crmUserId]
    );

    if (!connections || connections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          connected: false,
          error: "Zoom account is not connected",
        },
        { status: 404 }
      );
    }

    const connection = connections[0];

    let accessToken = connection.access_token;

    // ==========================================
    // 3. REFRESH TOKEN IF EXPIRED
    // ==========================================

    let expiresAt = connection.expires_at
      ? new Date(connection.expires_at)
      : null;

    const now = Date.now();

    // Refresh 2 minutes before expiry
    const isExpired =
      !expiresAt ||
      expiresAt.getTime() <= now + 2 * 60 * 1000;

    if (isExpired) {
      console.log("ZOOM ACCESS TOKEN EXPIRED - REFRESHING");

      if (!connection.refresh_token) {
        return NextResponse.json(
          {
            success: false,
            connected: false,
            error:
              "Zoom session expired. Please reconnect Zoom.",
          },
          { status: 401 }
        );
      }

      const credentials = Buffer
        .from(
          `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
        )
        .toString("base64");

      const refreshResponse = await fetch(
        "https://zoom.us/oauth/token",
        {
          method: "POST",

          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: connection.refresh_token,
          }).toString(),
        }
      );

      const refreshData =
        await refreshResponse.json();

      console.log(
        "ZOOM REFRESH STATUS:",
        refreshResponse.status
      );

      if (!refreshResponse.ok) {
        console.error(
          "ZOOM REFRESH ERROR:",
          refreshData
        );

        return NextResponse.json(
          {
            success: false,
            connected: false,
            error:
              "Zoom session expired. Please reconnect Zoom.",
            details: refreshData,
          },
          { status: 401 }
        );
      }

      accessToken =
        refreshData.access_token;

      const newRefreshToken =
        refreshData.refresh_token ||
        connection.refresh_token;

      expiresAt = new Date(
        Date.now() +
          Number(refreshData.expires_in || 3600) *
            1000
      );

      // Save NEW token
      await query(
        `
        UPDATE zoom_connections
        SET
          access_token = ?,
          refresh_token = ?,
          expires_at = ?
        WHERE user_id = ?
        `,
        [
          accessToken,
          newRefreshToken,
          expiresAt,
          crmUserId,
        ]
      );

      console.log(
        "ZOOM TOKEN REFRESHED SUCCESSFULLY"
      );
    }

    // ==========================================
    // 4. QUERY PARAMETERS
    // ==========================================

    const { searchParams } =
      new URL(request.url);

    const from =
      searchParams.get("from");

    const to =
      searchParams.get("to");

    const pageSize =
      Math.min(
        Number(
          searchParams.get("page_size") || 30
        ),
        300
      );

    const nextPageToken =
      searchParams.get("next_page_token");

    // ==========================================
    // 5. BUILD ZOOM API URL
    // ==========================================

    const zoomUrl =
      new URL(
        "https://api.zoom.us/v2/phone/call_history"
      );

    zoomUrl.searchParams.set(
      "page_size",
      String(pageSize)
    );

    if (from) {
      zoomUrl.searchParams.set(
        "from",
        from
      );
    }

    if (to) {
      zoomUrl.searchParams.set(
        "to",
        to
      );
    }

    if (nextPageToken) {
      zoomUrl.searchParams.set(
        "next_page_token",
        nextPageToken
      );
    }

    console.log(
      "===================================="
    );

    console.log(
      "ZOOM CALL HISTORY REQUEST"
    );

    console.log(
      "URL:",
      zoomUrl.toString()
    );

    console.log(
      "CRM USER:",
      crmUserId
    );

    console.log(
      "===================================="
    );

    // ==========================================
    // 6. CALL ZOOM
    // ==========================================

    const zoomResponse =
      await fetch(
        zoomUrl.toString(),
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",
          },

          cache: "no-store",
        }
      );

    const zoomData =
      await zoomResponse.json();

    console.log(
      "ZOOM CALL HISTORY STATUS:",
      zoomResponse.status
    );

    if (!zoomResponse.ok) {
      console.error(
        "ZOOM CALL HISTORY ERROR:",
        zoomData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to retrieve Zoom call history",
          details: zoomData,
        },
        {
          status:
            zoomResponse.status,
        }
      );
    }

    // ==========================================
    // 7. SUPPORT ZOOM RESPONSE VERSIONS
    // ==========================================

    const calls =
      zoomData.call_history ||
      zoomData.call_logs ||
      [];

    // ==========================================
    // 8. RETURN TO CRM
    // ==========================================

    return NextResponse.json({
      success: true,

      connected: true,

      calls,

      total_records:
        zoomData.total_records ||
        calls.length,

      page_size:
        zoomData.page_size ||
        pageSize,

      next_page_token:
        zoomData.next_page_token ||
        null,

      from:
        zoomData.from ||
        from ||
        null,

      to:
        zoomData.to ||
        to ||
        null,
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "CALL HISTORY SERVER ERROR"
    );

    console.error("ERROR:", error);

    console.error(
      "MESSAGE:",
      error?.message
    );

    console.error(
      "STACK:",
      error?.stack
    );

    console.error(
      "===================================="
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Call history server error",
      },
      { status: 500 }
    );
  }
}