 





























































// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { query, zoomConfig } from "../../../lib/db";

// const ZOOM_CALL_HISTORY_URL =
//   "https://api.zoom.us/v2/phone/call_history";

// // const DEFAULT_PAGE_SIZE = 300;
// // const MAX_PAGE_SIZE = 300;
// // const MAX_PAGES = 100;

// // const PAGE_DELAY_MS = 350;

// const DEFAULT_PAGE_SIZE = 300;
// const MAX_PAGE_SIZE = 300;
// const MAX_PAGES = 100;

// const PAGE_DELAY_MS = 0;

// const MAX_429_RETRIES = 1;
// const BASE_RETRY_DELAY_MS = 10;
// const MAX_RETRY_DELAY_MS = 10;


// // ============================================================
// // HELPERS
// // ============================================================

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }


// // ============================================================
// // DATE FORMAT
// // ============================================================

// function formatDate(date) {
//   const year = date.getFullYear();

//   const month = String(
//     date.getMonth() + 1
//   ).padStart(2, "0");

//   const day = String(
//     date.getDate()
//   ).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// }


// // ============================================================
// // GET LAST 7 DAYS
// // ============================================================

// function getDefaultDateRange() {
//   const now = new Date();

//   // Today at 00:00:00
//   const todayStart = new Date(now);

//   todayStart.setHours(
//     0,
//     0,
//     0,
//     0
//   );

//   // 6 days before today
//   //
//   // Example:
//   // Today = Sep 15
//   // From  = Sep 09
//   // To    = Sep 15
//   //
//   const fromDate =
//     new Date(todayStart);

//   fromDate.setDate(
//     fromDate.getDate() - 6
//   );

//   return {
//     from: formatDate(fromDate),
//     to: formatDate(todayStart),
//   };
// }


// // ============================================================
// // GET RETRY-AFTER
// // ============================================================

// function getRetryAfterMs(response) {
//   const retryAfter =
//     response.headers.get(
//       "retry-after"
//     );

//   if (!retryAfter) {
//     return null;
//   }

//   // Retry-After can be seconds
//   const seconds =
//     Number(retryAfter);

//   if (Number.isFinite(seconds)) {
//     return Math.max(
//       seconds * 1000,
//       0
//     );
//   }

//   // Or HTTP date
//   const retryDate =
//     Date.parse(retryAfter);

//   if (!Number.isNaN(retryDate)) {
//     return Math.max(
//       retryDate - Date.now(),
//       0
//     );
//   }

//   return null;
// }


// // ============================================================
// // DIRECTION-AWARE EXTENSION DETECTION
// // ============================================================

// function getExtension(call) {
//   const direction =
//     String(
//       call?.direction ||
//         call?.call_direction ||
//         ""
//     ).toLowerCase();

//   const callerExtension =
//     call?.caller_ext_number ??
//     call?.caller_extension ??
//     call?.caller_ext ??
//     call?.caller?.extension ??
//     call?.caller?.ext_number ??
//     null;

//   const calleeExtension =
//     call?.callee_ext_number ??
//     call?.callee_extension ??
//     call?.callee_ext ??
//     call?.callee?.extension ??
//     call?.callee?.ext_number ??
//     null;


//   // ----------------------------------------------------------
//   // INBOUND
//   // Customer -> CRM
//   // CRM extension should normally be CALLEE
//   // ----------------------------------------------------------

//   if (direction === "inbound") {
//     if (calleeExtension) {
//       return String(
//         calleeExtension
//       ).trim();
//     }

//     if (callerExtension) {
//       return String(
//         callerExtension
//       ).trim();
//     }
//   }


//   // ----------------------------------------------------------
//   // OUTBOUND
//   // CRM -> Customer
//   // CRM extension should normally be CALLER
//   // ----------------------------------------------------------

//   if (direction === "outbound") {
//     if (callerExtension) {
//       return String(
//         callerExtension
//       ).trim();
//     }

//     if (calleeExtension) {
//       return String(
//         calleeExtension
//       ).trim();
//     }
//   }


//   // ----------------------------------------------------------
//   // FALLBACK
//   // ----------------------------------------------------------

//   const possibleExtensions = [
//     call?.extension,
//     call?.ext_number,
//     call?.extension_number,
//     call?.phone_extension,
//     call?.user_extension,

//     call?.caller_ext_number,
//     call?.caller_extension,
//     call?.caller_ext,

//     call?.callee_ext_number,
//     call?.callee_extension,
//     call?.callee_ext,

//     call?.caller?.extension,
//     call?.callee?.extension,

//     call?.caller?.ext_number,
//     call?.callee?.ext_number,
//   ];

//   for (
//     const value of possibleExtensions
//   ) {
//     if (
//       value !== undefined &&
//       value !== null &&
//       String(value).trim() !== ""
//     ) {
//       return String(
//         value
//       ).trim();
//     }
//   }

//   return null;
// }


// // ============================================================
// // UNIQUE CALL KEY
// // ============================================================

