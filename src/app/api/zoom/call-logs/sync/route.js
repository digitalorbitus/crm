import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "../../../../lib/db";

// ==========================================
// HELPER: WAIT / SLEEP
// ==========================================

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ==========================================
// HELPER: REFRESH ZOOM ACCESS TOKEN
// ==========================================

async function refreshZoomToken(connection) {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Zoom client configuration is missing"
    );
  }

  if (!connection.refresh_token) {
    throw new Error(
      "Zoom refresh token is missing. Please reconnect Zoom."
    );
  }

  const credentials = Buffer
    .from(`${clientId}:${clientSecret}`)
    .toString("base64");

  console.log(
    "========== ZOOM TOKEN REFRESH =========="
  );

  const refreshResponse = await fetch(
    "https://zoom.us/oauth/token",
    {
      method: "POST",

      headers: {
        Authorization:
          `Basic ${credentials}`,

        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        grant_type: "refresh_token",

        refresh_token:
          connection.refresh_token,
      }).toString(),

      cache: "no-store",
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

    throw new Error(
      refreshData?.reason ||
      refreshData?.message ||
      "Could not refresh Zoom access token"
    );
  }

  if (!refreshData.access_token) {
    throw new Error(
      "Zoom did not return a new access token"
    );
  }

  const newAccessToken =
    refreshData.access_token;

  const newRefreshToken =
    refreshData.refresh_token ||
    connection.refresh_token;

  let newExpiresAt = null;

  if (refreshData.expires_in) {
    newExpiresAt = new Date(
      Date.now() +
        Number(refreshData.expires_in) *
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
      newAccessToken,
      newRefreshToken,
      newExpiresAt,
      connection.id,
    ]
  );

  console.log(
    "ZOOM TOKEN REFRESHED SUCCESSFULLY"
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt: newExpiresAt,
  };
}

// ==========================================
// GET
// ==========================================

