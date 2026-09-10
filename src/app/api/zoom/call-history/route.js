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





// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { query } from "../../../lib/db";

// export const dynamic = "force-dynamic";

// /**
//  * =========================================================
//  * HELPERS
//  * =========================================================
//  */

// function getBearerToken(request) {
//   const auth = request.headers.get("authorization");

//   if (!auth) return null;

//   const match = auth.match(/^Bearer\s+(.+)$/i);

//   return match ? match[1] : null;
// }

// function normalizeExtension(value) {
//   if (value === undefined || value === null) {
//     return null;
//   }

//   const cleaned = String(value)
//     .trim()
//     .replace(/^Ext\.?\s*/i, "");

//   return cleaned || null;
// }

// function formatZoomDate(date) {
//   if (!date) return null;

//   const d = new Date(date);

//   if (Number.isNaN(d.getTime())) {
//     return null;
//   }

//   return d.toISOString().slice(0, 10);
// }

// function isTokenExpired(expiresAt) {
//   if (!expiresAt) {
//     return true;
//   }

//   const expires = new Date(expiresAt).getTime();

//   if (Number.isNaN(expires)) {
//     return true;
//   }

//   // Refresh 2 minutes before actual expiry
//   return expires <= Date.now() + 2 * 60 * 1000;
// }

// /**
//  * =========================================================
//  * GET ADMIN USER
//  *
//  * We intentionally use the ADMIN's Zoom connection
//  * for the complete Zoom account.
//  * =========================================================
//  */

// async function getAdminUser() {
//   const rows = await query(
//     `
//       SELECT
//         id,
//         name,
//         email,
//         role,
//         zoom_extension
//       FROM users
//       WHERE LOWER(role) = 'admin'
//       ORDER BY id ASC
//       LIMIT 1
//     `
//   );

//   if (!rows || rows.length === 0) {
//     return null;
//   }

//   return rows[0];
// }

// /**
//  * =========================================================
//  * GET ZOOM CONNECTION
//  *
//  * IMPORTANT:
//  * This connection belongs to the CRM ADMIN.
//  *
//  * Agents do NOT need their own zoom_connections row.
//  * =========================================================
//  */

// async function getAdminZoomConnection(adminUserId) {
//   const rows = await query(
//     `
//       SELECT
//         id,
//         user_id,
//         zoom_account_id,
//         zoom_user_id,
//         zoom_email,
//         access_token,
//         refresh_token,
//         expires_at
//       FROM zoom_connections
//       WHERE user_id = ?
//       ORDER BY id DESC
//       LIMIT 1
//     `,
//     [adminUserId]
//   );

//   if (!rows || rows.length === 0) {
//     return null;
//   }

//   return rows[0];
// }

// /**
//  * =========================================================
//  * REFRESH ZOOM ACCESS TOKEN
//  * =========================================================
//  */

// async function refreshZoomAccessToken(connection) {
//   if (!connection.refresh_token) {
//     return {
//       ok: false,
//       message: "Zoom refresh token is missing",
//     };
//   }

//   const clientId = process.env.ZOOM_CLIENT_ID;
//   const clientSecret = process.env.ZOOM_CLIENT_SECRET;

//   if (!clientId || !clientSecret) {
//     return {
//       ok: false,
//       message: "Zoom OAuth credentials are missing",
//     };
//   }

//   try {
//     const basicAuth = Buffer.from(
//       `${clientId}:${clientSecret}`
//     ).toString("base64");

//     const body = new URLSearchParams();

//     body.set("grant_type", "refresh_token");
//     body.set("refresh_token", connection.refresh_token);

//     console.log("====================================");
//     console.log("REFRESHING ZOOM ACCESS TOKEN");
//     console.log("CONNECTION ID:", connection.id);
//     console.log("====================================");

