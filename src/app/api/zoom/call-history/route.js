// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { query, zoomConfig } from "../../../lib/db";

// export async function GET(request) {
//   try {
//     // ==========================================
//     // 1. CRM LOGIN
//     // ==========================================

//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM login required",
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
//       console.error("JWT ERROR:", error);

//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid or expired CRM session",
//         },
//         { status: 401 }
//       );
//     }

//     const crmUserId = decoded?.id;

//     if (!crmUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM user ID not found",
//         },
//         { status: 401 }
//       );
//     }

//     // ==========================================
//     // 2. GET ZOOM CONNECTION
//     // ==========================================

//     const connections = await query(
//       `
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
//       LIMIT 1
//       `,
//       [crmUserId]
//     );

//     if (!connections || connections.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           connected: false,
//           error: "Zoom account is not connected",
//         },
//         { status: 404 }
//       );
//     }

//     const connection = connections[0];

//     let accessToken =
//       connection.access_token;

//     // ==========================================
//     // 3. REFRESH ZOOM TOKEN
//     // ==========================================

//     let expiresAt =
//       connection.expires_at
//         ? new Date(connection.expires_at)
//         : null;

//     const now = Date.now();

//     const isExpired =
//       !expiresAt ||
//       expiresAt.getTime() <=
//         now + 2 * 60 * 1000;

//     if (isExpired) {
//       console.log(
//         "ZOOM ACCESS TOKEN EXPIRED - REFRESHING"
//       );

//       if (!connection.refresh_token) {
//         return NextResponse.json(
//           {
//             success: false,
//             connected: false,
//             error:
//               "Zoom session expired. Please reconnect Zoom.",
//           },
//           { status: 401 }
//         );
//       }

//       const credentials = Buffer
//         .from(
//           `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
//         )
//         .toString("base64");

//       const refreshResponse =
//         await fetch(
//           "https://zoom.us/oauth/token",
//           {
//             method: "POST",

//             headers: {
//               Authorization:
//                 `Basic ${credentials}`,

//               "Content-Type":
//                 "application/x-www-form-urlencoded",
//             },

//             body: new URLSearchParams({
//               grant_type:
//                 "refresh_token",

//               refresh_token:
//                 connection.refresh_token,
//             }).toString(),
//           }
//         );

//       const refreshData =
//         await refreshResponse.json();

//       console.log(
//         "ZOOM REFRESH STATUS:",
//         refreshResponse.status
//       );

//       if (!refreshResponse.ok) {
//         console.error(
//           "ZOOM REFRESH ERROR:",
//           refreshData
//         );

//         return NextResponse.json(
//           {
//             success: false,
//             connected: false,
//             error:
//               "Zoom session expired. Please reconnect Zoom.",
//             details: refreshData,
//           },
//           { status: 401 }
//         );
//       }

//       accessToken =
//         refreshData.access_token;

//       const newRefreshToken =
//         refreshData.refresh_token ||
//         connection.refresh_token;

//       expiresAt = new Date(
//         Date.now() +
//           Number(
//             refreshData.expires_in ||
//               3600
//           ) *
//             1000
//       );

//       await query(
//         `
//         UPDATE zoom_connections
//         SET
//           access_token = ?,
//           refresh_token = ?,
//           expires_at = ?
//         WHERE user_id = ?
//         `,
//         [
//           accessToken,
//           newRefreshToken,
//           expiresAt,
//           crmUserId,
//         ]
//       );

//       console.log(
//         "ZOOM TOKEN REFRESHED SUCCESSFULLY"
//       );
//     }

//     // ==========================================
//     // 4. QUERY PARAMETERS
//     // ==========================================

//     const { searchParams } =
//       new URL(request.url);

//     const from =
//       searchParams.get("from");

//     const to =
//       searchParams.get("to");

//     const requestedPageSize =
//       Number(
//         searchParams.get(
//           "page_size"
//         ) || 300
//       );

//     const pageSize = Math.min(
//       Math.max(
//         requestedPageSize,
//         1
//       ),
//       300
//     );

//     // ==========================================
//     // 5. FETCH ALL ZOOM CALL HISTORY
//     // ==========================================

//     let allCalls = [];

//     let nextPageToken = null;

//     let pageNumber = 0;

//     const MAX_PAGES = 100;

//     do {
//       pageNumber++;

//       const zoomUrl =
//         new URL(
//           "https://api.zoom.us/v2/phone/call_history"
//         );

//       zoomUrl.searchParams.set(
//         "page_size",
//         String(pageSize)
//       );

//       if (from) {
//         zoomUrl.searchParams.set(
//           "from",
//           from
//         );
//       }

//       if (to) {
//         zoomUrl.searchParams.set(
//           "to",
//           to
//         );
//       }

//       if (nextPageToken) {
//         zoomUrl.searchParams.set(
//           "next_page_token",
//           nextPageToken
//         );
//       }

//       console.log(
//         "===================================="
//       );

//       console.log(
//         "ZOOM CALL HISTORY PAGE:",
//         pageNumber
//       );

//       console.log(
//         "URL:",
//         zoomUrl.toString()
//       );

//       console.log(
//         "===================================="
//       );

//       const zoomResponse =
//         await fetch(
//           zoomUrl.toString(),
//           {
//             method: "GET",

//             headers: {
//               Authorization:
//                 `Bearer ${accessToken}`,

//               "Content-Type":
//                 "application/json",
//             },

//             cache: "no-store",

//             next: {
//               revalidate: 0,
//             },
//           }
//         );

//       const zoomData =
//         await zoomResponse.json();

//       console.log(
//         "ZOOM RESPONSE STATUS:",
//         zoomResponse.status
//       );

//       if (!zoomResponse.ok) {
//         console.error(
//           "ZOOM CALL HISTORY ERROR:",
//           zoomData
//         );

//         return NextResponse.json(
//           {
//             success: false,
//             error:
//               "Failed to retrieve Zoom call history",
//             details: zoomData,
//           },
//           {
//             status:
//               zoomResponse.status,
//           }
//         );
//       }

//       // ========================================
//       // SUPPORT BOTH RESPONSE FORMATS
//       // ========================================

//       const pageCalls =
//         zoomData.call_history ||
//         zoomData.call_logs ||
//         [];

//       console.log(
//         `PAGE ${pageNumber} RECORDS:`,
//         pageCalls.length
//       );

//       allCalls.push(
//         ...pageCalls
//       );

//       nextPageToken =
//         zoomData.next_page_token ||
//         null;

//       console.log(
//         "NEXT PAGE TOKEN:",
//         nextPageToken
//           ? "YES"
//           : "NO"
//       );