export async function GET(request) {
  try {
    // ==========================================
    // 1. CRM LOGIN CHECK
    // ==========================================

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM login required",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. VERIFY JWT
    // ==========================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      console.error(
        "JWT VERIFY ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired CRM session",
        },
        { status: 401 }
      );
    }

    const crmUserId = decoded.id;

    if (!crmUserId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "CRM user ID not found",
        },
        { status: 401 }
      );
    }

    console.log(
      "===================================="
    );

    console.log(
      "ZOOM CALL SYNC START"
    );

    console.log(
      "CRM USER ID:",
      crmUserId
    );

    console.log(
      "===================================="
    );

    // ==========================================
    // 3. GET ZOOM CONNECTION
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

    const connection =
      connections[0];

    console.log(
      "ZOOM CONNECTION FOUND:",
      connection.zoom_email
    );

    // ==========================================
    // 4. ACCESS TOKEN
    // ==========================================

    let accessToken =
      connection.access_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Zoom access token is missing. Please reconnect Zoom.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 5. CHECK TOKEN EXPIRY
    // ==========================================

    if (
      connection.expires_at &&
      new Date(
        connection.expires_at
      ).getTime() <= Date.now()
    ) {
      console.log(
        "ZOOM ACCESS TOKEN EXPIRED"
      );

      try {
        const refreshed =
          await refreshZoomToken(
            connection
          );

        accessToken =
          refreshed.accessToken;

      } catch (refreshError) {
        console.error(
          "ZOOM TOKEN REFRESH FAILED:",
          refreshError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Zoom access token expired. Please reconnect Zoom.",
            details:
              refreshError.message,
          },
          { status: 401 }
        );
      }
    }

    // ==========================================
    // 6. DATE FILTER
    // ==========================================

    const { searchParams } =
      new URL(request.url);

    const from =
      searchParams.get("from") ||
      "2026-08-29";

    const to =
      searchParams.get("to") ||
      "2026-09-03";

    let pageSize =
      Number(
        searchParams.get("page_size") ||
          "30"
      );

    // Safe page size
    if (
      !Number.isFinite(pageSize) ||
      pageSize < 1
    ) {
      pageSize = 30;
    }

    if (pageSize > 30) {
      pageSize = 30;
    }

    console.log(
      "CALL HISTORY DATE:",
      from,
      "TO",
      to
    );

    console.log(
      "PAGE SIZE:",
      pageSize
    );

    // ==========================================
    // 7. GET ZOOM CALL HISTORY
    // ==========================================

    let allCalls = [];

    let nextPageToken = null;

    let pageNumber = 0;

    do {
      pageNumber++;

      // ========================================
      // WAIT BETWEEN PAGINATED REQUESTS
      // ========================================

      if (pageNumber > 1) {
        console.log(
          "Waiting 1 second before next Zoom page..."
        );

        await sleep(1000);
      }

      // ========================================
      // CREATE ZOOM URL
      // ========================================

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
        String(pageSize)
      );

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
        "ZOOM API REQUEST PAGE:",
        pageNumber
      );

      console.log(
        "ZOOM API REQUEST:",
        zoomUrl
          .toString()
          .replace(
            /next_page_token=[^&]+/,
            "next_page_token=[HIDDEN]"
          )
      );

      // ========================================
      // RETRY SYSTEM
      // ========================================

      let zoomResponse = null;
      let zoomData = null;

      const maxAttempts = 3;

      for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
      ) {
        console.log(
          `Zoom request attempt ${attempt}/${maxAttempts}`
        );

        try {
          zoomResponse =
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

          zoomData =
            await zoomResponse.json();

        } catch (fetchError) {
          console.error(
            "ZOOM FETCH ERROR:",
            fetchError
          );

          if (
            attempt ===
            maxAttempts
          ) {
            throw fetchError;
          }

          await sleep(
            attempt * 2000
          );

          continue;
        }

        console.log(
          "ZOOM CALL HISTORY STATUS:",
          zoomResponse.status
        );

        // ======================================
        // SUCCESS
        // ======================================

        if (zoomResponse.ok) {
          break;
        }

        // ======================================
        // RATE LIMIT 429
        // ======================================

        if (
          zoomResponse.status ===
          429
        ) {
          console.warn(
            "ZOOM RATE LIMIT 429"
          );

          if (
            attempt ===
            maxAttempts
          ) {
            return NextResponse.json(
              {
                success: false,

                error:
                  "Zoom API rate limit reached. Please wait a few seconds and try again.",

                details:
                  zoomData,
              },
              {
                status: 429,
              }
            );
          }

          // 2 sec, 4 sec
          const waitTime =
            attempt * 2000;

          console.log(
            `Waiting ${waitTime}ms before retry...`
          );

          await sleep(
            waitTime
          );

          continue;
        }

        // ======================================
        // ACCESS TOKEN INVALID
        // ======================================

        if (
          zoomResponse.status ===
          401
        ) {
          console.error(
            "ZOOM ACCESS TOKEN INVALID:",
            zoomData
          );

          // Try refresh one time
          if (
            connection.refresh_token
          ) {
            console.log(
              "Trying to refresh Zoom token because API returned 401..."
            );

            try {
              const refreshed =
                await refreshZoomToken(
                  connection
                );

              accessToken =
                refreshed.accessToken;

              // Retry request
              if (
                attempt <
                maxAttempts
              ) {
                await sleep(1000);
                continue;
              }
            } catch (
              refreshError
            ) {
              console.error(
                "TOKEN REFRESH AFTER 401 FAILED:",
                refreshError
              );
            }
          }

          return NextResponse.json(
            {
              success: false,

              error:
                "Zoom access token is invalid. Please reconnect Zoom.",

              details:
                zoomData,
            },
            {
              status: 401,
            }
          );
        }

        // ======================================
        // OTHER ZOOM ERROR
        // ======================================

        console.error(
          "ZOOM CALL HISTORY ERROR:",
          zoomData
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Could not retrieve Zoom call history",

            details:
              zoomData,
          },
          {
            status:
              zoomResponse.status,
          }
        );
      }

      // ========================================
      // MAKE SURE RESPONSE EXISTS
      // ========================================

      if (
        !zoomResponse ||
        !zoomData
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No response received from Zoom",
          },
          { status: 502 }
        );
      }

      // ========================================
      // EXTRACT CALLS
      // ========================================

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

      allCalls.push(
        ...calls
      );

      nextPageToken =
        zoomData.next_page_token ||
        null;

      console.log(
        "CALLS RECEIVED:",
        calls.length
      );

      console.log(
        "TOTAL CALLS SO FAR:",
        allCalls.length
      );

      console.log(
        "NEXT PAGE:",
        !!nextPageToken
      );

    } while (
      nextPageToken
    );

    // ==========================================
    // 8. NO CALLS
    // ==========================================

    if (
      allCalls.length === 0
    ) {
      console.log(
        "NO CALL HISTORY FOUND"
      );

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
    // 9. SAVE CALLS TO MYSQL
    // ==========================================

    let inserted = 0;

    let updated = 0;

    console.log(
      "===================================="
    );

    console.log(
      "SAVING CALLS TO MYSQL"
    );

    console.log(
      "TOTAL:",
      allCalls.length
    );

    console.log(
      "===================================="
    );

    for (
      const call of allCalls
    ) {

      // ========================================
      // ZOOM IDS
      // ========================================

      const callHistoryUuid =
        call.call_history_uuid ||
        call.id ||
        null;

      const zoomCallId =
        call.call_id ||
        call.id ||
        null;

      // ========================================
      // BASIC DATA
      // ========================================

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

      // ========================================
      // DATE / TIME
      // ========================================

      const startTime =
        call.start_time ||
        call.date_time ||
        call.date ||
        null;

      const endTime =
        call.end_time ||
        null;

      // ========================================
      // DURATION
      // ========================================

      const durationSeconds =
        Number(
          call.duration ||
          call.duration_seconds ||
          0
        );

      // ========================================
      // AI SUMMARY
      // ========================================

      const aiSummary =
        call.ai_summary ||
        null;

      // ========================================
      // CHECK EXISTING
      // ========================================

      let existing = [];

      if (
        callHistoryUuid
      ) {
        existing =
          await query(
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
      // UPDATE
      // ========================================

      if (
        existing.length > 0
      ) {

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
      // INSERT
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
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    // 10. COMPLETE
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

    // ==========================================
    // SERVER ERROR
    // ==========================================

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
      {
        status: 500,
      }
    );
  }
}