//     const response = await fetch(
//       "https://zoom.us/oauth/token",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Basic ${basicAuth}`,
//           "Content-Type":
//             "application/x-www-form-urlencoded",
//         },
//         body: body.toString(),
//         cache: "no-store",
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       console.error(
//         "ZOOM TOKEN REFRESH ERROR:",
//         data
//       );

//       return {
//         ok: false,
//         status: response.status,
//         data,
//         message:
//           data?.reason ||
//           data?.error ||
//           "Unable to refresh Zoom access token",
//       };
//     }

//     const newAccessToken =
//       data.access_token || null;

//     const newRefreshToken =
//       data.refresh_token ||
//       connection.refresh_token;

//     const expiresIn =
//       Number(data.expires_in) || 3600;

//     if (!newAccessToken) {
//       return {
//         ok: false,
//         message:
//           "Zoom refresh response did not contain access token",
//       };
//     }

//     const expiresAt = new Date(
//       Date.now() + expiresIn * 1000
//     );

//     await query(
//       `
//         UPDATE zoom_connections
//         SET
//           access_token = ?,
//           refresh_token = ?,
//           expires_at = ?,
//           updated_at = NOW()
//         WHERE id = ?
//       `,
//       [
//         newAccessToken,
//         newRefreshToken,
//         expiresAt,
//         connection.id,
//       ]
//     );

//     return {
//       ok: true,
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken,
//       expiresAt,
//     };
//   } catch (error) {
//     console.error(
//       "ZOOM TOKEN REFRESH SERVER ERROR:",
//       error
//     );

//     return {
//       ok: false,
//       message:
//         error?.message ||
//         "Zoom token refresh failed",
//     };
//   }
// }

// /**
//  * =========================================================
//  * ENSURE VALID ZOOM ACCESS TOKEN
//  * =========================================================
//  */

// async function ensureValidZoomToken(connection) {
//   if (!connection.access_token) {
//     return {
//       ok: false,
//       message:
//         "Zoom connection exists but access token is missing",
//     };
//   }

//   if (!isTokenExpired(connection.expires_at)) {
//     return {
//       ok: true,
//       accessToken: connection.access_token,
//       connection,
//     };
//   }

//   console.log(
//     "ZOOM ACCESS TOKEN EXPIRED/EXPIRING"
//   );

//   const refreshed =
//     await refreshZoomAccessToken(connection);

//   if (!refreshed.ok) {
//     return refreshed;
//   }

//   return {
//     ok: true,
//     accessToken: refreshed.accessToken,
//     connection: {
//       ...connection,
//       access_token:
//         refreshed.accessToken,
//       refresh_token:
//         refreshed.refreshToken,
//       expires_at:
//         refreshed.expiresAt,
//     },
//   };
// }

// /**
//  * =========================================================
//  * ZOOM CALL HISTORY API
//  * =========================================================
//  */

// async function getZoomCallHistory({
//   accessToken,
//   from,
//   to,
//   pageSize,
//   nextPageToken,
// }) {
//   const params = new URLSearchParams();

//   if (from) {
//     params.set("from", from);
//   }

//   if (to) {
//     params.set("to", to);
//   }

//   params.set(
//     "page_size",
//     String(pageSize)
//   );

//   if (nextPageToken) {
//     params.set(
//       "next_page_token",
//       nextPageToken
//     );
//   }

//   const url =
//     `https://api.zoom.us/v2/phone/call_history?${params.toString()}`;

//   console.log("====================================");
//   console.log("ZOOM CALL HISTORY REQUEST");
//   console.log("FROM:", from);
//   console.log("TO:", to);
//   console.log("PAGE SIZE:", pageSize);
//   console.log(
//     "HAS NEXT PAGE TOKEN:",
//     Boolean(nextPageToken)
//   );
//   console.log("====================================");

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       Authorization:
//         `Bearer ${accessToken}`,
//       "Content-Type":
//         "application/json",
//     },
//     cache: "no-store",
//   });

//   let data = {};

//   try {
//     data = await response.json();
//   } catch {
//     data = {};
//   }

//   console.log(
//     "ZOOM CALL HISTORY STATUS:",
//     response.status
//   );

//   if (!response.ok) {
//     console.error(
//       "ZOOM CALL HISTORY ERROR:",
//       data
//     );

//     return {
//       ok: false,
//       status: response.status,
//       data,
//     };
//   }

//   return {
//     ok: true,
//     status: response.status,
//     data,
//   };
// }

// /**
//  * =========================================================
//  * FIND CRM USER BY ZOOM EXTENSION
//  * =========================================================
//  */

// async function findUserByExtension(extension) {
//   const normalized =
//     normalizeExtension(extension);

//   if (!normalized) {
//     return null;
//   }

//   const rows = await query(
//     `
//       SELECT
//         id,
//         name,
//         email,
//         role,
//         zoom_extension
//       FROM users
//       WHERE zoom_extension = ?
//       LIMIT 1
//     `,
//     [normalized]
//   );

//   if (!rows || rows.length === 0) {
//     return null;
//   }

//   return rows[0];
// }

// /**
//  * =========================================================
//  * GET CALL EXTENSIONS
//  *
//  * Supports:
//  * caller_ext_number
//  * callee_ext_number
//  * caller_ext_id
//  * callee_ext_id
//  * =========================================================
//  */

// function getCallExtensions(call) {
//   const callerExtension =
//     normalizeExtension(
//       call?.caller_ext_number
//     );

//   const calleeExtension =
//     normalizeExtension(
//       call?.callee_ext_number
//     );

//   const callerExtId =
//     normalizeExtension(
//       call?.caller_ext_id
//     );

//   const calleeExtId =
//     normalizeExtension(
//       call?.callee_ext_id
//     );

//   return {
//     callerExtension,
//     calleeExtension,
//     callerExtId,
//     calleeExtId,
//   };
// }

// /**
//  * =========================================================
//  * CHECK IF AGENT OWNS CALL
//  * =========================================================
//  */

// function callBelongsToExtension(
//   call,
//   extension
// ) {
//   const normalizedExtension =
//     normalizeExtension(extension);

//   if (!normalizedExtension) {
//     return false;
//   }

//   const {
//     callerExtension,
//     calleeExtension,
//     callerExtId,
//     calleeExtId,
//   } = getCallExtensions(call);

//   return (
//     callerExtension === normalizedExtension ||
//     calleeExtension === normalizedExtension ||
//     callerExtId === normalizedExtension ||
//     calleeExtId === normalizedExtension
//   );
// }

// /**
//  * =========================================================
//  * DETERMINE CALL OWNER
//  *
//  * Priority:
//  *
//  * 1. Caller extension
//  * 2. Callee extension
//  *
//  * If both belong to CRM users, caller wins.
//  * =========================================================
//  */

// async function determineCallOwner(call, fallbackUserId) {
//   const {
//     callerExtension,
//     calleeExtension,
//     callerExtId,
//     calleeExtId,
//   } = getCallExtensions(call);

//   const possibleExtensions = [
//     callerExtension,
//     callerExtId,
//     calleeExtension,
//     calleeExtId,
//   ].filter(Boolean);

//   const uniqueExtensions = [
//     ...new Set(possibleExtensions),
//   ];

//   for (const extension of uniqueExtensions) {
//     const user =
//       await findUserByExtension(
//         extension
//       );

//     if (user) {
//       return user.id;
//     }
//   }

//   return fallbackUserId;
// }

// /**
//  * =========================================================
//  * NORMALIZE CALL
//  * =========================================================
//  */

// function normalizeCall(call) {
//   const callerExtension =
//     normalizeExtension(
//       call?.caller_ext_number
//     );

//   const calleeExtension =
//     normalizeExtension(
//       call?.callee_ext_number
//     );

//   return {
//     id:
//       call?.id ||
//       call?.call_history_uuid ||
//       call?.call_id ||
//       null,

//     call_history_uuid:
//       call?.call_history_uuid ||
//       call?.id ||
//       null,

//     zoom_call_id:
//       call?.call_id ||
//       null,

//     direction:
//       call?.direction ||
//       null,

//     call_type:
//       call?.call_type ||
//       null,

//     connect_type:
//       call?.connect_type ||
//       null,

//     caller_name:
//       call?.caller_name ||
//       null,

//     caller_number:
//       call?.caller_did_number ||
//       call?.caller_number ||
//       null,

//     caller_extension:
//       callerExtension,

//     receiver_name:
//       call?.callee_name ||
//       call?.receiver_name ||
//       null,

//     receiver_number:
//       call?.callee_did_number ||
//       call?.receiver_number ||
//       null,

//     receiver_extension:
//       calleeExtension,

//     status:
//       call?.call_result ||
//       call?.call_status ||
//       null,

//     start_time:
//       call?.start_time ||
//       null,

//     end_time:
//       call?.end_time ||
//       null,

//     duration_seconds:
//       Number(call?.duration || 0),

//     department:
//       call?.department ||
//       null,

//     site_name:
//       call?.site_name ||
//       null,

//     site_id:
//       call?.site_id ||
//       null,

//     raw_zoom_data: call,
//   };
// }

// /**
//  * =========================================================
//  * CHECK DUPLICATE
//  * =========================================================
//  */

// async function callAlreadyExists(call) {
//   if (
//     !call.call_history_uuid &&
//     !call.zoom_call_id
//   ) {
//     return false;
//   }

//   const rows = await query(
//     `
//       SELECT id
//       FROM zoom_call_logs
//       WHERE
//         (
//           call_history_uuid IS NOT NULL
//           AND call_history_uuid = ?
//         )
//         OR
//         (
//           zoom_call_id IS NOT NULL
//           AND zoom_call_id = ?
//         )
//       LIMIT 1
//     `,
//     [
//       call.call_history_uuid,
//       call.zoom_call_id,
//     ]
//   );

//   return rows && rows.length > 0;
// }

// /**
//  * =========================================================
//  * SAVE CALL
//  * =========================================================
//  */

// async function saveCall(call, ownerUserId) {
//   await query(
//     `
//       INSERT INTO zoom_call_logs
//       (
//         user_id,
//         call_history_uuid,
//         zoom_call_id,
//         direction,
//         call_type,
//         connect_type,
//         caller_name,
//         caller_number,
//         receiver_name,
//         receiver_number,
//         call_status,
//         start_time,
//         end_time,
//         duration_seconds,
//         zoom_data
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `,
//     [
//       ownerUserId,

//       call.call_history_uuid,

//       call.zoom_call_id,

//       call.direction,

//       call.call_type,

//       call.connect_type,

//       call.caller_name,

//       call.caller_number,

//       call.receiver_name,

//       call.receiver_number,

//       call.status,

//       call.start_time
//         ? new Date(call.start_time)
//         : null,

//       call.end_time
//         ? new Date(call.end_time)
//         : null,

//       call.duration_seconds,

//       JSON.stringify(
//         call.raw_zoom_data
//       ),
//     ]
//   );
// }

// /**
//  * =========================================================
//  * GET
//  * =========================================================
//  */

// export async function GET(request) {
//   try {
//     console.log("");
//     console.log("====================================");
//     console.log("     ZOOM CALL HISTORY API");
//     console.log("====================================");

//     /**
//      * -----------------------------------------------------
//      * 1. CRM AUTH
//      * -----------------------------------------------------
//      */

//     const cookieToken =
//       request.cookies.get("token")?.value;

//     const bearerToken =
//       getBearerToken(request);

//     const token =
//       cookieToken || bearerToken;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "CRM login required",
//         },
//         { status: 401 }
//       );
//     }

//     let decoded;

//     try {
//       decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET
//       );
//     } catch (error) {
//       console.error(
//         "JWT ERROR:",
//         error
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Invalid or expired CRM session",
//         },
//         { status: 401 }
//       );
//     }

//     const loggedInUserId =
//       Number(decoded.id);

//     if (!loggedInUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "CRM user ID missing from token",
//         },
//         { status: 401 }
//       );
//     }

//     /**
//      * -----------------------------------------------------
//      * 2. GET LOGGED-IN USER
//      * -----------------------------------------------------
//      */

//     const users = await query(
//       `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           zoom_extension
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//       `,
//       [loggedInUserId]
//     );

//     if (!users || users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "CRM user not found",
//         },
//         { status: 404 }
//       );
//     }

//     const loggedInUser =
//       users[0];

//     const isAdmin =
//       String(
//         loggedInUser.role || ""
//       ).toLowerCase() ===
//       "admin";

//     const loggedInExtension =
//       normalizeExtension(
//         loggedInUser.zoom_extension
//       );

//     console.log(
//       "CRM USER ID:",
//       loggedInUser.id
//     );

//     console.log(
//       "CRM USER:",
//       loggedInUser.name
//     );

//     console.log(
//       "CRM ROLE:",
//       loggedInUser.role
//     );

//     console.log(
//       "IS ADMIN:",
//       isAdmin
//     );

//     console.log(
//       "CRM EXTENSION:",
//       loggedInExtension
//     );

//     /**
//      * -----------------------------------------------------
//      * 3. GET ADMIN
//      *
//      * IMPORTANT:
//      *
//      * Even if an agent is logged in,
//      * we get the ADMIN's Zoom connection.
//      * -----------------------------------------------------
//      */

//     const adminUser =
//       await getAdminUser();

//     if (!adminUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "No CRM admin found",
//         },
//         { status: 500 }
//       );
//     }

//     console.log(
//       "ZOOM CONNECTION OWNER:",
//       adminUser.id
//     );

//     console.log(
//       "ZOOM CONNECTION OWNER NAME:",
//       adminUser.name
//     );

//     /**
//      * -----------------------------------------------------
//      * 4. GET ADMIN ZOOM CONNECTION
//      * -----------------------------------------------------
//      */

//     const zoomConnection =
//       await getAdminZoomConnection(
//         adminUser.id
//       );

//     if (!zoomConnection) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Admin Zoom is not connected",
//           logged_in_user: {
//             id: loggedInUser.id,
//             name: loggedInUser.name,
//             email: loggedInUser.email,
//             role: loggedInUser.role,
//             zoom_extension:
//               loggedInUser.zoom_extension,
//           },
//           zoom_connection_owner: {
//             id: adminUser.id,
//             name: adminUser.name,
//             email: adminUser.email,
//           },
//           access: {
//             mode: isAdmin
//               ? "all"
//               : "own",
//             is_admin: isAdmin,
//             extension:
//               loggedInExtension,
//           },
//         },
//         { status: 401 }
//       );
//     }

//     if (
//       !zoomConnection.access_token
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Admin Zoom connection exists but access token is missing",
//         },
//         { status: 401 }
//       );
//     }

//     console.log(
//       "ZOOM CONNECTION FOUND:",
//       zoomConnection.id
//     );

//     console.log(
//       "ZOOM EMAIL:",
//       zoomConnection.zoom_email
//     );

//     /**
//      * -----------------------------------------------------
//      * 5. ENSURE ACCESS TOKEN
//      * -----------------------------------------------------
//      */

//     const tokenResult =
//       await ensureValidZoomToken(
//         zoomConnection
//       );

//     if (!tokenResult.ok) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             tokenResult.message ||
//             "Unable to get valid Zoom access token",
//           zoom_error:
//             tokenResult.data || null,
//         },
//         {
//           status:
//             tokenResult.status || 401,
//         }
//       );
//     }

//     const accessToken =
//       tokenResult.accessToken;

//     /**
//      * -----------------------------------------------------
//      * 6. DATE FILTER
//      * -----------------------------------------------------
//      */

//     const { searchParams } =
//       new URL(request.url);

//     const today =
//       new Date();

//     const defaultTo =
//       formatZoomDate(today);

//     const defaultFromDate =
//       new Date(today);

//     defaultFromDate.setDate(
//       defaultFromDate.getDate() - 7
//     );

//     const defaultFrom =
//       formatZoomDate(
//         defaultFromDate
//       );

//     const from =
//       searchParams.get("from") ||
//       defaultFrom;

//     const to =
//       searchParams.get("to") ||
//       defaultTo;

//     const pageSizeRaw =
//       Number(
//         searchParams.get(
//           "page_size"
//         )
//       ) || 100;

//     const pageSize =
//       Math.min(
//         Math.max(
//           pageSizeRaw,
//           1
//         ),
//         300
//       );

//     const nextPageToken =
//       searchParams.get(
//         "next_page_token"
//       ) || "";

//     console.log(
//       "FROM:",
//       from
//     );

//     console.log(
//       "TO:",
//       to
//     );

//     console.log(
//       "PAGE SIZE:",
//       pageSize
//     );

//     /**
//      * -----------------------------------------------------
//      * 7. CALL ZOOM
//      * -----------------------------------------------------
//      */

//     let zoomResult =
//       await getZoomCallHistory({
//         accessToken,
//         from,
//         to,
//         pageSize,
//         nextPageToken,
//       });

//     /**
//      * -----------------------------------------------------
//      * 8. HANDLE 401
//      *
//      * If Zoom says token invalid even though DB expiry
//      * looked valid, refresh once and retry.
//      * -----------------------------------------------------
//      */

//     if (
//       !zoomResult.ok &&
//       (
//         zoomResult.status === 401 ||
//         zoomResult.data?.code === 124
//       )
//     ) {
//       console.log(
//         "ZOOM RETURNED 401 - REFRESHING TOKEN"
//       );

//       const refreshed =
//         await refreshZoomAccessToken(
//           zoomConnection
//         );

//       if (refreshed.ok) {
//         zoomResult =
//           await getZoomCallHistory({
//             accessToken:
//               refreshed.accessToken,
//             from,
//             to,
//             pageSize,
//             nextPageToken,
//           });
//       }
//     }

//     /**
//      * -----------------------------------------------------
//      * 9. ZOOM ERROR
//      * -----------------------------------------------------
//      */

//     if (!zoomResult.ok) {
//       if (
//         zoomResult.status === 401 ||
//         zoomResult.data?.code === 124
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Zoom access token is expired or invalid. Please reconnect Admin Zoom.",
//             zoom_error:
//               zoomResult.data,
//           },
//           { status: 401 }
//         );
//       }

//       if (
//         zoomResult.status === 429
//       ) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Zoom API rate limit reached. Please wait a few seconds and try again.",
//             zoom_error:
//               zoomResult.data,
//           },
//           { status: 429 }
//         );
//       }

//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Zoom call history API failed",
//           zoom_error:
//             zoomResult.data,
//         },
//         {
//           status:
//             zoomResult.status || 500,
//         }
//       );
//     }

//     /**
//      * -----------------------------------------------------
//      * 10. NORMALIZE ZOOM RESPONSE
//      * -----------------------------------------------------
//      */

//     const rawCalls =
//       zoomResult.data?.call_history ||
//       zoomResult.data?.call_logs ||
//       [];

//     console.log(
//       "ZOOM CALLS RECEIVED:",
//       rawCalls.length
//     );

//     /**
//      * -----------------------------------------------------
//      * 11. ACCESS FILTER
//      *
//      * ADMIN:
//      *    ALL CALLS
//      *
//      * AGENT:
//      *    ONLY OWN EXTENSION
//      * -----------------------------------------------------
//      */

//     let filteredRawCalls =
//       rawCalls;

//     if (!isAdmin) {
//       if (!loggedInExtension) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Your CRM user does not have a Zoom extension assigned",
//             logged_in_user: {
//               id: loggedInUser.id,
//               name: loggedInUser.name,
//               email: loggedInUser.email,
//               role: loggedInUser.role,
//               zoom_extension:
//                 loggedInUser.zoom_extension,
//             },
//           },
//           { status: 403 }
//         );
//       }

//       filteredRawCalls =
//         rawCalls.filter(
//           (call) =>
//             callBelongsToExtension(
//               call,
//               loggedInExtension
//             )
//         );
//     }

//     console.log(
//       "CALLS AFTER ACCESS FILTER:",
//       filteredRawCalls.length
//     );

//     /**
//      * -----------------------------------------------------
//      * 12. NORMALIZE CALLS
//      * -----------------------------------------------------
//      */

//     const calls =
//       filteredRawCalls.map(
//         normalizeCall
//       );

//     /**
//      * -----------------------------------------------------
//      * 13. SAVE CALLS
//      *
//      * Admin:
//      *    Calls are assigned to matching CRM users.
//      *
//      * Agent:
//      *    Calls belong to logged-in agent unless a
//      *    matching extension is found.
//      * -----------------------------------------------------
//      */

//     let savedCount = 0;
//     let duplicateCount = 0;

//     for (const call of calls) {
//       /**
//        * Determine owner.
//        */

//       let ownerUserId =
//         loggedInUserId;

//       /**
//        * For ADMIN:
//        *
//        * Find actual CRM owner from extension.
//        */

//       if (isAdmin) {
//         ownerUserId =
//           await determineCallOwner(
//             call.raw_zoom_data,
//             adminUser.id
//           );
//       } else {
//         /**
//          * Agent:
//          *
//          * Always associate with logged-in agent.
//          */

//         ownerUserId =
//           loggedInUserId;
//       }

//       /**
//        * Check duplicate.
//        */

//       const exists =
//         await callAlreadyExists(
//           call
//         );

//       if (exists) {
//         duplicateCount++;
//         continue;
//       }

//       /**
//        * Save.
//        */

//       await saveCall(
//         call,
//         ownerUserId
//       );

//       savedCount++;
//     }

//     /**
//      * -----------------------------------------------------
//      * 14. FINAL RESPONSE
//      * -----------------------------------------------------
//      */

//     return NextResponse.json({
//       success: true,

//       message: isAdmin
//         ? "All Zoom account call history loaded successfully"
//         : "Your Zoom call history loaded successfully",

//       logged_in_user: {
//         id: loggedInUser.id,
//         name: loggedInUser.name,
//         email: loggedInUser.email,
//         role: loggedInUser.role,
//         zoom_extension:
//           loggedInUser.zoom_extension,
//       },

//       zoom_connection_owner: {
//         id: adminUser.id,
//         name: adminUser.name,
//         email: adminUser.email,
//       },

//       access: {
//         mode: isAdmin
//           ? "all"
//           : "own",

//         is_admin:
//           isAdmin,

//         extension:
//           loggedInExtension,

//         requires_own_zoom_connection:
//           false,
//       },

//       zoom: {
//         account_id:
//           tokenResult.connection
//             ?.zoom_account_id ||
//           zoomConnection.zoom_account_id,

//         zoom_user_id:
//           tokenResult.connection
//             ?.zoom_user_id ||
//           zoomConnection.zoom_user_id,

//         zoom_email:
//           tokenResult.connection
//             ?.zoom_email ||
//           zoomConnection.zoom_email,
//       },

//       filters: {
//         from,
//         to,
//       },

//       pagination: {
//         page_size:
//           pageSize,

//         next_page_token:
//           zoomResult.data
//             ?.next_page_token ||
//           null,

//         total_records:
//           zoomResult.data
//             ?.total_records ??
//           rawCalls.length,
//       },

//       stats: {
//         zoom_records_received:
//           rawCalls.length,

//         records_after_access_filter:
//           calls.length,

//         records_saved_to_crm:
//           savedCount,

//         duplicate_records:
//           duplicateCount,
//       },

//       calls,
//     });
//   } catch (error) {
//     console.error(
//       "===================================="
//     );

//     console.error(
//       "ZOOM CALL HISTORY SERVER ERROR"
//     );

//     console.error(error);

//     console.error(
//       "===================================="
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.message ||
//           "Zoom call history server error",
//       },
//       { status: 500 }
//     );
//   }
// }