//       // Safety protection
//       if (
//         pageNumber >=
//         MAX_PAGES
//       ) {
//         console.warn(
//           "MAX PAGE LIMIT REACHED"
//         );

//         break;
//       }

//     } while (nextPageToken);

//     // ==========================================
//     // 6. REMOVE DUPLICATE CALLS
//     // ==========================================

//     const uniqueCallsMap =
//       new Map();

//     for (const call of allCalls) {
//       const uniqueId =
//         call.call_history_uuid ||
//         call.id ||
//         call.call_id ||
//         [
//           call.start_time,
//           call.caller_did_number,
//           call.callee_did_number,
//           call.direction,
//         ].join("-");

//       if (
//         !uniqueCallsMap.has(
//           uniqueId
//         )
//       ) {
//         uniqueCallsMap.set(
//           uniqueId,
//           call
//         );
//       }
//     }

//     const uniqueCalls =
//       Array.from(
//         uniqueCallsMap.values()
//       );

//     // ==========================================
//     // 7. GET EXTENSION FROM ZOOM CALL
//     // ==========================================

//     const getExtension =
//       (call) => {
//         const values = [
//           call.caller_ext_number,
//           call.callee_ext_number,

//           call.caller_extension,
//           call.callee_extension,

//           call.caller_ext,
//           call.callee_ext,

//           call.from_extension,
//           call.to_extension,

//           call.extension,
//           call.user_extension,
//         ];

//         for (
//           const value of values
//         ) {
//           if (
//             value !== undefined &&
//             value !== null &&
//             String(value).trim() !== ""
//           ) {
//             return String(
//               value
//             ).trim();
//           }
//         }

//         return null;
//       };

//     // ==========================================
//     // 8. ENRICH CALL DATA
//     // ==========================================

//     const enrichedCalls =
//       uniqueCalls.map(
//         (call) => {
//           const extension =
//             getExtension(
//               call
//             );

//           return {
//             ...call,

//             crm_extension:
//               extension,

//             crm_extension_label:
//               extension
//                 ? `Ext.${extension}`
//                 : null,
//           };
//         }
//       );

//     // ==========================================
//     // 9. DYNAMIC EXTENSIONS
//     // ==========================================

//     const extensionMap =
//       new Map();

//     for (
//       const call of enrichedCalls
//     ) {
//       const extension =
//         call.crm_extension;

//       if (
//         extension &&
//         !extensionMap.has(
//           extension
//         )
//       ) {
//         extensionMap.set(
//           extension,
//           {
//             extension,

//             label:
//               `Ext.${extension}`,

//             calls: 0,
//           }
//         );
//       }

//       if (extension) {
//         const item =
//           extensionMap.get(
//             extension
//           );

//         item.calls += 1;
//       }
//     }

//     const extensions =
//       Array.from(
//         extensionMap.values()
//       ).sort(
//         (a, b) =>
//           Number(a.extension) -
//           Number(b.extension)
//       );

//     // ==========================================
//     // 10. EXTENSION COUNTS
//     // ==========================================

//     const extensionCounts = {};

//     for (
//       const extension
//         of extensions
//     ) {
//       extensionCounts[
//         extension.extension
//       ] = extension.calls;
//     }

//     // ==========================================
//     // 11. DEBUG
//     // ==========================================

//     console.log(
//       "===================================="
//     );

//     console.log(
//       "TOTAL ZOOM RECORDS:",
//       allCalls.length
//     );

//     console.log(
//       "UNIQUE CALLS:",
//       uniqueCalls.length
//     );

//     console.log(
//       "DYNAMIC EXTENSIONS:",
//       extensions
//     );

//     console.log(
//       "EXTENSION COUNTS:",
//       extensionCounts
//     );

//     console.log(
//       "PAGES FETCHED:",
//       pageNumber
//     );

//     console.log(
//       "===================================="
//     );

//     // ==========================================
//     // 12. RETURN TO CRM
//     // ==========================================

//     return NextResponse.json(
//       {
//         success: true,

//         connected: true,

//         live: true,

//         calls:
//           enrichedCalls,

//         total_records:
//           enrichedCalls.length,

//         page_size:
//           pageSize,

//         pages_fetched:
//           pageNumber,

//         extensions:
//           extensions,

//         extension_counts:
//           extensionCounts,

//         from:
//           from || null,

//         to:
//           to || null,

//         fetched_at:
//           new Date().toISOString(),

//         next_page_token:
//           null,
//       },
//       {
//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate, proxy-revalidate",

//           Pragma: "no-cache",

//           Expires: "0",
//         },
//       }
//     );

//   } catch (error) {
//     console.error(
//       "===================================="
//     );

//     console.error(
//       "CALL HISTORY SERVER ERROR"
//     );

//     console.error(
//       "ERROR:",
//       error
//     );

//     console.error(
//       "MESSAGE:",
//       error?.message
//     );

//     console.error(
//       "STACK:",
//       error?.stack
//     );

//     console.error(
//       "===================================="
//     );

//     return NextResponse.json(
//       {
//         success: false,

//         error:
//           error?.message ||
//           "Call history server error",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }





// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { query, zoomConfig } from "../../../lib/db";

// // ============================================================
// // CONFIG
// // ============================================================

// const ZOOM_CALL_HISTORY_URL =
//   "https://api.zoom.us/v2/phone/call_history";

// const DEFAULT_PAGE_SIZE = 300;
// const MAX_PAGE_SIZE = 300;

// const MAX_PAGES = 100;

// // Delay between successful Zoom pagination requests.
// // This helps avoid hitting per-second limits.
// const PAGE_DELAY_MS = 350;

// // Retry configuration for HTTP 429
// const MAX_429_RETRIES = 3;

// const BASE_RETRY_DELAY_MS = 1500;
// const MAX_RETRY_DELAY_MS = 10000;

// // ============================================================
// // HELPERS
// // ============================================================

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// // ------------------------------------------------------------
// // Parse Retry-After
// // ------------------------------------------------------------

// function getRetryAfterMs(response) {
//   const retryAfter = response.headers.get("retry-after");

//   if (!retryAfter) {
//     return null;
//   }

//   // Example:
//   // Retry-After: 5
//   const seconds = Number(retryAfter);

//   if (Number.isFinite(seconds) && seconds >= 0) {
//     return Math.min(
//       Math.max(seconds * 1000, 1000),
//       MAX_RETRY_DELAY_MS
//     );
//   }

//   // Sometimes Retry-After can be a date
//   const retryDate = Date.parse(retryAfter);

//   if (!Number.isNaN(retryDate)) {
//     const waitMs = retryDate - Date.now();

