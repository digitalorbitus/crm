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
// import db from "../../../lib/db";


// // =====================================================
// // HELPERS
// // =====================================================

// function normalizeExtension(value) {
//   if (value === undefined || value === null) {
//     return null;
//   }

//   const cleaned = String(value)
//     .trim()
//     .replace(/^Ext\.?/i, "");

//   return cleaned || null;
// }


// // -----------------------------------------------------
// // Get all possible extensions from a call
// // -----------------------------------------------------

// function getCallExtensions(call) {
//   const possibleValues = [
//     call.caller_ext_number,
//     call.callee_ext_number,

//     call.caller_extension,
//     call.callee_extension,

//     call.caller_ext,
//     call.callee_ext,

//     call.from_extension,
//     call.to_extension,

//     call.extension,
//     call.user_extension,
//   ];

//   return [
//     ...new Set(
//       possibleValues
//         .map(normalizeExtension)
//         .filter(Boolean)
//     ),
//   ];
// }


// // -----------------------------------------------------
// // Check whether call belongs to extension
// // -----------------------------------------------------

// function callBelongsToExtension(call, targetExtension) {
//   const target = normalizeExtension(targetExtension);

//   if (!target) {
//     return false;
//   }

//   const callExtensions = getCallExtensions(call);

//   return callExtensions.includes(target);
// }


// // -----------------------------------------------------
// // Remove duplicate calls
// // -----------------------------------------------------

// function uniqueByCallId(calls) {
//   const map = new Map();

//   for (const call of calls) {
//     const id =
//       call.id ||
//       call.call_id ||
//       call.call_log_id ||
//       `${call.start_time}-${call.caller_number}-${call.callee_number}`;

//     if (!map.has(id)) {
//       map.set(id, call);
//     }
//   }

//   return Array.from(map.values());
// }


// // -----------------------------------------------------
// // Zoom API helper
// // -----------------------------------------------------

// async function zoomFetch(url, accessToken) {
//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//       "Content-Type": "application/json",
//     },

//     cache: "no-store",
//   });

//   const text = await response.text();

//   let data;

//   try {
//     data = JSON.parse(text);
//   } catch {
//     data = {
//       raw: text,
//     };
//   }

//   if (!response.ok) {
//     console.error("ZOOM API ERROR:", {
//       url,
//       status: response.status,
//       data,
//     });

//     throw new Error(
//       data?.message ||
//       data?.error ||
//       `Zoom API returned ${response.status}`
//     );
//   }

//   return data;
// }


// // =====================================================
// // GET CALL HISTORY
// // =====================================================

// export async function GET(request) {
//   try {

//     // =================================================
//     // 1. CHECK JWT COOKIE
//     // =================================================

//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized - token missing",
//         },
//         {
//           status: 401,
//         }
//       );
//     }


//     // =================================================
//     // 2. VERIFY JWT
//     // =================================================

//     let decoded;

//     try {
//       decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET
//       );
//     } catch (error) {
//       console.error("JWT ERROR:", error);

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid or expired token",
//         },
//         {
//           status: 401,
//         }
//       );
//     }


//     // =================================================
//     // 3. GET LOGGED-IN CRM USER
//     // =================================================

//     const [userRows] = await db.execute(
//       `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           status,
//           zoom_extension
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//       `,
//       [decoded.id]
//     );


//     if (!userRows.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "CRM user not found",
//         },
//         {
//           status: 404,
//         }
//       );
//     }


//     const loggedInUser = userRows[0];


//     // =================================================
//     // 4. CHECK USER STATUS
//     // =================================================

//     if (
//       String(loggedInUser.status || "").toLowerCase() ===
//       "inactive"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User account is inactive",
//         },
//         {
//           status: 403,
//         }
//       );
//     }


//     // =================================================
//     // 5. USER ACCESS MODE
//     // =================================================

//     const userExtension = normalizeExtension(
//       loggedInUser.zoom_extension
//     );

//     const isAdmin =
//       String(loggedInUser.role || "").toLowerCase() ===
//       "admin";

//     let accessMode = "none";


//     /*
//       IMPORTANT RULE:

//       ADMIN
//       -------
//       Admin ALWAYS gets ALL calls.
//       Even if admin has extension 800/802/etc.

//       AGENT / STAFF
//       -------------
//       Only their assigned extension.

//       NO EXTENSION
//       ------------
//       No calls.
//     */

//     if (isAdmin) {
//       accessMode = "all";
//     } else if (userExtension) {
//       accessMode = "extension";
//     } else {
//       accessMode = "none";
//     }