// function getCallUniqueKey(call) {
//   return (
//     call?.call_history_uuid ||
//     call?.id ||
//     call?.call_id ||
//     [
//       call?.start_time || "",
//       call?.caller_did_number || "",
//       call?.callee_did_number || "",
//       call?.direction || "",
//     ].join("-")
//   );
// }


// // ============================================================
// // ZOOM API REQUEST WITH 429 RETRY
// // ============================================================

// async function fetchZoomCallHistory(
//   accessToken,
//   params
// ) {
//   let retryCount = 0;

//   while (true) {
//     const url =
//       new URL(
//         ZOOM_CALL_HISTORY_URL
//       );

//     Object.entries(
//       params
//     ).forEach(
//       ([key, value]) => {
//         if (
//           value !== undefined &&
//           value !== null &&
//           value !== ""
//         ) {
//           url.searchParams.set(
//             key,
//             String(value)
//           );
//         }
//       }
//     );


//     console.log(
//       "[Zoom API] Request:",
//       url.toString()
//     );


//     const response =
//       await fetch(
//         url.toString(),
//         {
//           method: "GET",

//           headers: {
//             Authorization:
//               `Bearer ${accessToken}`,

//             Accept:
//               "application/json",
//           },

//           cache: "no-store",
//         }
//       );


//     // --------------------------------------------------------
//     // SUCCESS
//     // --------------------------------------------------------

//     if (response.ok) {
//       return await response.json();
//     }


//     // --------------------------------------------------------
//     // RATE LIMIT 429
//     // --------------------------------------------------------

//     if (
//       response.status === 429 &&
//       retryCount <
//         MAX_429_RETRIES
//     ) {
//       const retryAfterMs =
//         getRetryAfterMs(
//           response
//         );

//       const exponentialDelay =
//         Math.min(
//           BASE_RETRY_DELAY_MS *
//             Math.pow(
//               2,
//               retryCount
//             ),
//           MAX_RETRY_DELAY_MS
//         );

//       const delay =
//         retryAfterMs !== null
//           ? Math.max(
//               retryAfterMs,
//               exponentialDelay
//             )
//           : exponentialDelay;


//       console.warn(
//         `[Zoom] 429 rate limit. Retry ${
//           retryCount + 1
//         }/${MAX_429_RETRIES} after ${delay}ms`
//       );


//       await sleep(
//         delay
//       );

//       retryCount++;

//       continue;
//     }


//     // --------------------------------------------------------
//     // ERROR
//     // --------------------------------------------------------

//     let errorBody = {};

//     try {
//       errorBody =
//         await response.json();
//     } catch {
//       errorBody = {};
//     }


//     const error =
//       new Error(
//         errorBody?.message ||
//           `Zoom API request failed with status ${response.status}`
//       );

//     error.status =
//       response.status;

//     error.zoomCode =
//       errorBody?.code;

//     throw error;
//   }
// }


// // ============================================================
// // GET
// // ============================================================

// export async function GET(
//   request
// ) {
//   try {
//     console.log(
//       "================================================"
//     );

//     console.log(
//       "[Zoom Call History] REQUEST START"
//     );

//     console.log(
//       "================================================"
//     );


//     // ========================================================
//     // 1. CRM AUTH
//     // ========================================================

//     const token =
//       request.cookies.get(
//         "token"
//       )?.value;


//     if (!token) {
//       console.log(
//         "[Zoom Call History] No CRM token"
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "CRM login required",
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


//     let decoded;


//     try {
//       decoded =
//         jwt.verify(
//           token,
//           process.env.JWT_SECRET
//         );
//     } catch (error) {
//       console.error(
//         "[Zoom Call History] Invalid JWT:",
//         error.message
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "Invalid or expired CRM session",
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


//     const currentUserId =
//       decoded?.id ||
//       decoded?.userId ||
//       decoded?.user_id;


//     if (!currentUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "CRM user ID not found",
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


//     console.log(
//       "[Zoom Call History] CRM USER ID:",
//       currentUserId
//     );


//     // ========================================================
//     // 2. GET CURRENT CRM USER
//     // ========================================================

//     const userRows =
//       await query(
//         `
//         SELECT
//           id,
//           name,
//           email,
//           role,
//           zoom_extension
//         FROM users
//         WHERE id = ?
//         LIMIT 1
//         `,
//         [currentUserId]
//       );


//     if (
//       !userRows ||
//       userRows.length === 0
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "CRM user not found",
//         },
//         {
//           status: 404,

//           headers: {
//             "Cache-Control":
//               "no-store",
//           },
//         }
//       );
//     }


//     const currentUser =
//       userRows[0];


//     const userRole =
//       String(
//         currentUser.role || ""
//       ).toLowerCase();


//     const userExtension =
//       currentUser.zoom_extension
//         ? String(
//             currentUser.zoom_extension
//           ).trim()
//         : null;


//     const isAdmin =
//       userRole === "admin";


//     console.log(
//       "[Zoom Call History] USER:",
//       {
//         id:
//           currentUser.id,

//         name:
//           currentUser.name,

//         role:
//           currentUser.role,

//         zoom_extension:
//           currentUser.zoom_extension,