//     return Math.min(
//       Math.max(waitMs, 1000),
//       MAX_RETRY_DELAY_MS
//     );
//   }

//   return null;
// }

// // ------------------------------------------------------------
// // Direction-aware extension detection
// // ------------------------------------------------------------

// function getExtension(call) {
//   if (!call) {
//     return null;
//   }

//   const direction = String(call.direction || "")
//     .toLowerCase()
//     .trim();

//   const callerExtension =
//     call.caller_ext_number ??
//     call.caller_extension ??
//     call.caller_ext ??
//     call.from_extension ??
//     null;

//   const calleeExtension =
//     call.callee_ext_number ??
//     call.callee_extension ??
//     call.callee_ext ??
//     call.to_extension ??
//     null;

//   const clean = (value) => {
//     if (
//       value === undefined ||
//       value === null ||
//       String(value).trim() === ""
//     ) {
//       return null;
//     }

//     return String(value).trim();
//   };

//   const caller = clean(callerExtension);
//   const callee = clean(calleeExtension);

//   // ----------------------------------------------------------
//   // INBOUND
//   // External caller -> our Zoom extension
//   // We want callee extension.
//   // ----------------------------------------------------------

//   if (direction === "inbound" || direction === "in") {
//     return callee || caller || null;
//   }

//   // ----------------------------------------------------------
//   // OUTBOUND
//   // Our Zoom extension -> external number
//   // We want caller extension.
//   // ----------------------------------------------------------

//   if (direction === "outbound" || direction === "out") {
//     return caller || callee || null;
//   }

//   // ----------------------------------------------------------
//   // Unknown direction
//   // Fallback
//   // ----------------------------------------------------------

//   return caller || callee || null;
// }

// // ------------------------------------------------------------
// // Unique key for calls
// // ------------------------------------------------------------

// function getCallUniqueKey(call) {
//   if (!call) {
//     return null;
//   }

//   return (
//     call.call_history_uuid ||
//     call.id ||
//     call.call_id ||
//     [
//       call.start_time,
//       call.caller_did_number,
//       call.callee_did_number,
//       call.direction,
//     ]
//       .filter(Boolean)
//       .join("-")
//   );
// }

// // ------------------------------------------------------------
// // Safe JSON
// // ------------------------------------------------------------

// function safeJson(value) {
//   try {
//     return JSON.stringify(value);
//   } catch {
//     return null;
//   }
// }

// // ------------------------------------------------------------
// // Zoom API request with 429 retry protection
// // ------------------------------------------------------------

// async function fetchZoomCallHistory({
//   accessToken,
//   pageSize,
//   nextPageToken,
//   from,
//   to,
// }) {
//   const params = new URLSearchParams();

//   params.set("page_size", String(pageSize));

//   if (from) {
//     params.set("from", from);
//   }

//   if (to) {
//     params.set("to", to);
//   }

//   if (nextPageToken) {
//     params.set("next_page_token", nextPageToken);
//   }

//   const url = `${ZOOM_CALL_HISTORY_URL}?${params.toString()}`;

//   let retryCount = 0;

//   while (true) {
//     console.log(
//       `[Zoom Call History] Requesting page`,
//       {
//         pageSize,
//         hasNextPageToken: Boolean(nextPageToken),
//         from: from || null,
//         to: to || null,
//         retryCount,
//       }
//     );

//     let response;

//     try {
//       response = await fetch(url, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },

//         cache: "no-store",

//         next: {
//           revalidate: 0,
//         },
//       });
//     } catch (error) {
//       console.error(
//         "[Zoom Call History] Network error:",
//         error
//       );

//       throw new Error(
//         "Unable to connect to Zoom API"
//       );
//     }

//     // --------------------------------------------------------
//     // 429 RATE LIMIT
//     // --------------------------------------------------------

//     if (response.status === 429) {
//       const retryAfterMs = getRetryAfterMs(response);

//       if (retryCount >= MAX_429_RETRIES) {
//         let errorBody = null;

//         try {
//           errorBody = await response.json();
//         } catch {
//           errorBody = null;
//         }

//         const message =
//           errorBody?.message ||
//           "Zoom API rate limit exceeded";

//         const error = new Error(message);

//         error.status = 429;

//         error.retryAfterMs =
//           retryAfterMs || BASE_RETRY_DELAY_MS;

//         throw error;
//       }

//       const exponentialDelay = Math.min(
//         BASE_RETRY_DELAY_MS *
//           Math.pow(2, retryCount),
//         MAX_RETRY_DELAY_MS
//       );

//       const waitMs =
//         retryAfterMs || exponentialDelay;

//       console.warn(
//         `[Zoom Call History] 429 rate limit. Waiting ${waitMs}ms before retry ${retryCount + 1}/${MAX_429_RETRIES}`
//       );

//       await sleep(waitMs);

//       retryCount++;

//       continue;
//     }

//     // --------------------------------------------------------
//     // UNAUTHORIZED
//     // --------------------------------------------------------

//     if (response.status === 401) {
//       let errorBody = null;

//       try {
//         errorBody = await response.json();
//       } catch {
//         errorBody = null;
//       }

//       const error = new Error(
//         errorBody?.message ||
//           "Zoom access token is invalid or expired"
//       );

//       error.status = 401;

//       throw error;
//     }

//     // --------------------------------------------------------
//     // OTHER HTTP ERRORS
//     // --------------------------------------------------------

//     if (!response.ok) {
//       let errorBody = null;

//       try {
//         errorBody = await response.json();
//       } catch {
//         errorBody = null;
//       }

//       console.error(
//         "[Zoom Call History] API error:",
//         {
//           status: response.status,
//           statusText: response.statusText,
//           body: errorBody,
//         }
//       );

//       const error = new Error(
//         errorBody?.message ||
//           `Zoom API request failed with status ${response.status}`
//       );

//       error.status = response.status;
//       error.zoomBody = errorBody;

//       throw error;
//     }

//     // --------------------------------------------------------
//     // SUCCESS
//     // --------------------------------------------------------

//     const data = await response.json();

//     return {
//       data,
//       response,
//     };
//   }
// }

// // ============================================================
// // GET
// // ============================================================

// export async function GET(request) {
//   console.log(
//     "============================================================"
//   );

//   console.log(
//     "[Zoom Call History] GET request started"
//   );

//   console.log(
//     "============================================================"
//   );

//   try {
//     // ========================================================
//     // 1. CRM AUTH
//     // ========================================================

//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       console.warn(
//         "[Zoom Call History] CRM token missing"
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM login required",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // ========================================================
//     // 2. VERIFY JWT
//     // ========================================================