//     console.log("====================================");
//     console.log("ZOOM CALL ACCESS");
//     console.log("USER ID:", loggedInUser.id);
//     console.log("USER NAME:", loggedInUser.name);
//     console.log("USER EMAIL:", loggedInUser.email);
//     console.log("ROLE:", loggedInUser.role);
//     console.log("EXTENSION:", userExtension);
//     console.log("IS ADMIN:", isAdmin);
//     console.log("ACCESS MODE:", accessMode);
//     console.log("====================================");


//     // =================================================
//     // 6. GET ZOOM CONNECTION
//     // =================================================

//     /*
//       We use an active ADMIN Zoom connection as the
//       shared Zoom account connection.

//       If no admin connection exists, fallback to the
//       logged-in user's Zoom connection.
//     */

//     let connectionRows = [];

//     const [adminConnectionRows] = await db.execute(
//       `
//         SELECT *
//         FROM zoom_connections
//         WHERE user_id IN (
//           SELECT id
//           FROM users
//           WHERE LOWER(role) = 'admin'
//           AND status != 'Inactive'
//         )
//         AND access_token IS NOT NULL
//         ORDER BY id ASC
//         LIMIT 1
//       `
//     );

//     if (adminConnectionRows.length) {
//       connectionRows = adminConnectionRows;
//     } else {

//       const [userConnectionRows] = await db.execute(
//         `
//           SELECT *
//           FROM zoom_connections
//           WHERE user_id = ?
//           AND access_token IS NOT NULL
//           ORDER BY id DESC
//           LIMIT 1
//         `,
//         [loggedInUser.id]
//       );

//       connectionRows = userConnectionRows;
//     }


//     if (!connectionRows.length) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "No active Zoom connection found",
//           logged_in_user: {
//             id: loggedInUser.id,
//             name: loggedInUser.name,
//             email: loggedInUser.email,
//             role: loggedInUser.role,
//             zoom_extension:
//               loggedInUser.zoom_extension,
//           },
//           access: {
//             mode: accessMode,
//             is_admin: isAdmin,
//             extension: userExtension,
//           },
//         },
//         {
//           status: 404,
//         }
//       );
//     }


//     let zoomConnection = connectionRows[0];


//     // =================================================
//     // 7. REFRESH ZOOM TOKEN IF NEEDED
//     // =================================================

//     let accessToken = zoomConnection.access_token;

//     const expiresAt = zoomConnection.expires_at
//       ? new Date(zoomConnection.expires_at).getTime()
//       : null;

//     const now = Date.now();

//     /*
//       Refresh if token expires in less than 5 minutes.
//     */

//     if (
//       expiresAt &&
//       expiresAt - now < 5 * 60 * 1000
//     ) {

//       if (!zoomConnection.refresh_token) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Zoom access token expired and refresh token is missing",
//           },
//           {
//             status: 401,
//           }
//         );
//       }


//       console.log(
//         "Refreshing Zoom access token..."
//       );


//       const clientId =
//         process.env.ZOOM_CLIENT_ID;

//       const clientSecret =
//         process.env.ZOOM_CLIENT_SECRET;


//       if (!clientId || !clientSecret) {
//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               "Zoom OAuth credentials are missing",
//           },
//           {
//             status: 500,
//           }
//         );
//       }


//       const basicAuth = Buffer.from(
//         `${clientId}:${clientSecret}`
//       ).toString("base64");


//       const refreshResponse =
//         await fetch(
//           "https://zoom.us/oauth/token",
//           {
//             method: "POST",

//             headers: {
//               Authorization: `Basic ${basicAuth}`,
//               "Content-Type":
//                 "application/x-www-form-urlencoded",
//             },

//             body:
//               new URLSearchParams({
//                 grant_type: "refresh_token",
//                 refresh_token:
//                   zoomConnection.refresh_token,
//               }).toString(),

//             cache: "no-store",
//           }
//         );


//       const refreshText =
//         await refreshResponse.text();

//       let refreshData;

//       try {
//         refreshData =
//           JSON.parse(refreshText);
//       } catch {
//         refreshData = {};
//       }


//       if (!refreshResponse.ok) {
//         console.error(
//           "ZOOM TOKEN REFRESH ERROR:",
//           refreshData
//         );

//         return NextResponse.json(
//           {
//             success: false,
//             message:
//               refreshData?.reason ||
//               refreshData?.message ||
//               "Unable to refresh Zoom token",
//           },
//           {
//             status: 401,
//           }
//         );
//       }


//       accessToken =
//         refreshData.access_token;