//         isAdmin,
//       }
//     );


//     // ========================================================
//     // 3. GET CENTRAL ZOOM CONNECTION
//     // ========================================================

//     const connectionRows =
//       await query(
//         `
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
//         ORDER BY id DESC
//         LIMIT 1
//         `
//       );


//     if (
//       !connectionRows ||
//       connectionRows.length === 0
//     ) {
//       console.log(
//         "[Zoom Call History] No Zoom connection found"
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           connected: false,
//           error:
//             "No central Zoom account is connected",
//         },
//         {
//           status: 400,

//           headers: {
//             "Cache-Control":
//               "no-store",
//           },
//         }
//       );
//     }


//     const connection =
//       connectionRows[0];


//     let accessToken =
//       connection.access_token;

//     let refreshToken =
//       connection.refresh_token;

//     let expiresAt =
//       connection.expires_at;


//     // ========================================================
//     // 4. REFRESH ZOOM TOKEN IF REQUIRED
//     // ========================================================

//     let shouldRefresh =
//       false;


//     if (expiresAt) {
//       const expiresAtMs =
//         new Date(
//           expiresAt
//         ).getTime();

//       const twoMinutes =
//         2 * 60 * 1000;


//       if (
//         Number.isFinite(
//           expiresAtMs
//         ) &&
//         expiresAtMs <=
//           Date.now() +
//             twoMinutes
//       ) {
//         shouldRefresh =
//           true;
//       }
//     }


//     if (shouldRefresh) {
//       console.log(
//         "[Zoom Call History] Access token expired/near expiry. Refreshing..."
//       );


//       if (!refreshToken) {
//         return NextResponse.json(
//           {
//             success: false,
//             connected: false,
//             error:
//               "Zoom access token expired and no refresh token is available",
//           },
//           {
//             status: 401,

//             headers: {
//               "Cache-Control":
//                 "no-store",
//             },
//           }
//         );
//       }


//       const basicAuth =
//         Buffer.from(
//           `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
//         ).toString(
//           "base64"
//         );


//       const refreshResponse =
//         await fetch(
//           "https://zoom.us/oauth/token",
//           {
//             method: "POST",

//             headers: {
//               Authorization:
//                 `Basic ${basicAuth}`,

//               "Content-Type":
//                 "application/x-www-form-urlencoded",
//             },

//             body:
//               new URLSearchParams(
//                 {
//                   grant_type:
//                     "refresh_token",

//                   refresh_token:
//                     refreshToken,
//                 }
//               ).toString(),

//             cache:
//               "no-store",
//           }
//         );


//       const refreshData =
//         await refreshResponse.json();


//       if (
//         !refreshResponse.ok
//       ) {
//         console.error(
//           "[Zoom Call History] Token refresh failed:",
//           refreshData
//         );

//         return NextResponse.json(
//           {
//             success: false,
//             connected: false,
//             error:
//               refreshData?.reason ||
//               refreshData?.message ||
//               "Zoom token refresh failed",
//           },
//           {
//             status: 401,

//             headers: {
//               "Cache-Control":
//                 "no-store",
//             },
//           }
//         );
//       }


//       accessToken =
//         refreshData.access_token;


//       refreshToken =
//         refreshData.refresh_token ||
//         refreshToken;


//       const expiresIn =
//         Number(
//           refreshData.expires_in ||
//             3600
//         );


//       expiresAt =
//         new Date(
//           Date.now() +
//             expiresIn * 1000
//         );


//       await query(
//         `
//         UPDATE zoom_connections
//         SET
//           access_token = ?,
//           refresh_token = ?,
//           expires_at = ?,
//           updated_at = NOW()
//         WHERE id = ?
//         `,
//         [
//           accessToken,
//           refreshToken,
//           expiresAt,
//           connection.id,
//         ]
//       );


//       console.log(
//         "[Zoom Call History] Zoom token refreshed successfully"
//       );
//     }


//     // ========================================================
//     // 5. QUERY PARAMS + DEFAULT LAST 7 DAYS
//     // ========================================================

//     const {
//       searchParams,
//     } = new URL(
//       request.url
//     );


//     let from =
//       searchParams.get(
//         "from"
//       );

//     let to =
//       searchParams.get(
//         "to"
//       );


//     const customFrom =
//       Boolean(from);

//     const customTo =
//       Boolean(to);


//     // --------------------------------------------------------
//     // DEFAULT LAST 7 CALENDAR DAYS
//     // --------------------------------------------------------

//     if (!from || !to) {
//       const defaultRange =
//         getDefaultDateRange();


//       from =
//         from ||
//         defaultRange.from;

//       to =
//         to ||
//         defaultRange.to;
//     }


//     const requestedPageSize =
//       Number(
//         searchParams.get(
//           "page_size"
//         ) ||
//           DEFAULT_PAGE_SIZE
//       );


//     const pageSize =
//       Math.min(
//         Math.max(
//           Number.isFinite(
//             requestedPageSize
//           )
//             ? requestedPageSize
//             : DEFAULT_PAGE_SIZE,
//           1
//         ),
//         MAX_PAGE_SIZE
//       );