//     let decoded;

//     try {
//       decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET
//       );
//     } catch (error) {
//       console.error(
//         "[Zoom Call History] JWT verification failed:",
//         error
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid or expired CRM session",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     const crmUserId =
//       decoded?.id ||
//       decoded?.userId ||
//       decoded?.user_id;

//     console.log(
//       "[Zoom Call History] CRM USER ID:",
//       crmUserId
//     );

//     if (!crmUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM user ID not found",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // ========================================================
//     // 3. GET QUERY PARAMS
//     // ========================================================

//     const { searchParams } =
//       new URL(request.url);

//     const fromParam =
//       searchParams.get("from");

//     const toParam =
//       searchParams.get("to");

//     const requestedPageSize =
//       Number(
//         searchParams.get("page_size") ||
//           DEFAULT_PAGE_SIZE
//       );

//     const pageSize = Math.min(
//       Math.max(
//         Number.isFinite(requestedPageSize)
//           ? requestedPageSize
//           : DEFAULT_PAGE_SIZE,
//         1
//       ),
//       MAX_PAGE_SIZE
//     );

//     const from =
//       fromParam &&
//       /^\d{4}-\d{2}-\d{2}$/.test(fromParam)
//         ? fromParam
//         : null;

//     const to =
//       toParam &&
//       /^\d{4}-\d{2}-\d{2}$/.test(toParam)
//         ? toParam
//         : null;

//     console.log(
//       "[Zoom Call History] Query:",
//       {
//         from,
//         to,
//         requestedPageSize,
//         pageSize,
//       }
//     );

//     // ========================================================
//     // 4. GET ZOOM CONNECTION
//     // ========================================================

//     const connectionResult = await query(
//       `
//         SELECT
//           id,
//           user_id,
//           zoom_account_id,
//           zoom_user_id,
//           zoom_email,
//           access_token,
//           refresh_token,
//           expires_at
//         FROM zoom_connections
//         WHERE user_id = ?
//         ORDER BY id DESC
//         LIMIT 1
//       `,
//       [crmUserId]
//     );

//     const connection =
//       connectionResult?.[0];

//     if (!connection) {
//       console.warn(
//         "[Zoom Call History] No Zoom connection found for CRM user:",
//         crmUserId
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           connected: false,
//           error:
//             "Zoom is not connected for this CRM user",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     console.log(
//       "[Zoom Call History] Zoom connection found:",
//       {
//         id: connection.id,
//         user_id: connection.user_id,
//         zoom_account_id:
//           connection.zoom_account_id,
//         zoom_user_id:
//           connection.zoom_user_id,
//         zoom_email:
//           connection.zoom_email,
//         hasAccessToken:
//           Boolean(connection.access_token),
//         hasRefreshToken:
//           Boolean(connection.refresh_token),
//         expires_at:
//           connection.expires_at,
//       }
//     );

//     // ========================================================
//     // 5. CHECK ACCESS TOKEN
//     // ========================================================

//     let accessToken =
//       connection.access_token;

//     if (!accessToken) {
//       return NextResponse.json(
//         {
//           success: false,
//           connected: false,
//           error:
//             "Zoom access token is missing. Please reconnect Zoom.",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // ========================================================
//     // 6. REFRESH TOKEN IF NEEDED
//     // ========================================================

//     let tokenExpiresAt =
//       connection.expires_at
//         ? new Date(connection.expires_at)
//         : null;

//     const now = Date.now();

//     const expiresAtMs =
//       tokenExpiresAt &&
//       !Number.isNaN(
//         tokenExpiresAt.getTime()
//       )
//         ? tokenExpiresAt.getTime()
//         : null;

//     // Refresh 2 minutes before expiry
//     const refreshBeforeMs =
//       2 * 60 * 1000;

//     const tokenNeedsRefresh =
//       !expiresAtMs ||
//       expiresAtMs - now <=
//         refreshBeforeMs;

//     if (
//       tokenNeedsRefresh &&
//       connection.refresh_token
//     ) {
//       console.log(
//         "[Zoom Call History] Access token expired or near expiry. Refreshing..."
//       );

//       try {
//         const basicAuth = Buffer.from(
//           `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
//         ).toString("base64");

//         const tokenResponse =
//           await fetch(
//             "https://zoom.us/oauth/token",
//             {
//               method: "POST",

//               headers: {
//                 Authorization: `Basic ${basicAuth}`,
//                 "Content-Type":
//                   "application/x-www-form-urlencoded",
//               },

//               body: new URLSearchParams({
//                 grant_type:
//                   "refresh_token",

//                 refresh_token:
//                   connection.refresh_token,
//               }),

//               cache: "no-store",
//             }
//           );

//         const tokenData =
//           await tokenResponse.json();

//         if (!tokenResponse.ok) {
//           console.error(
//             "[Zoom Call History] Token refresh failed:",
//             {
//               status:
//                 tokenResponse.status,
//               data: tokenData,
//             }
//           );

//           return NextResponse.json(
//             {
//               success: false,
//               connected: false,
//               error:
//                 "Zoom authorization expired. Please reconnect Zoom.",
//               details:
//                 tokenData?.reason ||
//                 tokenData?.message ||
//                 null,
//             },
//             {
//               status: 401,
//             }
//           );
//         }

//         accessToken =
//           tokenData.access_token;

//         const newRefreshToken =
//           tokenData.refresh_token ||
//           connection.refresh_token;

//         const expiresIn =
//           Number(
//             tokenData.expires_in || 3600
//           );

//         const newExpiresAt =
//           new Date(
//             Date.now() +
//               expiresIn * 1000
//           );

//         await query(
//           `
//             UPDATE zoom_connections
//             SET
//               access_token = ?,
//               refresh_token = ?,
//               expires_at = ?,
//               updated_at = NOW()
//             WHERE id = ?
//           `,
//           [
//             accessToken,
//             newRefreshToken,
//             newExpiresAt,
//             connection.id,
//           ]
//         );

//         tokenExpiresAt =
//           newExpiresAt;

//         console.log(
//           "[Zoom Call History] Access token refreshed successfully",
//           {
//             expires_at:
//               newExpiresAt.toISOString(),
//           }
//         );
//       } catch (refreshError) {
//         console.error(
//           "[Zoom Call History] Token refresh exception:",
//           refreshError
//         );

//         return NextResponse.json(
//           {
//             success: false,
//             connected: false,
//             error:
//               "Unable to refresh Zoom authorization",
//           },
//           {
//             status: 401,
//           }
//         );
//       }
//     }