//       const newRefreshToken =
//         refreshData.refresh_token ||
//         zoomConnection.refresh_token;


//       const newExpiresAt =
//         new Date(
//           Date.now() +
//             Number(
//               refreshData.expires_in || 3600
//             ) *
//               1000
//         );


//       await db.execute(
//         `
//           UPDATE zoom_connections
//           SET
//             access_token = ?,
//             refresh_token = ?,
//             expires_at = ?,
//             updated_at = NOW()
//           WHERE id = ?
//         `,
//         [
//           accessToken,
//           newRefreshToken,
//           newExpiresAt,
//           zoomConnection.id,
//         ]
//       );


//       zoomConnection.access_token =
//         accessToken;

//       zoomConnection.refresh_token =
//         newRefreshToken;

//       zoomConnection.expires_at =
//         newExpiresAt;
//     }


//     // =================================================
//     // 8. GET ALL CRM USERS
//     // =================================================

//     const [crmUsers] = await db.execute(
//       `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           status,
//           zoom_extension
//         FROM users
//         WHERE status != 'Inactive'
//       `
//     );


//     // =================================================
//     // 9. CRM EXTENSION MAP
//     // =================================================

//     const crmByExtension = new Map();

//     for (const user of crmUsers) {

//       const extension =
//         normalizeExtension(
//           user.zoom_extension
//         );

//       if (!extension) {
//         continue;
//       }

//       crmByExtension.set(
//         extension,
//         user
//       );
//     }


//     const crmExtensions =
//       Array.from(
//         crmByExtension.keys()
//       );


//     // =================================================
//     // 10. GET ALL ZOOM PHONE USERS
//     // =================================================

//     let zoomPhoneUsers = [];

//     let userNextPageToken = "";

//     do {

//       let url =
//         "https://api.zoom.us/v2/phone/users?page_size=100";

//       if (userNextPageToken) {
//         url +=
//           `&next_page_token=${encodeURIComponent(
//             userNextPageToken
//           )}`;
//       }


//       const data = await zoomFetch(
//         url,
//         accessToken
//       );


//       const users =
//         data.users ||
//         data.phone_users ||
//         [];


//       zoomPhoneUsers.push(
//         ...users
//       );


//       userNextPageToken =
//         data.next_page_token ||
//         "";

//     } while (userNextPageToken);


//     // =================================================
//     // 11. MAP ZOOM USERS BY EXTENSION
//     // =================================================

//     const zoomByExtension = new Map();


//     for (const zoomUser of zoomPhoneUsers) {

//       const extension =
//         normalizeExtension(
//           zoomUser.extension_number
//         );


//       if (!extension) {
//         continue;
//       }


//       zoomByExtension.set(
//         extension,
//         zoomUser
//       );
//     }


//     const zoomExtensions =
//       Array.from(
//         zoomByExtension.keys()
//       );


//     // =================================================
//     // 12. GET CALL HISTORY
//     // =================================================

//     let allCalls = [];

//     let callNextPageToken = "";


//     /*
//       Optional date filters.

//       Example:
//       ?from=2026-09-01&to=2026-09-08
//     */

//     const { searchParams } =
//       new URL(request.url);


//     const from =
//       searchParams.get("from");

//     const to =
//       searchParams.get("to");


//     do {

//       let url =
//         "https://api.zoom.us/v2/phone/call_history?page_size=100";


//       if (from) {
//         url +=
//           `&from=${encodeURIComponent(from)}`;
//       }


//       if (to) {
//         url +=
//           `&to=${encodeURIComponent(to)}`;
//       }


//       if (callNextPageToken) {
//         url +=
//           `&next_page_token=${encodeURIComponent(
//             callNextPageToken
//           )}`;
//       }


//       console.log(
//         "FETCHING ZOOM CALL HISTORY:",
//         url
//       );


//       const data =
//         await zoomFetch(
//           url,
//           accessToken
//         );


//       const calls =
//         data.call_logs ||
//         data.calls ||
//         [];


//       allCalls.push(
//         ...calls
//       );


//       callNextPageToken =
//         data.next_page_token ||
//         "";


//     } while (callNextPageToken);


//     console.log(
//       "TOTAL ZOOM CALLS:",
//       allCalls.length
//     );


//     // =================================================
//     // 13. REMOVE DUPLICATES
//     // =================================================

//     const uniqueCalls =
//       uniqueByCallId(allCalls);


//     console.log(
//       "UNIQUE CALLS:",
//       uniqueCalls.length
//     );


//     // =================================================
//     // 14. FILTER CALLS BY LOGGED-IN USER
//     // =================================================