//     console.log(
//       "[Zoom Call History] DATE FILTER:",
//       {
//         from,
//         to,
//         pageSize,

//         automatic_last_7_days:
//           !customFrom &&
//           !customTo,
//       }
//     );


//     // ========================================================
//     // 6. FETCH ALL ZOOM PAGES
//     // ========================================================

//     let nextPageToken =
//       null;

//     let pageNumber =
//       0;

//     const allCalls =
//       [];


//     do {
//       pageNumber++;


//       if (pageNumber > 1) {
//         await sleep(
//           PAGE_DELAY_MS
//         );
//       }


//       console.log(
//         `[Zoom Call History] Fetching page ${pageNumber}`
//       );


//       const zoomData =
//         await fetchZoomCallHistory(
//           accessToken,
//           {
//             from,
//             to,
//             page_size:
//               pageSize,

//             ...(nextPageToken
//               ? {
//                   next_page_token:
//                     nextPageToken,
//                 }
//               : {}),
//           }
//         );


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


//       console.log(
//         `[Zoom Call History] Page ${pageNumber}: ${pageCalls.length} calls`
//       );


//       allCalls.push(
//         ...pageCalls
//       );


//       nextPageToken =
//         zoomData?.next_page_token ||
//         null;


//       if (!nextPageToken) {
//         break;
//       }


//     } while (
//       pageNumber <
//       MAX_PAGES
//     );


//     console.log(
//       "[Zoom Call History] TOTAL RAW CALLS:",
//       allCalls.length
//     );


//     // ========================================================
//     // 7. DEDUPLICATE CALLS
//     // ========================================================

//     const uniqueCallsMap =
//       new Map();


//     for (
//       const call of allCalls
//     ) {
//       const key =
//         getCallUniqueKey(
//           call
//         );


//       if (
//         !uniqueCallsMap.has(
//           key
//         )
//       ) {
//         uniqueCallsMap.set(
//           key,
//           call
//         );
//       }
//     }


//     const uniqueCalls =
//       Array.from(
//         uniqueCallsMap.values()
//       );


//     console.log(
//       "[Zoom Call History] UNIQUE CALLS:",
//       uniqueCalls.length
//     );


//     // ========================================================
//     // 8. ADD CRM EXTENSION
//     // ========================================================

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
//                 ? `Ext. ${extension}`
//                 : null,
//           };
//         }
//       );


//     // ========================================================
//     // 9. ALL EXTENSION COUNTS
//     // ========================================================

//     const allExtensionCounts =
//       {};


//     for (
//       const call of
//         enrichedCalls
//     ) {
//       const extension =
//         call.crm_extension;


//       if (!extension) {
//         continue;
//       }


//       allExtensionCounts[
//         extension
//       ] =
//         (
//           allExtensionCounts[
//             extension
//           ] || 0
//         ) + 1;
//     }


//     // ========================================================
//     // 10. FILTER FOR CURRENT USER
//     // ========================================================

//     let visibleCalls =
//       [];


//     if (isAdmin) {

//       // ------------------------------------------------------
//       // ADMIN = ALL CALLS
//       // ------------------------------------------------------

//       visibleCalls =
//         enrichedCalls;


//       console.log(
//         "[Zoom Call History] ADMIN USER -> ALL CALLS"
//       );

//     } else {

//       // ------------------------------------------------------
//       // NORMAL USER = OWN EXTENSION
//       // ------------------------------------------------------

//       if (!userExtension) {
//         console.log(
//           "[Zoom Call History] USER HAS NO ZOOM EXTENSION"
//         );


//         return NextResponse.json(
//           {
//             success: true,

//             connected: true,

//             live: true,

//             user: {
//               id:
//                 currentUser.id,

//               name:
//                 currentUser.name,

//               email:
//                 currentUser.email,

//               role:
//                 currentUser.role,

//               zoom_extension:
//                 null,
//             },

//             calls: [],

//             total_records:
//               uniqueCalls.length,

//             visible_records:
//               0,

//             extension_counts:
//               {},

//             all_extension_counts:
//               allExtensionCounts,

//             page_size:
//               pageSize,

//             pages_fetched:
//               pageNumber,

//             extensions: [],

//             from:
//               from || null,

//             to:
//               to || null,

//             fetched_at:
//               new Date().toISOString(),

//             next_page_token:
//               null,

//             message:
//               "No Zoom extension is assigned to this user",
//           },

//           {
//             status: 200,

//             headers: {
//               "Cache-Control":
//                 "no-store, no-cache, must-revalidate",

//               Pragma:
//                 "no-cache",
//             },
//           }
//         );
//       }


//       visibleCalls =
//         enrichedCalls.filter(
//           (call) =>
//             String(
//               call.crm_extension ||
//                 ""
//             ).trim() ===
//             userExtension
//         );


//       console.log(
//         "[Zoom Call History] USER FILTER:",
//         {
//           userId:
//             currentUser.id,

//           userName:
//             currentUser.name,

//           extension:
//             userExtension,