//     // ========================================================
//     // 7. FETCH ALL CALL HISTORY PAGES
//     // ========================================================

//     const allCalls = [];

//     let nextPageToken = null;

//     let pageNumber = 0;

//     let totalRecordsFromZoom = 0;

//     do {
//       pageNumber++;

//       if (pageNumber > MAX_PAGES) {
//         console.warn(
//           `[Zoom Call History] MAX_PAGES (${MAX_PAGES}) reached. Stopping pagination.`
//         );

//         break;
//       }

//       console.log(
//         `[Zoom Call History] Fetching page ${pageNumber}...`
//       );

//       const {
//         data: zoomData,
//       } = await fetchZoomCallHistory({
//         accessToken,
//         pageSize,
//         nextPageToken,
//         from,
//         to,
//       });

//       // ======================================================
//       // SUPPORT CURRENT + OLD RESPONSE SHAPES
//       // ======================================================

//       const pageCalls =
//         Array.isArray(
//           zoomData?.call_history
//         )
//           ? zoomData.call_history
//           : Array.isArray(
//               zoomData?.call_logs
//             )
//           ? zoomData.call_logs
//           : [];

//       // Some Zoom responses may expose total_records
//       if (
//         Number.isFinite(
//           Number(
//             zoomData?.total_records
//           )
//         )
//       ) {
//         totalRecordsFromZoom =
//           Number(
//             zoomData.total_records
//           );
//       }

//       console.log(
//         `[Zoom Call History] Page ${pageNumber}:`,
//         {
//           received:
//             pageCalls.length,

//           total_records:
//             zoomData?.total_records ??
//             null,

//           next_page_token:
//             zoomData?.next_page_token
//               ? "YES"
//               : "NO",
//         }
//       );

//       allCalls.push(
//         ...pageCalls
//       );

//       nextPageToken =
//         zoomData?.next_page_token ||
//         null;

//       // ======================================================
//       // DELAY BEFORE NEXT PAGE
//       // ======================================================

//       if (
//         nextPageToken &&
//         pageNumber < MAX_PAGES
//       ) {
//         await sleep(
//           PAGE_DELAY_MS
//         );
//       }
//     } while (nextPageToken);

//     // ========================================================
//     // 8. DEDUPLICATE CALLS
//     // ========================================================

//     const uniqueCalls = [];

//     const seenCalls = new Set();

//     for (const call of allCalls) {
//       const key =
//         getCallUniqueKey(call);

//       if (!key) {
//         uniqueCalls.push(call);
//         continue;
//       }

//       if (seenCalls.has(key)) {
//         continue;
//       }

//       seenCalls.add(key);

//       uniqueCalls.push(call);
//     }

//     console.log(
//       "[Zoom Call History] Deduplication:",
//       {
//         rawCalls:
//           allCalls.length,

//         uniqueCalls:
//           uniqueCalls.length,

//         duplicatesRemoved:
//           allCalls.length -
//           uniqueCalls.length,
//       }
//     );

//     // ========================================================
//     // 9. ENRICH CALLS WITH CRM EXTENSION
//     // ========================================================

//     const enrichedCalls =
//       uniqueCalls.map(
//         (call) => {
//           const extension =
//             getExtension(call);

//           return {
//             ...call,

//             crm_extension:
//               extension,

//             crm_extension_label:
//               extension
//                 ? `Ext. ${extension}`
//                 : null,
//           };
//         }
//       );

//     // ========================================================
//     // 10. EXTENSION COUNTS
//     // ========================================================

//     const extensionCounts = {};

//     for (const call of enrichedCalls) {
//       const extension =
//         call.crm_extension;

//       if (!extension) {
//         continue;
//       }

//       extensionCounts[extension] =
//         (extensionCounts[extension] || 0) +
//         1;
//     }

//     // ========================================================
//     // 11. DYNAMIC EXTENSION LIST
//     // ========================================================

//     const extensions =
//       Object.keys(
//         extensionCounts
//       ).sort((a, b) => {
//         const numA =
//           Number(a);

//         const numB =
//           Number(b);

//         if (
//           Number.isFinite(numA) &&
//           Number.isFinite(numB)
//         ) {
//           return numA - numB;
//         }

//         return a.localeCompare(b);
//       });

//     // ========================================================
//     // 12. DEBUG FIRST CALL
//     // ========================================================

//     if (enrichedCalls.length > 0) {
//       const first =
//         enrichedCalls[0];

//       console.log(
//         "[Zoom Call History] FIRST ENRICHED CALL:",
//         {
//           id:
//             first.id || null,

//           call_history_uuid:
//             first.call_history_uuid ||
//             null,

//           call_id:
//             first.call_id || null,

//           direction:
//             first.direction || null,

//           caller:
//             first.caller_name || null,

//           caller_number:
//             first.caller_did_number ||
//             null,

//           caller_extension:
//             first.caller_ext_number ||
//             null,

//           callee:
//             first.callee_name || null,

//           callee_number:
//             first.callee_did_number ||
//             null,

//           callee_extension:
//             first.callee_ext_number ||
//             null,

//           crm_extension:
//             first.crm_extension ||
//             null,
//         }
//       );
//     }

//     // ========================================================
//     // 13. FINAL LOGS
//     // ========================================================

//     console.log(
//       "============================================================"
//     );

//     console.log(
//       "[Zoom Call History] COMPLETE"
//     );

//     console.log(
//       "[Zoom Call History] Statistics:",
//       {
//         total_records_from_zoom:
//           totalRecordsFromZoom,

//         raw_records:
//           allCalls.length,

//         unique_calls:
//           uniqueCalls.length,

//         enriched_calls:
//           enrichedCalls.length,

//         pages_fetched:
//           pageNumber,

//         extensions,

//         extension_counts:
//           extensionCounts,

//         from,
//         to,
//       }
//     );

//     console.log(
//       "============================================================"
//     );

//     // ========================================================
//     // 14. RESPONSE
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: true,

//         connected: true,

//         live: true,

//         calls: enrichedCalls,

//         total_records:
//           enrichedCalls.length,

//         zoom_total_records:
//           totalRecordsFromZoom,

//         raw_records:
//           allCalls.length,

//         unique_records:
//           uniqueCalls.length,

//         page_size:
//           pageSize,

//         pages_fetched:
//           pageNumber,

//         extensions,

//         extension_counts:
//           extensionCounts,

//         from:
//           from || null,

//         to:
//           to || null,

//         fetched_at:
//           new Date().toISOString(),

//         next_page_token:
//           null,
//       },
//       {
//         status: 200,

//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate, proxy-revalidate",

//           Pragma:
//             "no-cache",

//           Expires:
//             "0",

