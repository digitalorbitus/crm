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

    let accessToken =
      connection.access_token;

    // ==========================================
    // 3. REFRESH ZOOM TOKEN
    // ==========================================

    let expiresAt =
      connection.expires_at
        ? new Date(connection.expires_at)
        : null;

    const now = Date.now();

    const isExpired =
      !expiresAt ||
      expiresAt.getTime() <=
        now + 2 * 60 * 1000;

    if (isExpired) {
      console.log(
        "ZOOM ACCESS TOKEN EXPIRED - REFRESHING"
      );

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

            body: new URLSearchParams({
              grant_type:
                "refresh_token",

              refresh_token:
                connection.refresh_token,
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
          Number(
            refreshData.expires_in ||
              3600
          ) *
            1000
      );

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

    const requestedPageSize =
      Number(
        searchParams.get(
          "page_size"
        ) || 300
      );

    const pageSize = Math.min(
      Math.max(
        requestedPageSize,
        1
      ),
      300
    );

    // ==========================================
    // 5. FETCH ALL ZOOM CALL HISTORY
    // ==========================================

    let allCalls = [];

    let nextPageToken = null;

    let pageNumber = 0;

    const MAX_PAGES = 100;

    do {
      pageNumber++;

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
        "ZOOM CALL HISTORY PAGE:",
        pageNumber
      );

      console.log(
        "URL:",
        zoomUrl.toString()
      );

      console.log(
        "===================================="
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

            next: {
              revalidate: 0,
            },
          }
        );

      const zoomData =
        await zoomResponse.json();

      console.log(
        "ZOOM RESPONSE STATUS:",
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

      // ========================================
      // SUPPORT BOTH RESPONSE FORMATS
      // ========================================

      const pageCalls =
        zoomData.call_history ||
        zoomData.call_logs ||
        [];

      console.log(
        `PAGE ${pageNumber} RECORDS:`,
        pageCalls.length
      );

      allCalls.push(
        ...pageCalls
      );

      nextPageToken =
        zoomData.next_page_token ||
        null;

      console.log(
        "NEXT PAGE TOKEN:",
        nextPageToken
          ? "YES"
          : "NO"
      );

      // Safety protection
      if (
        pageNumber >=
        MAX_PAGES
      ) {
        console.warn(
          "MAX PAGE LIMIT REACHED"
        );

        break;
      }

    } while (nextPageToken);

    // ==========================================
    // 6. REMOVE DUPLICATE CALLS
    // ==========================================

    const uniqueCallsMap =
      new Map();

    for (const call of allCalls) {
      const uniqueId =
        call.call_history_uuid ||
        call.id ||
        call.call_id ||
        [
          call.start_time,
          call.caller_did_number,
          call.callee_did_number,
          call.direction,
        ].join("-");

      if (
        !uniqueCallsMap.has(
          uniqueId
        )
      ) {
        uniqueCallsMap.set(
          uniqueId,
          call
        );
      }
    }

    const uniqueCalls =
      Array.from(
        uniqueCallsMap.values()
      );

    // ==========================================
    // 7. GET EXTENSION FROM ZOOM CALL
    // ==========================================

    const getExtension =
      (call) => {
        const values = [
          call.caller_ext_number,
          call.callee_ext_number,

          call.caller_extension,
          call.callee_extension,

          call.caller_ext,
          call.callee_ext,

          call.from_extension,
          call.to_extension,

          call.extension,
          call.user_extension,
        ];

        for (
          const value of values
        ) {
          if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
          ) {
            return String(
              value
            ).trim();
          }
        }

        return null;
      };

    // ==========================================
    // 8. ENRICH CALL DATA
    // ==========================================

    const enrichedCalls =
      uniqueCalls.map(
        (call) => {
          const extension =
            getExtension(
              call
            );

          return {
            ...call,

            crm_extension:
              extension,

            crm_extension_label:
              extension
                ? `Ext.${extension}`
                : null,
          };
        }
      );

    // ==========================================
    // 9. DYNAMIC EXTENSIONS
    // ==========================================

    const extensionMap =
      new Map();

    for (
      const call of enrichedCalls
    ) {
      const extension =
        call.crm_extension;

      if (
        extension &&
        !extensionMap.has(
          extension
        )
      ) {
        extensionMap.set(
          extension,
          {
            extension,

            label:
              `Ext.${extension}`,

            calls: 0,
          }
        );
      }

      if (extension) {
        const item =
          extensionMap.get(
            extension
          );

        item.calls += 1;
      }
    }

    const extensions =
      Array.from(
        extensionMap.values()
      ).sort(
        (a, b) =>
          Number(a.extension) -
          Number(b.extension)
      );

    // ==========================================
    // 10. EXTENSION COUNTS
    // ==========================================

    const extensionCounts = {};

    for (
      const extension
        of extensions
    ) {
      extensionCounts[
        extension.extension
      ] = extension.calls;
    }

    // ==========================================
    // 11. DEBUG
    // ==========================================

    console.log(
      "===================================="
    );

    console.log(
      "TOTAL ZOOM RECORDS:",
      allCalls.length
    );

    console.log(
      "UNIQUE CALLS:",
      uniqueCalls.length
    );

    console.log(
      "DYNAMIC EXTENSIONS:",
      extensions
    );

    console.log(
      "EXTENSION COUNTS:",
      extensionCounts
    );

    console.log(
      "PAGES FETCHED:",
      pageNumber
    );

    console.log(
      "===================================="
    );

    // ==========================================
    // 12. RETURN TO CRM
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        connected: true,

        live: true,

        calls:
          enrichedCalls,

        total_records:
          enrichedCalls.length,

        page_size:
          pageSize,

        pages_fetched:
          pageNumber,

        extensions:
          extensions,

        extension_counts:
          extensionCounts,

        from:
          from || null,

        to:
          to || null,

        fetched_at:
          new Date().toISOString(),

        next_page_token:
          null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma: "no-cache",

          Expires: "0",
        },
      }
    );

  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "CALL HISTORY SERVER ERROR"
    );

    console.error(
      "ERROR:",
      error
    );

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
      {
        status: 500,
      }
    );
  }
}