//           total:
//             enrichedCalls.length,

//           visible:
//             visibleCalls.length,
//         }
//       );
//     }


//     // ========================================================
//     // 11. VISIBLE EXTENSION COUNTS
//     // ========================================================

//     const extensionCounts =
//       {};


//     for (
//       const call of
//         visibleCalls
//     ) {
//       const extension =
//         call.crm_extension;


//       if (!extension) {
//         continue;
//       }


//       extensionCounts[
//         extension
//       ] =
//         (
//           extensionCounts[
//             extension
//           ] || 0
//         ) + 1;
//     }


//     // ========================================================
//     // 12. EXTENSION LIST
//     // ========================================================

//     const extensions =
//       Object.keys(
//         extensionCounts
//       ).sort(
//         (a, b) =>
//           Number(a) -
//           Number(b)
//       );


//     // ========================================================
//     // 13. DATE DISTRIBUTION DEBUG
//     // ========================================================

//     const dateCounts =
//       {};


//     for (
//       const call of
//         visibleCalls
//     ) {
//       const value =
//         call?.start_time ||
//         call?.startTime ||
//         call?.start_datetime ||
//         call?.created_at ||
//         call?.createdAt ||
//         null;


//       if (!value) {
//         continue;
//       }


//       const date =
//         new Date(value);


//       if (
//         Number.isNaN(
//           date.getTime()
//         )
//       ) {
//         continue;
//       }


//       const dateKey =
//         formatDate(date);


//       dateCounts[
//         dateKey
//       ] =
//         (
//           dateCounts[
//             dateKey
//           ] || 0
//         ) + 1;
//     }


//     console.log(
//       "[Zoom Call History] DATE DISTRIBUTION:",
//       dateCounts
//     );


//     // ========================================================
//     // 14. FINAL LOG
//     // ========================================================

//     console.log(
//       "[Zoom Call History] FINAL:",
//       {
//         userId:
//           currentUser.id,

//         role:
//           currentUser.role,

//         extension:
//           userExtension,

//         isAdmin,

//         totalFetched:
//           enrichedCalls.length,

//         visible:
//           visibleCalls.length,

//         extensions,

//         from,

//         to,

//         dateCounts,
//       }
//     );


//     console.log(
//       "================================================"
//     );

//     console.log(
//       "[Zoom Call History] REQUEST COMPLETE"
//     );

//     console.log(
//       "================================================"
//     );


//     // ========================================================
//     // 15. RESPONSE
//     // ========================================================

//     return NextResponse.json(
//       {
//         success: true,

//         connected: true,

//         live: true,


//         // ----------------------------------------------------
//         // CURRENT CRM USER
//         // ----------------------------------------------------

//         user: {
//           id:
//             currentUser.id,

//           name:
//             currentUser.name,

//           email:
//             currentUser.email,

//           role:
//             currentUser.role,

//           zoom_extension:
//             userExtension,
//         },


//         // ----------------------------------------------------
//         // FILTERED CALLS
//         // ----------------------------------------------------

//         calls:
//           visibleCalls,


//         // ----------------------------------------------------
//         // COUNTS
//         // ----------------------------------------------------

//         total_records:
//           enrichedCalls.length,

//         visible_records:
//           visibleCalls.length,


//         // ----------------------------------------------------
//         // CURRENT USER EXTENSION COUNTS
//         // ----------------------------------------------------

//         extension_counts:
//           extensionCounts,


//         // ----------------------------------------------------
//         // ALL EXTENSION COUNTS
//         // ----------------------------------------------------

//         all_extension_counts:
//           allExtensionCounts,


//         // ----------------------------------------------------
//         // EXTENSIONS
//         // ----------------------------------------------------

//         extensions,


//         // ----------------------------------------------------
//         // PAGINATION
//         // ----------------------------------------------------

//         page_size:
//           pageSize,

//         pages_fetched:
//           pageNumber,


//         // ----------------------------------------------------
//         // DATE RANGE
//         // ----------------------------------------------------

//         from:
//           from || null,

//         to:
//           to || null,


//         // ----------------------------------------------------
//         // DATE DISTRIBUTION
//         // ----------------------------------------------------

//         date_counts:
//           dateCounts,


//         // ----------------------------------------------------
//         // META
//         // ----------------------------------------------------

//         fetched_at:
//           new Date().toISOString(),

//         next_page_token:
//           null,
//       },

//       {
//         status: 200,

//         headers: {
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate",

//           Pragma:
//             "no-cache",

//           Expires:
//             "0",
//         },
//       }
//     );

//   } catch (error) {

//     console.error(
//       "================================================"
//     );

//     console.error(
//       "[Zoom Call History] ERROR"
//     );

//     console.error(
//       error
//     );

//     console.error(
//       "================================================"
//     );


//     const status =
//       error?.status === 401
//         ? 401
//         : error?.status === 429
//         ? 429
//         : 500;


//     return NextResponse.json(
//       {
//         success: false,

//         connected:
//           status !== 401,

//         error:
//           error?.message ||
//           "Failed to fetch Zoom call history",

