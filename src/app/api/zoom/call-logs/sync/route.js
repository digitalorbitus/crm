import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../../../lib/db";

export async function GET(request) {
  try {
    // ==========================================
    // 1. CRM LOGIN CHECK
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
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired CRM session",
        },
        { status: 401 }
      );
    }

    const crmUserId = decoded.id;

    if (!crmUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM user ID not found",
        },
        { status: 401 }
      );
    }

    console.log("CRM USER ID:", crmUserId);

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
      ORDER BY id DESC
      LIMIT 1
      `,
      [crmUserId]
    );

    if (connections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Zoom is not connected for this CRM user",
        },
        { status: 404 }
      );
    }

    const connection = connections[0];

    console.log(
      "ZOOM CONNECTION FOUND:",
      connection.zoom_email
    );

    // ==========================================
    // 3. GET ACCESS TOKEN
    // ==========================================

    let accessToken = connection.access_token;

    // ==========================================
    // 4. REFRESH TOKEN IF EXPIRED
    // ==========================================

    if (
      connection.expires_at &&
      new Date(connection.expires_at).getTime() <=
        Date.now()
    ) {
      console.log(
        "ZOOM ACCESS TOKEN EXPIRED"
      );

      if (!connection.refresh_token) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Zoom access token expired and refresh token is missing. Reconnect Zoom.",
          },
          { status: 401 }
        );
      }

      const clientId =
        process.env.ZOOM_CLIENT_ID;

      const clientSecret =
        process.env.ZOOM_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Zoom client configuration is missing",
          },
          { status: 500 }
        );
      }

      const credentials = Buffer
        .from(
          `${clientId}:${clientSecret}`
        )
        .toString("base64");

      const refreshResponse =
        await fetch(
          "https://zoom.us/oauth/token",
          {
            method: "POST",

            headers: {
              Authorization:
                `Basic ${credentials}`,

              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              new URLSearchParams({
                grant_type:
                  "refresh_token",

                refresh_token:
                  connection.refresh_token,
              }).toString(),
          }
        );

      const refreshData =
        await refreshResponse.json();

      if (!refreshResponse.ok) {
        console.error(
          "ZOOM REFRESH ERROR:",
          refreshData
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Could not refresh Zoom access token",

            details: refreshData,
          },
          {
            status:
              refreshResponse.status,
          }
        );
      }

      accessToken =
        refreshData.access_token;

      const newRefreshToken =
        refreshData.refresh_token ||
        connection.refresh_token;

      let newExpiresAt = null;

      if (refreshData.expires_in) {
        newExpiresAt = new Date(
          Date.now() +
            Number(
              refreshData.expires_in
            ) *
              1000
        );
      }

      await query(
        `
        UPDATE zoom_connections
        SET
          access_token = ?,
          refresh_token = ?,
          expires_at = ?
        WHERE id = ?
        `,
        [
          accessToken,
          newRefreshToken,
          newExpiresAt,
          connection.id,
        ]
      );

      console.log(
        "ZOOM TOKEN REFRESHED"
      );
    }

    // ==========================================
    // 5. DATE FILTER
    // ==========================================

    const { searchParams } =
      new URL(request.url);

    const from =
      searchParams.get("from") ||
      "2026-08-29";

    const to =
      searchParams.get("to") ||
      "2026-09-03";

    const pageSize =
      searchParams.get("page_size") ||
      "30";

    console.log(
      "CALL HISTORY DATE:",
      from,
      "TO",
      to
    );

    // ==========================================
    // 6. GET ZOOM CALL HISTORY
    // ==========================================

    let allCalls = [];
    let nextPageToken = null;

    do {
      const zoomUrl =
        new URL(
          "https://api.zoom.us/v2/phone/call_history"
        );

      zoomUrl.searchParams.set(
        "from",
        from
      );

      zoomUrl.searchParams.set(
        "to",
        to
      );

      zoomUrl.searchParams.set(
        "page_size",
        pageSize
      );

      if (nextPageToken) {
        zoomUrl.searchParams.set(
          "next_page_token",
          nextPageToken
        );
      }

      console.log(
        "ZOOM API REQUEST:",
        zoomUrl.toString()
          .replace(
            /next_page_token=[^&]+/,
            "next_page_token=[HIDDEN]"
          )
      );

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
              "Could not retrieve Zoom call history",

            details: zoomData,
          },
          {
            status:
              zoomResponse.status,
          }
        );
      }

      // Current Zoom API uses call_history
      // Older responses may use call_logs
      const calls =
        Array.isArray(
          zoomData.call_history
        )
          ? zoomData.call_history
          : Array.isArray(
              zoomData.call_logs
            )
          ? zoomData.call_logs
          : [];

      allCalls.push(...calls);

      nextPageToken =
        zoomData.next_page_token ||
        null;

      console.log(
        "CALLS RECEIVED:",
        calls.length
      );

    } while (nextPageToken);

    // ==========================================
    // 7. NO CALLS
    // ==========================================

    if (allCalls.length === 0) {
      return NextResponse.json({
        success: true,

        message:
          "Zoom API connected, but no call history was returned for this date range.",

        from,
        to,

        total_from_zoom: 0,

        inserted: 0,

        updated: 0,
      });
    }

    // ==========================================
    // 8. SAVE CALLS INTO MYSQL
    // ==========================================

    let inserted = 0;
    let updated = 0;

    for (const call of allCalls) {
      // ----------------------------------------
      // Zoom IDs
      // ----------------------------------------

      const callHistoryUuid =
        call.call_history_uuid ||
        call.id ||
        null;

      const zoomCallId =
        call.call_id ||
        call.id ||
        null;

      // ----------------------------------------
      // Basic fields
      // ----------------------------------------

      const direction =
        call.direction ||
        null;

      const callType =
        call.call_type ||
        null;

      const connectType =
        call.connect_type ||
        null;

      const callerNumber =
        call.caller_number ||
        call.caller ||
        null;

      const receiverNumber =
        call.receiver_number ||
        call.callee_number ||
        call.callee ||
        null;

      const callerName =
        call.caller_name ||
        null;

      const receiverName =
        call.receiver_name ||
        call.callee_name ||
        null;

      const callStatus =
        call.call_status ||
        call.result ||
        call.status ||
        null;

      // ----------------------------------------
      // Date/time
      // ----------------------------------------

      const startTime =
        call.start_time ||
        call.date_time ||
        call.date ||
        null;

      const endTime =
        call.end_time ||
        null;

      // ----------------------------------------
      // Duration
      // ----------------------------------------

      const durationSeconds =
        Number(
          call.duration ||
          call.duration_seconds ||
          0
        );

      // ----------------------------------------
      // AI summary
      // ----------------------------------------

      const aiSummary =
        call.ai_summary ||
        null;

      // ----------------------------------------
      // Check existing call
      // ----------------------------------------

      let existing = [];

      if (callHistoryUuid) {
        existing = await query(
          `
          SELECT id
          FROM zoom_call_logs
          WHERE user_id = ?
          AND call_history_uuid = ?
          LIMIT 1
          `,
          [
            crmUserId,
            callHistoryUuid,
          ]
        );
      }

      // ========================================
      // UPDATE EXISTING
      // ========================================

      if (existing.length > 0) {
        await query(
          `
          UPDATE zoom_call_logs
          SET
            zoom_call_id = ?,
            direction = ?,
            call_type = ?,
            connect_type = ?,
            caller_name = ?,
            caller_number = ?,
            receiver_name = ?,
            receiver_number = ?,
            call_status = ?,
            start_time = ?,
            end_time = ?,
            duration_seconds = ?,
            ai_summary = ?,
            zoom_data = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          `,
          [
            zoomCallId,
            direction,
            callType,
            connectType,
            callerName,
            callerNumber,
            receiverName,
            receiverNumber,
            callStatus,
            startTime,
            endTime,
            durationSeconds,
            aiSummary,
            JSON.stringify(call),
            existing[0].id,
          ]
        );

        updated++;
      }

      // ========================================
      // INSERT NEW
      // ========================================

      else {
        await query(
          `
          INSERT INTO zoom_call_logs
          (
            user_id,
            call_history_uuid,
            zoom_call_id,
            direction,
            call_type,
            connect_type,
            caller_name,
            caller_number,
            receiver_name,
            receiver_number,
            call_status,
            start_time,
            end_time,
            duration_seconds,
            ai_summary,
            zoom_data
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            crmUserId,
            callHistoryUuid,
            zoomCallId,
            direction,
            callType,
            connectType,
            callerName,
            callerNumber,
            receiverName,
            receiverNumber,
            callStatus,
            startTime,
            endTime,
            durationSeconds,
            aiSummary,
            JSON.stringify(call),
          ]
        );

        inserted++;
      }
    }

    // ==========================================
    // 9. SUCCESS
    // ==========================================

    console.log(
      "===================================="
    );

    console.log(
      "ZOOM CALL SYNC COMPLETE"
    );

    console.log(
      "TOTAL FROM ZOOM:",
      allCalls.length
    );

    console.log(
      "INSERTED:",
      inserted
    );

    console.log(
      "UPDATED:",
      updated
    );

    console.log(
      "===================================="
    );

    return NextResponse.json({
      success: true,

      message:
        "Zoom call history synced successfully",

      from,
      to,

      total_from_zoom:
        allCalls.length,

      inserted,
      updated,
    });

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "ZOOM CALL SYNC SERVER ERROR:"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error.message ||
          "Zoom call sync failed",
      },
      { status: 500 }
    );
  }
}