//           "Surrogate-Control":
//             "no-store",
//         },
//       }
//     );
//   } catch (error) {
//     // ========================================================
//     // GLOBAL ERROR
//     // ========================================================

//     console.error(
//       "============================================================"
//     );

//     console.error(
//       "[Zoom Call History] ERROR"
//     );

//     console.error(
//       error
//     );

//     console.error(
//       "============================================================"
//     );

//     // ========================================================
//     // 429 RESPONSE
//     // ========================================================

//     if (
//       error?.status === 429
//     ) {
//       const retryAfterMs =
//         error.retryAfterMs ||
//         BASE_RETRY_DELAY_MS;

//       return NextResponse.json(
//         {
//           success: false,

//           connected: true,

//           error:
//             "Zoom API rate limit reached. Please wait a moment and try again.",

//           code:
//             "ZOOM_RATE_LIMIT",

//           retry_after_ms:
//             retryAfterMs,
//         },
//         {
//           status: 429,

//           headers: {
//             "Retry-After": String(
//               Math.ceil(
//                 retryAfterMs / 1000
//               )
//             ),

//             "Cache-Control":
//               "no-store",
//           },
//         }
//       );
//     }

//     // ========================================================
//     // 401 RESPONSE
//     // ========================================================

//     if (
//       error?.status === 401
//     ) {
//       return NextResponse.json(
//         {
//           success: false,

//           connected: false,

//           error:
//             "Zoom access token is invalid or expired. Please reconnect Zoom.",

//           code:
//             "ZOOM_AUTH_ERROR",
//         },
//         {
//           status: 401,

//           headers: {
//             "Cache-Control":
//               "no-store",
//           },
//         }
//       );
//     }

//     // ========================================================
//     // GENERIC ERROR
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: false,

//         connected: true,

//         error:
//           error?.message ||
//           "Failed to fetch Zoom call history",

//         details:
//           process.env.NODE_ENV ===
//           "development"
//             ? {
//                 name:
//                   error?.name ||
//                   null,

//                 stack:
//                   error?.stack ||
//                   null,
//               }
//             : undefined,
//       },
//       {
//         status: 500,

//         headers: {
//           "Cache-Control":
//             "no-store",
//         },
//       }
//     );
//   }
// }


































import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query, zoomConfig } from "../../../lib/db";

const ZOOM_CALL_HISTORY_URL =
  "https://api.zoom.us/v2/phone/call_history";

const DEFAULT_PAGE_SIZE = 300;
const MAX_PAGE_SIZE = 300;
const MAX_PAGES = 100;

const PAGE_DELAY_MS = 350;

const MAX_429_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 10000;


// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// ============================================================
// GET RETRY-AFTER
// ============================================================

function getRetryAfterMs(response) {
  const retryAfter = response.headers.get("retry-after");

  if (!retryAfter) {
    return null;
  }

  // Retry-After can be seconds
  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds)) {
    return Math.max(seconds * 1000, 0);
  }

  // Or HTTP date
  const retryDate = Date.parse(retryAfter);

  if (!Number.isNaN(retryDate)) {
    return Math.max(retryDate - Date.now(), 0);
  }

  return null;
}


// ============================================================
// DIRECTION-AWARE EXTENSION DETECTION
// ============================================================

function getExtension(call) {
  const direction = String(
    call?.direction ||
      call?.call_direction ||
      ""
  ).toLowerCase();

  const callerExtension =
    call?.caller_ext_number ??
    call?.caller_extension ??
    call?.caller_ext ??
    call?.caller?.extension ??
    call?.caller?.ext_number ??
    null;

  const calleeExtension =
    call?.callee_ext_number ??
    call?.callee_extension ??
    call?.callee_ext ??
    call?.callee?.extension ??
    call?.callee?.ext_number ??
    null;


  // ----------------------------------------------------------
  // INBOUND
  // Customer -> CRM
  // CRM extension should normally be CALLEE extension
  // ----------------------------------------------------------

  if (direction === "inbound") {
    if (calleeExtension) {
      return String(calleeExtension);
    }

    if (callerExtension) {
      return String(callerExtension);
    }
  }


  // ----------------------------------------------------------
  // OUTBOUND
  // CRM -> Customer
  // CRM extension should normally be CALLER extension
  // ----------------------------------------------------------

  if (direction === "outbound") {
    if (callerExtension) {
      return String(callerExtension);
    }

    if (calleeExtension) {
      return String(calleeExtension);
    }
  }


  // ----------------------------------------------------------
  // FALLBACK
  // ----------------------------------------------------------

  const possibleExtensions = [
    call?.extension,
    call?.ext_number,
    call?.extension_number,
    call?.phone_extension,
    call?.user_extension,

    call?.caller_ext_number,
    call?.caller_extension,
    call?.caller_ext,

    call?.callee_ext_number,
    call?.callee_extension,
    call?.callee_ext,

    call?.caller?.extension,
    call?.callee?.extension,

    call?.caller?.ext_number,
    call?.callee?.ext_number,
  ];

  for (const value of possibleExtensions) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return null;
}


// ============================================================
// UNIQUE CALL KEY
// ============================================================

function getCallUniqueKey(call) {
  return (
    call?.call_history_uuid ||
    call?.id ||
    call?.call_id ||
    [
      call?.start_time || "",
      call?.caller_did_number || "",
      call?.callee_did_number || "",
      call?.direction || "",
    ].join("-")
  );
}


// ============================================================
// ZOOM API REQUEST WITH 429 RETRY
// ============================================================

async function fetchZoomCallHistory(
  accessToken,
  params
) {
  let retryCount = 0;

  while (true) {
    const url = new URL(ZOOM_CALL_HISTORY_URL);

    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(key, String(value));
      }
    });


    const response = await fetch(url.toString(), {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },

      cache: "no-store",
    });


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    if (response.ok) {
      return await response.json();
    }


    // --------------------------------------------------------
    // RATE LIMIT
    // --------------------------------------------------------

    if (
      response.status === 429 &&
      retryCount < MAX_429_RETRIES
    ) {
      const retryAfterMs =
        getRetryAfterMs(response);

      const exponentialDelay = Math.min(
        BASE_RETRY_DELAY_MS *
          Math.pow(2, retryCount),
        MAX_RETRY_DELAY_MS
      );

      const delay =
        retryAfterMs !== null
          ? Math.max(
              retryAfterMs,
              exponentialDelay
            )
          : exponentialDelay;


      console.warn(
        `[Zoom] 429 rate limit. Retry ${
          retryCount + 1
        }/${MAX_429_RETRIES} after ${delay}ms`
      );


      await sleep(delay);

      retryCount++;

      continue;
    }


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    let errorBody = {};

    try {
      errorBody = await response.json();
    } catch {
      errorBody = {};
    }


    const error = new Error(
      errorBody?.message ||
        `Zoom API request failed with status ${response.status}`
    );

    error.status = response.status;
    error.zoomCode = errorBody?.code;

    throw error;
  }
}