//         zoom_code:
//           error?.zoomCode ||
//           null,
//       },

//       {
//         status,

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

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const DEFAULT_PAGE_SIZE = 300;
const MAX_PAGE_SIZE = 300;

// Full history can fetch many pages.
const MAX_FULL_PAGES = 100;

// Live should normally need only a few pages.
const MAX_LIVE_PAGES = 20;

// No artificial delay between pages.
// Zoom 429 retry logic below protects us.
const PAGE_DELAY_MS = 0;

const MAX_429_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;
const MAX_RETRY_DELAY_MS = 5000;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
|--------------------------------------------------------------------------
| DATE FORMAT
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
|--------------------------------------------------------------------------
| TODAY
|--------------------------------------------------------------------------
*/

function getTodayDate() {
  return formatDate(new Date());
}

/*
|--------------------------------------------------------------------------
| LAST 7 DAYS
|--------------------------------------------------------------------------
*/

function getDefaultDateRange() {
  const now = new Date();

  const todayStart = new Date(now);

  todayStart.setHours(0, 0, 0, 0);

  const fromDate = new Date(todayStart);

  fromDate.setDate(fromDate.getDate() - 6);

  return {
    from: formatDate(fromDate),
    to: formatDate(todayStart),
  };
}

/*
|--------------------------------------------------------------------------
| RETRY AFTER
|--------------------------------------------------------------------------
*/