//     let visibleCalls = [];


//     if (accessMode === "all") {

//       // ===============================================
//       // ADMIN = ALL CALLS
//       // ===============================================

//       visibleCalls =
//         uniqueCalls;


//     } else if (
//       accessMode === "extension"
//     ) {

//       // ===============================================
//       // AGENT / STAFF = OWN EXTENSION ONLY
//       // ===============================================

//       visibleCalls =
//         uniqueCalls.filter(
//           (call) =>
//             callBelongsToExtension(
//               call,
//               userExtension
//             )
//         );


//     } else {

//       // ===============================================
//       // NO EXTENSION = NO CALLS
//       // ===============================================

//       visibleCalls = [];
//     }


//     console.log(
//       "VISIBLE CALLS:",
//       visibleCalls.length
//     );


//     // =================================================
//     // 15. ENRICH CALL DATA
//     // =================================================

//     const enrichedCalls =
//       visibleCalls.map(
//         (call) => {

//           const callExtensions =
//             getCallExtensions(call);


//           // Find CRM user from any matching extension
//           let crmUser = null;

//           for (
//             const extension
//             of callExtensions
//           ) {

//             if (
//               crmByExtension.has(
//                 extension
//               )
//             ) {

//               crmUser =
//                 crmByExtension.get(
//                   extension
//                 );

//               break;
//             }
//           }


//           // Find Zoom user from any matching extension
//           let zoomUser = null;

//           for (
//             const extension
//             of callExtensions
//           ) {

//             if (
//               zoomByExtension.has(
//                 extension
//               )
//             ) {

//               zoomUser =
//                 zoomByExtension.get(
//                   extension
//                 );

//               break;
//             }
//           }


//           return {
//             ...call,

//             // -----------------------------------------
//             // CRM INFO
//             // -----------------------------------------

//             crm_extension:
//               crmUser?.zoom_extension ||
//               null,

//             crm_user_id:
//               crmUser?.id ||
//               null,

//             crm_user_name:
//               crmUser?.name ||
//               null,

//             crm_user_email:
//               crmUser?.email ||
//               null,

//             crm_user_role:
//               crmUser?.role ||
//               null,


//             // -----------------------------------------
//             // ZOOM INFO
//             // -----------------------------------------

//             zoom_user_id:
//               zoomUser?.id ||
//               null,

//             zoom_user_name:
//               zoomUser?.display_name ||
//               zoomUser?.user_name ||
//               zoomUser?.email ||
//               null,

//             zoom_user_email:
//               zoomUser?.email ||
//               null,

//             zoom_extension:
//               zoomUser?.extension_number ||
//               null,


//             // -----------------------------------------
//             // DETECTED EXTENSIONS
//             // -----------------------------------------

//             matched_extensions:
//               callExtensions,
//           };
//         }
//       );


//     // =================================================
//     // 16. BUILD VISIBLE EXTENSIONS
//     // =================================================

//     let visibleExtensions = [];


//     if (accessMode === "all") {

//       // ADMIN = ALL EXTENSIONS

//       visibleExtensions = [
//         ...new Set([
//           ...zoomExtensions,
//           ...crmExtensions,
//         ]),
//       ];

//     } else if (
//       accessMode === "extension"
//     ) {

//       // NORMAL USER = OWN EXTENSION ONLY

//       visibleExtensions =
//         userExtension
//           ? [userExtension]
//           : [];

//     } else {

//       visibleExtensions = [];
//     }


//     // =================================================
//     // 17. EXTENSION COUNTS
//     // =================================================

//     const extensionCounts = {};


//     for (
//       const extension
//       of visibleExtensions
//     ) {

//       extensionCounts[
//         extension
//       ] = 0;
//     }


//     for (
//       const call
//       of enrichedCalls
//     ) {

//       const extensions =
//         call.matched_extensions ||
//         [];


//       for (
//         const extension
//         of extensions
//       ) {

//         if (
//           extensionCounts[
//             extension
//           ] !== undefined
//         ) {

//           extensionCounts[
//             extension
//           ]++;
//         }
//       }
//     }


//     // =================================================
//     // 18. FORMAT ZOOM PHONE USERS FOR RESPONSE
//     // =================================================

//     let visibleZoomPhoneUsers = [];


//     if (accessMode === "all") {

//       // ADMIN = ALL ZOOM PHONE USERS

//       visibleZoomPhoneUsers =
//         zoomPhoneUsers.map(
//           (user) => {

//             const extension =
//               normalizeExtension(
//                 user.extension_number
//               );