// ============================================================
// GET
// ============================================================

export async function GET(request) {
  try {
    console.log(
      "================================================"
    );

    console.log(
      "[Zoom Call History] REQUEST START"
    );

    console.log(
      "================================================"
    );


    // ========================================================
    // 1. CRM AUTH
    // ========================================================

    const token =
      request.cookies.get("token")?.value;


    if (!token) {
      console.log(
        "[Zoom Call History] No CRM token"
      );

      return NextResponse.json(
        {
          success: false,
          error: "CRM login required",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }


    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      console.error(
        "[Zoom Call History] Invalid JWT:",
        error.message
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired CRM session",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }


    const currentUserId =
      decoded?.id ||
      decoded?.userId ||
      decoded?.user_id;


    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM user ID not found",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }


    console.log(
      "[Zoom Call History] CRM USER ID:",
      currentUserId
    );


    // ========================================================
    // 2. GET CURRENT CRM USER
    // ========================================================

    const userRows = await query(
      `
      SELECT
        id,
        name,
        email,
        role,
        zoom_extension
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [currentUserId]
    );


    if (!userRows || userRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM user not found",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }


    const currentUser = userRows[0];


    const userRole = String(
      currentUser.role || ""
    ).toLowerCase();


    const userExtension =
      currentUser.zoom_extension
        ? String(
            currentUser.zoom_extension
          ).trim()
        : null;


    const isAdmin =
      userRole === "admin";


    console.log(
      "[Zoom Call History] USER:",
      {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        zoom_extension:
          currentUser.zoom_extension,
        isAdmin,
      }
    );


    // ========================================================
    // 3. GET CENTRAL ZOOM CONNECTION
    //
    // IMPORTANT:
    // Do NOT use:
    //
    // WHERE user_id = currentUserId
    //
    // because only the central/admin Zoom account
    // is connected.
    // ========================================================

    const connectionRows = await query(
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
      ORDER BY id DESC
      LIMIT 1
      `
    );


    if (
      !connectionRows ||
      connectionRows.length === 0
    ) {
      console.log(
        "[Zoom Call History] No Zoom connection found"
      );

      return NextResponse.json(
        {
          success: false,
          connected: false,
          error:
            "No central Zoom account is connected",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }


    const connection =
      connectionRows[0];


    let accessToken =
      connection.access_token;

    let refreshToken =
      connection.refresh_token;

    let expiresAt =
      connection.expires_at;


    // ========================================================
    // 4. REFRESH ZOOM TOKEN IF REQUIRED
    // ========================================================

    let shouldRefresh = false;


    if (expiresAt) {
      const expiresAtMs =
        new Date(expiresAt).getTime();

      const twoMinutes =
        2 * 60 * 1000;


      if (
        Number.isFinite(expiresAtMs) &&
        expiresAtMs <=
          Date.now() + twoMinutes
      ) {
        shouldRefresh = true;
      }
    }


    if (shouldRefresh) {
      console.log(
        "[Zoom Call History] Access token expired/near expiry. Refreshing..."
      );


      if (!refreshToken) {
        return NextResponse.json(
          {
            success: false,
            connected: false,
            error:
              "Zoom access token expired and no refresh token is available",
          },
          {
            status: 401,
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }


      const basicAuth = Buffer.from(
        `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
      ).toString("base64");


      const refreshResponse =
        await fetch(
          "https://zoom.us/oauth/token",
          {
            method: "POST",

            headers: {
              Authorization: `Basic ${basicAuth}`,
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: new URLSearchParams({
              grant_type:
                "refresh_token",

              refresh_token:
                refreshToken,
            }).toString(),

            cache: "no-store",
          }
        );


      const refreshData =
        await refreshResponse.json();


      if (!refreshResponse.ok) {
        console.error(
          "[Zoom Call History] Token refresh failed:",
          refreshData
        );


        return NextResponse.json(
          {
            success: false,
            connected: false,
            error:
              refreshData?.reason ||
              refreshData?.message ||
              "Zoom token refresh failed",
          },
          {
            status: 401,
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }


      accessToken =
        refreshData.access_token;

      refreshToken =
        refreshData.refresh_token ||
        refreshToken;


      const expiresIn =
        Number(
          refreshData.expires_in || 3600
        );


      expiresAt = new Date(
        Date.now() +
          expiresIn * 1000
      );


      await query(
        `
        UPDATE zoom_connections
        SET
          access_token = ?,
          refresh_token = ?,
          expires_at = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [
          accessToken,
          refreshToken,
          expiresAt,
          connection.id,
        ]
      );


      console.log(
        "[Zoom Call History] Zoom token refreshed successfully"
      );
    }


    // ========================================================
    // 5. QUERY PARAMS
    // ========================================================

    const { searchParams } =
      new URL(request.url);


    const from =
      searchParams.get("from");


    const to =
      searchParams.get("to");


    const requestedPageSize =
      Number(
        searchParams.get("page_size") ||
          DEFAULT_PAGE_SIZE
      );


    const pageSize = Math.min(
      Math.max(
        Number.isFinite(
          requestedPageSize
        )
          ? requestedPageSize
          : DEFAULT_PAGE_SIZE,
        1
      ),
      MAX_PAGE_SIZE
    );


    console.log(
      "[Zoom Call History] DATE FILTER:",
      {
        from,
        to,
        pageSize,
      }
    );


    // ========================================================
    // 6. FETCH ALL ZOOM PAGES
    // ========================================================

    let nextPageToken = null;

    let pageNumber = 0;

    const allCalls = [];


    do {
      pageNumber++;


      if (pageNumber > 1) {
        await sleep(
          PAGE_DELAY_MS
        );
      }


      console.log(
        `[Zoom Call History] Fetching page ${pageNumber}`
      );


      const zoomData =
        await fetchZoomCallHistory(
          accessToken,
          {
            from,
            to,
            page_size: pageSize,

            ...(nextPageToken
              ? {
                  next_page_token:
                    nextPageToken,
                }
              : {}),
          }
        );


      const pageCalls =
        Array.isArray(
          zoomData?.call_history
        )
          ? zoomData.call_history
          : Array.isArray(
              zoomData?.call_logs
            )
          ? zoomData.call_logs
          : [];


      console.log(
        `[Zoom Call History] Page ${pageNumber}: ${pageCalls.length} calls`
      );


      allCalls.push(
        ...pageCalls
      );


      nextPageToken =
        zoomData?.next_page_token ||
        null;


      if (
        !nextPageToken
      ) {
        break;
      }


    } while (
      pageNumber < MAX_PAGES
    );


    console.log(
      "[Zoom Call History] TOTAL RAW CALLS:",
      allCalls.length
    );


    // ========================================================
    // 7. DEDUPLICATE CALLS
    // ========================================================

    const uniqueCallsMap =
      new Map();


    for (const call of allCalls) {
      const key =
        getCallUniqueKey(call);


      if (!uniqueCallsMap.has(key)) {
        uniqueCallsMap.set(
          key,
          call
        );
      }
    }


    const uniqueCalls =
      Array.from(
        uniqueCallsMap.values()
      );


    console.log(
      "[Zoom Call History] UNIQUE CALLS:",
      uniqueCalls.length
    );


    // ========================================================
    // 8. ADD CRM EXTENSION
    // ========================================================

    const enrichedCalls =
      uniqueCalls.map(
        (call) => {
          const extension =
            getExtension(call);


          return {
            ...call,

            crm_extension:
              extension,

            crm_extension_label:
              extension
                ? `Ext. ${extension}`
                : null,
          };
        }
      );


    // ========================================================
    // 9. ALL EXTENSION COUNTS
    // ========================================================

    const allExtensionCounts = {};


    for (const call of enrichedCalls) {
      const extension =
        call.crm_extension;


      if (!extension) {
        continue;
      }


      allExtensionCounts[
        extension
      ] =
        (allExtensionCounts[
          extension
        ] || 0) + 1;
    }


    // ========================================================
    // 10. FILTER FOR CURRENT USER
    // ========================================================

    let visibleCalls = [];


    if (isAdmin) {
      // ------------------------------------------------------
      // ADMIN:
      // See ALL calls
      // ------------------------------------------------------

      visibleCalls =
        enrichedCalls;

      console.log(
        "[Zoom Call History] ADMIN USER -> ALL CALLS"
      );

    } else {
      // ------------------------------------------------------
      // NORMAL USER:
      // Only own extension
      // ------------------------------------------------------

      if (!userExtension) {
        console.log(
          "[Zoom Call History] USER HAS NO ZOOM EXTENSION"
        );

        return NextResponse.json(
          {
            success: true,
            connected: true,
            live: true,

            user: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              zoom_extension: null,
            },

            calls: [],

            total_records:
              uniqueCalls.length,

            visible_records: 0,

            extension_counts: {},

            all_extension_counts:
              allExtensionCounts,

            page_size: pageSize,

            pages_fetched:
              pageNumber,

            extensions: [],

            from:
              from || null,

            to:
              to || null,

            fetched_at:
              new Date().toISOString(),

            next_page_token: null,

            message:
              "No Zoom extension is assigned to this user",
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
      }


      visibleCalls =
        enrichedCalls.filter(
          (call) =>
            String(
              call.crm_extension ||
                ""
            ).trim() ===
            userExtension
        );


      console.log(
        "[Zoom Call History] USER FILTER:",
        {
          userId:
            currentUser.id,

          userName:
            currentUser.name,

          extension:
            userExtension,

          total:
            enrichedCalls.length,

          visible:
            visibleCalls.length,
        }
      );
    }


    // ========================================================
    // 11. VISIBLE EXTENSION COUNTS
    // ========================================================

    const extensionCounts = {};


    for (const call of visibleCalls) {
      const extension =
        call.crm_extension;


      if (!extension) {
        continue;
      }


      extensionCounts[
        extension
      ] =
        (extensionCounts[
          extension
        ] || 0) + 1;
    }


    // ========================================================
    // 12. EXTENSION LIST
    // ========================================================

    const extensions =
      Object.keys(
        extensionCounts
      ).sort(
        (a, b) =>
          Number(a) - Number(b)
      );


    // ========================================================
    // 13. RESPONSE
    // ========================================================

    console.log(
      "[Zoom Call History] FINAL:",
      {
        userId:
          currentUser.id,

        role:
          currentUser.role,

        extension:
          userExtension,

        isAdmin,

        totalFetched:
          enrichedCalls.length,

        visible:
          visibleCalls.length,

        extensions,
      }
    );


    console.log(
      "================================================"
    );

    console.log(
      "[Zoom Call History] REQUEST COMPLETE"
    );

    console.log(
      "================================================"
    );


    return NextResponse.json(
      {
        success: true,

        connected: true,

        live: true,


        // ----------------------------------------------------
        // CURRENT CRM USER
        // ----------------------------------------------------

        user: {
          id: currentUser.id,

          name:
            currentUser.name,

          email:
            currentUser.email,

          role:
            currentUser.role,

          zoom_extension:
            userExtension,
        },


        // ----------------------------------------------------
        // FILTERED CALLS
        // ----------------------------------------------------

        calls:
          visibleCalls,


        // ----------------------------------------------------
        // COUNTS
        // ----------------------------------------------------

        total_records:
          enrichedCalls.length,

        visible_records:
          visibleCalls.length,


        // ----------------------------------------------------
        // CURRENT USER EXTENSION COUNTS
        // ----------------------------------------------------

        extension_counts:
          extensionCounts,


        // ----------------------------------------------------
        // ADMIN / DEBUG
        // ----------------------------------------------------

        all_extension_counts:
          allExtensionCounts,


        // ----------------------------------------------------
        // EXTENSIONS
        // ----------------------------------------------------

        extensions,


        // ----------------------------------------------------
        // PAGINATION
        // ----------------------------------------------------

        page_size:
          pageSize,

        pages_fetched:
          pageNumber,


        // ----------------------------------------------------
        // DATE
        // ----------------------------------------------------

        from:
          from || null,

        to:
          to || null,


        // ----------------------------------------------------
        // META
        // ----------------------------------------------------

        fetched_at:
          new Date().toISOString(),

        next_page_token:
          null,
      },

      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      }
    );

  } catch (error) {
    console.error(
      "================================================"
    );

    console.error(
      "[Zoom Call History] ERROR"
    );

    console.error(
      error
    );

    console.error(
      "================================================"
    );


    const status =
      error?.status === 401
        ? 401
        : error?.status === 429
        ? 429
        : 500;


    return NextResponse.json(
      {
        success: false,

        connected:
          status !== 401,

        error:
          error?.message ||
          "Failed to fetch Zoom call history",

        zoom_code:
          error?.zoomCode ||
          null,
      },
      {
        status,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}