function getRetryAfterMs(response) {
  const retryAfter = response.headers.get("retry-after");

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds)) {
    return Math.max(seconds * 1000, 0);
  }

  const retryDate = Date.parse(retryAfter);

  if (!Number.isNaN(retryDate)) {
    return Math.max(retryDate - Date.now(), 0);
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| EXTENSION DETECTION
|--------------------------------------------------------------------------
*/

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

  /*
  |--------------------------------------------------------------------------
  | INBOUND
  | Customer -> CRM
  | CRM extension = callee
  |--------------------------------------------------------------------------
  */

  if (direction === "inbound") {
    if (calleeExtension) {
      return String(calleeExtension).trim();
    }

    if (callerExtension) {
      return String(callerExtension).trim();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | OUTBOUND
  | CRM -> Customer
  | CRM extension = caller
  |--------------------------------------------------------------------------
  */

  if (direction === "outbound") {
    if (callerExtension) {
      return String(callerExtension).trim();
    }

    if (calleeExtension) {
      return String(calleeExtension).trim();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FALLBACK
  |--------------------------------------------------------------------------
  */

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

/*
|--------------------------------------------------------------------------
| UNIQUE CALL KEY
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ZOOM API REQUEST
|--------------------------------------------------------------------------
*/

async function fetchZoomCallHistory(accessToken, params) {
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

    console.log(
      "[Zoom API] Request:",
      url.toString()
    );

    const response = await fetch(url.toString(), {
      method: "GET",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },

      cache: "no-store",
    });

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    if (response.ok) {
      return await response.json();
    }

    /*
    |--------------------------------------------------------------------------
    | RATE LIMIT
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

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

/*
|--------------------------------------------------------------------------
| FETCH ZOOM PAGES
|--------------------------------------------------------------------------
*/

async function fetchAllCalls({
  accessToken,
  from,
  to,
  pageSize,
  mode,
}) {
  let nextPageToken = null;

  let pageNumber = 0;

  const allCalls = [];

  const maxPages =
    mode === "live"
      ? MAX_LIVE_PAGES
      : MAX_FULL_PAGES;

  do {
    pageNumber++;

    if (pageNumber > 1 && PAGE_DELAY_MS > 0) {
      await sleep(PAGE_DELAY_MS);
    }

    console.log(
      `[Zoom Call History] ${mode.toUpperCase()} - Fetching page ${pageNumber}`
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
      `[Zoom Call History] ${mode.toUpperCase()} page ${pageNumber}: ${pageCalls.length} calls`
    );

    allCalls.push(...pageCalls);

    nextPageToken =
      zoomData?.next_page_token || null;

    if (!nextPageToken) {
      break;
    }

    /*
    |--------------------------------------------------------------------------
    | LIVE SAFETY
    |--------------------------------------------------------------------------
    |
    | We never allow live polling to accidentally fetch unlimited pages.
    |--------------------------------------------------------------------------
    */

    if (pageNumber >= maxPages) {
      console.warn(
        `[Zoom Call History] ${mode} reached MAX pages: ${maxPages}`
      );

      break;
    }
  } while (nextPageToken);

  return {
    calls: allCalls,
    pagesFetched: pageNumber,
  };
}

/*
|--------------------------------------------------------------------------
| DEDUPLICATE
|--------------------------------------------------------------------------
*/

function deduplicateCalls(calls) {
  const map = new Map();

  for (const call of calls) {
    const key = getCallUniqueKey(call);

    if (!map.has(key)) {
      map.set(key, call);
    }
  }

  return Array.from(map.values());
}

/*
|--------------------------------------------------------------------------
| ENRICH CALLS
|--------------------------------------------------------------------------
*/

function enrichCalls(calls) {
  return calls.map((call) => {
    const extension = getExtension(call);

    return {
      ...call,

      crm_extension: extension,

      crm_extension_label: extension
        ? `Ext. ${extension}`
        : null,
    };
  });
}

/*
|--------------------------------------------------------------------------
| EXTENSION COUNTS
|--------------------------------------------------------------------------
*/

function calculateExtensionCounts(calls) {
  const counts = {};

  for (const call of calls) {
    const extension =
      call?.crm_extension;

    if (!extension) {
      continue;
    }

    counts[extension] =
      (counts[extension] || 0) + 1;
  }

  return counts;
}

/*
|--------------------------------------------------------------------------
| EXTENSION LIST
|--------------------------------------------------------------------------
*/

function getExtensions(extensionCounts) {
  return Object.keys(extensionCounts).sort(
    (a, b) => Number(a) - Number(b)
  );
}

/*
|--------------------------------------------------------------------------
| CURRENT USER FILTER
|--------------------------------------------------------------------------
*/

function filterCallsForUser({
  calls,
  isAdmin,
  userExtension,
}) {
  if (isAdmin) {
    return calls;
  }

  if (!userExtension) {
    return [];
  }

  return calls.filter(
    (call) =>
      String(
        call?.crm_extension || ""
      ).trim() === userExtension
  );
}

/*
|--------------------------------------------------------------------------
| DATE COUNTS
|--------------------------------------------------------------------------
*/

function calculateDateCounts(calls) {
  const counts = {};

  for (const call of calls) {
    const value =
      call?.start_time ||
      call?.startTime ||
      call?.start_datetime ||
      call?.created_at ||
      call?.createdAt ||
      null;

    if (!value) {
      continue;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const dateKey = formatDate(date);

    counts[dateKey] =
      (counts[dateKey] || 0) + 1;
  }

  return counts;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

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

    /*
    |--------------------------------------------------------------------------
    | 1. CRM AUTH
    |--------------------------------------------------------------------------
    */

    const token =
      request.cookies.get(
        "token"
      )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM login required",
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "no-store",
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
        error?.message
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired CRM session",
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "no-store",
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
          error:
            "CRM user ID not found",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. CURRENT USER
    |--------------------------------------------------------------------------
    */

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

    if (
      !userRows ||
      userRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "CRM user not found",
        },
        {
          status: 404,
        }
      );
    }

    const currentUser =
      userRows[0];

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

    /*
    |--------------------------------------------------------------------------
    | 3. MODE
    |--------------------------------------------------------------------------
    |
    | full = full requested/default range
    | live = today's data only
    |--------------------------------------------------------------------------
    */

    const { searchParams } =
      new URL(request.url);

    let mode =
      String(
        searchParams.get("mode") ||
          "full"
      ).toLowerCase();

    if (
      mode !== "full" &&
      mode !== "live"
    ) {
      mode = "full";
    }

    /*
    |--------------------------------------------------------------------------
    | 4. DATE RANGE
    |--------------------------------------------------------------------------
    */

    let from =
      searchParams.get("from");

    let to =
      searchParams.get("to");

    /*
    |--------------------------------------------------------------------------
    | LIVE MODE
    |--------------------------------------------------------------------------
    |
    | Always force live request to TODAY.
    |
    */

    if (mode === "live") {
      const today =
        getTodayDate();

      from = today;
      to = today;
    } else {
      /*
      |--------------------------------------------------------------------------
      | FULL MODE
      |--------------------------------------------------------------------------
      */

      if (!from || !to) {
        const defaultRange =
          getDefaultDateRange();

        from =
          from ||
          defaultRange.from;

        to =
          to ||
          defaultRange.to;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 5. PAGE SIZE
    |--------------------------------------------------------------------------
    */

    const requestedPageSize =
      Number(
        searchParams.get(
          "page_size"
        ) ||
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
      "[Zoom Call History] MODE:",
      mode
    );

    console.log(
      "[Zoom Call History] DATE:",
      {
        from,
        to,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | 6. CENTRAL ZOOM CONNECTION
    |--------------------------------------------------------------------------
    */

    const connectionRows =
      await query(
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
      return NextResponse.json(
        {
          success: false,
          connected: false,
          error:
            "No central Zoom account is connected",
        },
        {
          status: 400,
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

    /*
    |--------------------------------------------------------------------------
    | 7. REFRESH TOKEN
    |--------------------------------------------------------------------------
    */

    let shouldRefresh = false;

    if (expiresAt) {
      const expiresAtMs =
        new Date(
          expiresAt
        ).getTime();

      const twoMinutes =
        2 * 60 * 1000;

      if (
        Number.isFinite(
          expiresAtMs
        ) &&
        expiresAtMs <=
          Date.now() +
            twoMinutes
      ) {
        shouldRefresh = true;
      }
    }

    if (shouldRefresh) {
      console.log(
        "[Zoom Call History] Refreshing Zoom token..."
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
          }
        );
      }

      const basicAuth =
        Buffer.from(
          `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
        ).toString("base64");

      const refreshResponse =
        await fetch(
          "https://zoom.us/oauth/token",
          {
            method: "POST",

            headers: {
              Authorization:
                `Basic ${basicAuth}`,

              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              new URLSearchParams({
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
          refreshData.expires_in ||
            3600
        );

      expiresAt =
        new Date(
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
        "[Zoom Call History] Token refreshed successfully"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 8. FETCH DATA
    |--------------------------------------------------------------------------
    */

    const {
      calls: rawCalls,
      pagesFetched,
    } =
      await fetchAllCalls({
        accessToken,
        from,
        to,
        pageSize,
        mode,
      });

    console.log(
      `[Zoom Call History] ${mode.toUpperCase()} RAW CALLS:`,
      rawCalls.length
    );

    /*
    |--------------------------------------------------------------------------
    | 9. DEDUPLICATE
    |--------------------------------------------------------------------------
    */

    const uniqueCalls =
      deduplicateCalls(
        rawCalls
      );

    console.log(
      `[Zoom Call History] ${mode.toUpperCase()} UNIQUE CALLS:`,
      uniqueCalls.length
    );

    /*
    |--------------------------------------------------------------------------
    | 10. ENRICH
    |--------------------------------------------------------------------------
    */

    const enrichedCalls =
      enrichCalls(
        uniqueCalls
      );

    /*
    |--------------------------------------------------------------------------
    | 11. ALL EXTENSION COUNTS
    |--------------------------------------------------------------------------
    */

    const allExtensionCounts =
      calculateExtensionCounts(
        enrichedCalls
      );

    /*
    |--------------------------------------------------------------------------
    | 12. FILTER CURRENT USER
    |--------------------------------------------------------------------------
    */

    const visibleCalls =
      filterCallsForUser({
        calls: enrichedCalls,
        isAdmin,
        userExtension,
      });

    /*
    |--------------------------------------------------------------------------
    | 13. VISIBLE EXTENSION COUNTS
    |--------------------------------------------------------------------------
    */

    const extensionCounts =
      calculateExtensionCounts(
        visibleCalls
      );

    /*
    |--------------------------------------------------------------------------
    | 14. EXTENSIONS
    |--------------------------------------------------------------------------
    */

    const extensions =
      getExtensions(
        extensionCounts
      );

    /*
    |--------------------------------------------------------------------------
    | 15. DATE COUNTS
    |--------------------------------------------------------------------------
    */

    const dateCounts =
      calculateDateCounts(
        visibleCalls
      );

    /*
    |--------------------------------------------------------------------------
    | 16. NO EXTENSION
    |--------------------------------------------------------------------------
    */

    if (
      !isAdmin &&
      !userExtension
    ) {
      return NextResponse.json(
        {
          success: true,

          connected: true,

          live: mode === "live",

          mode,

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

          extensions: [],

          page_size: pageSize,

          pages_fetched:
            pagesFetched,

          from,

          to,

          date_counts:
            dateCounts,

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

            Expires: "0",
          },
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 17. FINAL RESPONSE
    |--------------------------------------------------------------------------
    */

    console.log(
      "[Zoom Call History] FINAL:",
      {
        mode,

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

        allExtensionCounts,

        extensionCounts,

        pagesFetched,
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

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | true means this response came from Zoom.
        | mode tells frontend whether this was full/live.
        |
        */

        live: mode === "live",

        mode,

        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        user: {
          id: currentUser.id,

          name: currentUser.name,

          email: currentUser.email,

          role: currentUser.role,

          zoom_extension:
            userExtension,
        },

        /*
        |--------------------------------------------------------------------------
        | CALLS
        |--------------------------------------------------------------------------
        */

        calls:
          visibleCalls,

        /*
        |--------------------------------------------------------------------------
        | COUNTS
        |--------------------------------------------------------------------------
        */

        total_records:
          enrichedCalls.length,

        visible_records:
          visibleCalls.length,

        /*
        |--------------------------------------------------------------------------
        | CURRENT USER EXTENSION COUNTS
        |--------------------------------------------------------------------------
        */

        extension_counts:
          extensionCounts,

        /*
        |--------------------------------------------------------------------------
        | ALL EXTENSION COUNTS
        |--------------------------------------------------------------------------
        */

        all_extension_counts:
          allExtensionCounts,

        /*
        |--------------------------------------------------------------------------
        | EXTENSIONS
        |--------------------------------------------------------------------------
        */

        extensions,

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        page_size:
          pageSize,

        pages_fetched:
          pagesFetched,

        /*
        |--------------------------------------------------------------------------
        | DATE RANGE
        |--------------------------------------------------------------------------
        */

        from: from || null,

        to: to || null,

        /*
        |--------------------------------------------------------------------------
        | DATE COUNTS
        |--------------------------------------------------------------------------
        */

        date_counts:
          dateCounts,

        /*
        |--------------------------------------------------------------------------
        | META
        |--------------------------------------------------------------------------
        */

        fetched_at:
          new Date().toISOString(),

        next_page_token: null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma: "no-cache",

          Expires: "0",
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

    console.error(error);

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