//             const crmUser =
//               extension
//                 ? crmByExtension.get(
//                     extension
//                   )
//                 : null;


//             return {
//               id: user.id,

//               extension_number:
//                 user.extension_number ||
//                 null,

//               display_name:
//                 user.display_name ||
//                 null,

//               email:
//                 user.email ||
//                 null,

//               phone_number:
//                 user.phone_number ||
//                 null,

//               status:
//                 user.status ||
//                 null,

//               crm_user_id:
//                 crmUser?.id ||
//                 null,

//               crm_user_name:
//                 crmUser?.name ||
//                 null,

//               crm_user_email:
//                 crmUser?.email ||
//                 null,

//               crm_user_role:
//                 crmUser?.role ||
//                 null,
//             };
//           }
//         );

//     } else if (
//       accessMode === "extension"
//     ) {

//       // NORMAL USER = ONLY OWN ZOOM USER

//       visibleZoomPhoneUsers =
//         zoomPhoneUsers
//           .filter(
//             (user) =>
//               normalizeExtension(
//                 user.extension_number
//               ) === userExtension
//           )
//           .map(
//             (user) => {

//               const crmUser =
//                 crmByExtension.get(
//                   userExtension
//                 );


//               return {
//                 id: user.id,

//                 extension_number:
//                   user.extension_number ||
//                   null,

//                 display_name:
//                   user.display_name ||
//                   null,

//                 email:
//                   user.email ||
//                   null,

//                 phone_number:
//                   user.phone_number ||
//                   null,

//                 status:
//                   user.status ||
//                   null,

//                 crm_user_id:
//                   crmUser?.id ||
//                   null,

//                 crm_user_name:
//                   crmUser?.name ||
//                   null,

//                 crm_user_email:
//                   crmUser?.email ||
//                   null,

//                 crm_user_role:
//                   crmUser?.role ||
//                   null,
//               };
//             }
//           );

//     } else {

//       visibleZoomPhoneUsers = [];
//     }


//     // =================================================
//     // 19. FINAL RESPONSE
//     // =================================================

//     return NextResponse.json(
//       {
//         success: true,

//         message:
//           "Zoom call history loaded successfully",


//         // ---------------------------------------------
//         // LOGGED-IN USER
//         // ---------------------------------------------

//         logged_in_user: {
//           id:
//             loggedInUser.id,

//           name:
//             loggedInUser.name,

//           email:
//             loggedInUser.email,

//           role:
//             loggedInUser.role,

//           zoom_extension:
//             loggedInUser.zoom_extension ||
//             null,
//         },


//         // ---------------------------------------------
//         // ACCESS
//         // ---------------------------------------------

//         access: {
//           mode:
//             accessMode,

//           is_admin:
//             isAdmin,

//           extension:
//             userExtension,

//           can_view_all_calls:
//             accessMode === "all",
//         },


//         // ---------------------------------------------
//         // ZOOM CONNECTION
//         // ---------------------------------------------

//         zoom_connection: {
//           id:
//             zoomConnection.id,

//           user_id:
//             zoomConnection.user_id ||
//             null,

//           expires_at:
//             zoomConnection.expires_at ||
//             null,
//         },


//         // ---------------------------------------------
//         // ZOOM PHONE USERS
//         // ---------------------------------------------

//         zoom_phone_users:
//           visibleZoomPhoneUsers,


//         // ---------------------------------------------
//         // EXTENSIONS
//         // ---------------------------------------------

//         extensions:
//           visibleExtensions,


//         extension_counts:
//           extensionCounts,


//         // ---------------------------------------------
//         // CALLS
//         // ---------------------------------------------

//         calls:
//           enrichedCalls,


//         total_records:
//           enrichedCalls.length,


//         // ---------------------------------------------
//         // REQUEST FILTER
//         // ---------------------------------------------

//         filters: {
//           from:
//             from || null,

//           to:
//             to || null,
//         },


//         // ---------------------------------------------
//         // PAGINATION INFO
//         // ---------------------------------------------

//         pagination: {
//           zoom_call_pages:
//             "all",

//           total_fetched:
//             allCalls.length,

//           total_unique:
//             uniqueCalls.length,

//           total_visible:
//             enrichedCalls.length,
//         },
//       },
//       {
//         status: 200,
//       }
//     );


//   } catch (error) {

//     console.error(
//       "===================================="
//     );

//     console.error(
//       "ZOOM CALL HISTORY ERROR"
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
//           "Failed to load Zoom call history",

//         error:
//           process.env.NODE_ENV === "development"
//             ? error?.stack ||
//               String(error)
//             : undefined,
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }