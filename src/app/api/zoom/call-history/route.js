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






import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query, zoomConfig } from "../../../lib/db";

/*
|--------------------------------------------------------------------------
| Helper: Zoom API request
|--------------------------------------------------------------------------
*/

async function zoomFetch(url, accessToken) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: {
      revalidate: 0,
    },
  });
}

/*
|--------------------------------------------------------------------------
| Helper: Normalize Extension
|--------------------------------------------------------------------------
*/

function normalizeExtension(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value)
    .trim()
    .replace(/^Ext\.?/i, "");

  return cleaned || null;
}

/*
|--------------------------------------------------------------------------
| Helper: Refresh Zoom OAuth Token
|--------------------------------------------------------------------------
*/

async function refreshZoomToken(connection) {
  if (!connection.refresh_token) {
    throw new Error(
      "Zoom session expired. Please reconnect Zoom."
    );
  }

  const credentials = Buffer.from(
    `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
  ).toString("base64");

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

  const refreshData = await refreshResponse.json();

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
      "Zoom session expired. Please reconnect Zoom."
    );
  }

  const accessToken =
    refreshData.access_token;

  const newRefreshToken =
    refreshData.refresh_token ||
    connection.refresh_token;

  const expiresAt = new Date(
    Date.now() +
      Number(refreshData.expires_in || 3600) * 1000
  );

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
      expiresAt,
      connection.id,
    ]
  );

  console.log(
    "ZOOM TOKEN REFRESHED SUCCESSFULLY"
  );

  return {
    accessToken,
    expiresAt,
  };
}

/*
|--------------------------------------------------------------------------
| Helper: Get ALL Extensions From Call
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We don't only take the first extension.
|
| For filtering, we check BOTH caller and callee.
|
|--------------------------------------------------------------------------
*/

function getCallExtensions(call) {
  const possibleValues = [
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

  return [
    ...new Set(
      possibleValues
        .map(normalizeExtension)
        .filter(Boolean)
    ),
  ];
}

/*
|--------------------------------------------------------------------------
| Helper: Get Display Extension
|--------------------------------------------------------------------------
*/

function getCallExtension(call) {
  const extensions = getCallExtensions(call);

  return extensions.length > 0
    ? extensions[0]
    : null;
}

/*
|--------------------------------------------------------------------------
| Helper: Check Whether Call Belongs To User
|--------------------------------------------------------------------------
*/

function callBelongsToExtension(
  call,
  targetExtension
) {
  const target =
    normalizeExtension(targetExtension);

  if (!target) {
    return false;
  }

  const callExtensions =
    getCallExtensions(call);

  return callExtensions.includes(target);
}

/*
|--------------------------------------------------------------------------
| Helper: Get Zoom Phone User Extension
|--------------------------------------------------------------------------
*/

function getZoomUserExtension(user) {
  const possibleValues = [
    user.extension_number,
    user.extension,
    user.ext_number,
    user.ext,
  ];

  for (const value of possibleValues) {
    const extension =
      normalizeExtension(value);

    if (extension) {
      return extension;
    }
  }

  const phoneNumbers =
    user.phone_numbers ||
    user.phoneNumbers ||
    user.numbers ||
    [];

  if (Array.isArray(phoneNumbers)) {
    for (const number of phoneNumbers) {
      const extension =
        normalizeExtension(
          number?.extension_number ||
          number?.extension ||
          number?.ext_number ||
          number?.ext
        );

      if (extension) {
        return extension;
      }
    }
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Helper: Fetch ALL Zoom Phone Users
|--------------------------------------------------------------------------
*/

async function fetchAllZoomPhoneUsers(accessToken) {
  const allUsers = [];

  let nextPageToken = null;
  let pageNumber = 0;

  const PAGE_SIZE = 300;
  const MAX_PAGES = 100;

  do {
    pageNumber++;

    const zoomUrl = new URL(
      "https://api.zoom.us/v2/phone/users"
    );

    zoomUrl.searchParams.set(
      "page_size",
      String(PAGE_SIZE)
    );

    if (nextPageToken) {
      zoomUrl.searchParams.set(
        "next_page_token",
        nextPageToken
      );
    }

    console.log(
      "ZOOM PHONE USERS PAGE:",
      pageNumber
    );

    const response =
      await zoomFetch(
        zoomUrl.toString(),
        accessToken
      );

    const data =
      await response.json();

    console.log(
      "ZOOM PHONE USERS STATUS:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "ZOOM PHONE USERS ERROR:",
        data
      );

      throw new Error(
        data?.message ||
        "Failed to retrieve Zoom Phone users"
      );
    }

    const users =
      data.users ||
      data.phone_users ||
      [];

    allUsers.push(...users);

    nextPageToken =
      data.next_page_token ||
      null;

    if (pageNumber >= MAX_PAGES) {
      console.warn(
        "MAX ZOOM PHONE USERS PAGE LIMIT REACHED"
      );

      break;
    }
  } while (nextPageToken);

  return allUsers;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET(request) {
  try {
    console.log(
      "===================================="
    );

    console.log(
      "ZOOM CRM CALL HISTORY START"
    );

    console.log(
      "===================================="
    );

    /*
    |--------------------------------------------------------------------------
    | 1. CHECK CRM LOGIN
    |--------------------------------------------------------------------------
    */

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM login required",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 2. VERIFY JWT
    |--------------------------------------------------------------------------
    */

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      console.error(
        "JWT ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired CRM session",
        },
        {
          status: 401,
        }
      );
    }

    const loggedInUserId =
      decoded?.id;

    if (!loggedInUserId) {
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

    console.log(
      "LOGGED-IN CRM USER ID:",
      loggedInUserId
    );

    /*
    |--------------------------------------------------------------------------
    | 3. GET CURRENT CRM USER
    |--------------------------------------------------------------------------
    */

    const loggedUsers =
      await query(
        `
          SELECT
            id,
            name,
            email,
            role,
            status,
            zoom_extension
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [loggedInUserId]
      );

    if (
      !loggedUsers ||
      loggedUsers.length === 0
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

    const loggedInUser =
      loggedUsers[0];

    /*
    |--------------------------------------------------------------------------
    | 4. CHECK USER STATUS AGAIN
    |--------------------------------------------------------------------------
    */

    if (
      loggedInUser.status !== "Active"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your CRM account is inactive",
        },
        {
          status: 403,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. GET USER EXTENSION
    |--------------------------------------------------------------------------
    */

    const userExtension =
      normalizeExtension(
        loggedInUser.zoom_extension
      );

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT ACCESS RULE
    |--------------------------------------------------------------------------
    |
    | User with extension:
    |     -> ONLY his/her extension calls
    |
    | Admin without extension:
    |     -> ALL calls
    |
    | Non-admin without extension:
    |     -> NO calls
    |
    |--------------------------------------------------------------------------
    */

    let accessMode = "none";

    if (userExtension) {
      accessMode = "extension";
    } else if (
      String(loggedInUser.role).toLowerCase() ===
      "admin"
    ) {
      accessMode = "all";
    }

    console.log(
      "===================================="
    );

    console.log(
      "CRM USER:",
      loggedInUser.name
    );

    console.log(
      "CRM USER ID:",
      loggedInUser.id
    );

    console.log(
      "CRM USER ROLE:",
      loggedInUser.role
    );

    console.log(
      "CRM USER EXTENSION:",
      userExtension
    );

    console.log(
      "ACCESS MODE:",
      accessMode
    );

    console.log(
      "===================================="
    );

    /*
    |--------------------------------------------------------------------------
    | 6. GET ADMIN USER FOR SHARED ZOOM CONNECTION
    |--------------------------------------------------------------------------
    */

    const adminUsers =
      await query(
        `
          SELECT
            id,
            name,
            email,
            role,
            status,
            zoom_extension
          FROM users
          WHERE
            role = 'admin'
            AND status = 'Active'
          ORDER BY id ASC
          LIMIT 1
        `
      );

    const adminUser =
      adminUsers?.length
        ? adminUsers[0]
        : null;

    /*
    |--------------------------------------------------------------------------
    | 7. FIND ZOOM CONNECTION
    |--------------------------------------------------------------------------
    |
    | First:
    |     Admin Zoom connection
    |
    | Fallback:
    |     Logged-in user's Zoom connection
    |
    |--------------------------------------------------------------------------
    */

    let connections = [];

    if (adminUser?.id) {
      connections =
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
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
          `,
          [adminUser.id]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 8. FALLBACK TO CURRENT USER ZOOM CONNECTION
    |--------------------------------------------------------------------------
    */

    if (
      !connections ||
      connections.length === 0
    ) {
      connections =
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
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
          `,
          [loggedInUserId]
        );
    }

    if (
      !connections ||
      connections.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          connected: false,
          error:
            "Zoom account is not connected. Please connect Zoom from Admin account.",
        },
        {
          status: 404,
        }
      );
    }

    const connection =
      connections[0];

    /*
    |--------------------------------------------------------------------------
    | 9. GET ACCESS TOKEN
    |--------------------------------------------------------------------------
    */

    let accessToken =
      connection.access_token;

    let expiresAt =
      connection.expires_at
        ? new Date(
            connection.expires_at
          )
        : null;

    const now =
      Date.now();

    const isExpired =
      !expiresAt ||
      expiresAt.getTime() <=
        now +
          2 * 60 * 1000;

    /*
    |--------------------------------------------------------------------------
    | 10. REFRESH TOKEN
    |--------------------------------------------------------------------------
    */

    if (isExpired) {
      console.log(
        "ZOOM ACCESS TOKEN EXPIRED"
      );

      const refreshed =
        await refreshZoomToken(
          connection
        );

      accessToken =
        refreshed.accessToken;

      expiresAt =
        refreshed.expiresAt;
    }

    /*
    |--------------------------------------------------------------------------
    | 11. GET ALL ACTIVE CRM USERS
    |--------------------------------------------------------------------------
    */

    const crmUsers =
      await query(
        `
          SELECT
            id,
            name,
            email,
            role,
            status,
            zoom_extension
          FROM users
          WHERE status = 'Active'
          ORDER BY id ASC
        `
      );

    /*
    |--------------------------------------------------------------------------
    | 12. CRM EXTENSION MAP
    |--------------------------------------------------------------------------
    */

    const crmByExtension =
      new Map();

    for (const user of crmUsers) {
      const extension =
        normalizeExtension(
          user.zoom_extension
        );

      if (!extension) {
        continue;
      }

      crmByExtension.set(
        extension,
        user
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 13. FETCH ZOOM PHONE USERS
    |--------------------------------------------------------------------------
    */

    let zoomPhoneUsers = [];

    try {
      zoomPhoneUsers =
        await fetchAllZoomPhoneUsers(
          accessToken
        );
    } catch (error) {
      console.error(
        "ZOOM PHONE USERS FETCH ERROR:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | Don't completely break call history if Phone Users endpoint
      | is unavailable.
      |--------------------------------------------------------------------------
      */

      zoomPhoneUsers = [];
    }

    /*
    |--------------------------------------------------------------------------
    | 14. BUILD ZOOM EXTENSION MAP
    |--------------------------------------------------------------------------
    */

    const zoomByExtension =
      new Map();

    for (
      const zoomUser of zoomPhoneUsers
    ) {
      const extension =
        getZoomUserExtension(
          zoomUser
        );

      if (!extension) {
        continue;
      }

      zoomByExtension.set(
        extension,
        zoomUser
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 15. QUERY PARAMETERS
    |--------------------------------------------------------------------------
    */

    const {
      searchParams,
    } = new URL(request.url);

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

    const pageSize =
      Math.min(
        Math.max(
          requestedPageSize,
          1
        ),
        300
      );

    /*
    |--------------------------------------------------------------------------
    | 16. FETCH ALL CALL HISTORY
    |--------------------------------------------------------------------------
    */

    let allCalls = [];

    let nextPageToken =
      null;

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
        await zoomFetch(
          zoomUrl.toString(),
          accessToken
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
            details:
              zoomData,
          },
          {
            status:
              zoomResponse.status,
          }
        );
      }

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

      if (
        pageNumber >=
        MAX_PAGES
      ) {
        console.warn(
          "MAX CALL HISTORY PAGE LIMIT REACHED"
        );

        break;
      }
    } while (nextPageToken);

    /*
    |--------------------------------------------------------------------------
    | 17. REMOVE DUPLICATES
    |--------------------------------------------------------------------------
    */

    const uniqueCallsMap =
      new Map();

    for (
      const call of allCalls
    ) {
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

    /*
    |--------------------------------------------------------------------------
    | 18. FILTER CALLS FOR LOGGED-IN USER
    |--------------------------------------------------------------------------
    */

    let visibleCalls = [];

    if (
      accessMode === "all"
    ) {
      /*
      |--------------------------------------------------------------------------
      | Admin without extension
      | -> ALL CALLS
      |--------------------------------------------------------------------------
      */

      visibleCalls =
        uniqueCalls;

    } else if (
      accessMode === "extension"
    ) {
      /*
      |--------------------------------------------------------------------------
      | User with extension
      | -> ONLY that extension
      |--------------------------------------------------------------------------
      */

      visibleCalls =
        uniqueCalls.filter(
          (call) =>
            callBelongsToExtension(
              call,
              userExtension
            )
        );

    } else {
      /*
      |--------------------------------------------------------------------------
      | Non-admin without extension
      | -> NO CALLS
      |--------------------------------------------------------------------------
      */

      visibleCalls = [];
    }

    console.log(
      "===================================="
    );

    console.log(
      "TOTAL ZOOM CALLS:",
      uniqueCalls.length
    );

    console.log(
      "VISIBLE CALLS:",
      visibleCalls.length
    );

    console.log(
      "FILTER EXTENSION:",
      userExtension
    );

    console.log(
      "ACCESS MODE:",
      accessMode
    );

    console.log(
      "===================================="
    );

    /*
    |--------------------------------------------------------------------------
    | 19. BUILD EXTENSION MAP
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Admin:
    |     all Zoom extensions
    |
    | User:
    |     only logged-in user's extension
    |
    |--------------------------------------------------------------------------
    */

    const extensionMap =
      new Map();

    if (
      accessMode === "all"
    ) {
      /*
      |--------------------------------------------------------------------------
      | ADMIN
      |--------------------------------------------------------------------------
      */

      for (
        const [
          extension,
          zoomUser,
        ] of zoomByExtension
      ) {
        const crmUser =
          crmByExtension.get(
            extension
          );

        extensionMap.set(
          extension,
          {
            extension,

            label:
              `Ext.${extension}`,

            calls: 0,

            zoom_user_id:
              zoomUser?.id ||
              zoomUser?.user_id ||
              null,

            zoom_name:
              zoomUser?.display_name ||
              zoomUser?.name ||
              [
                zoomUser?.first_name,
                zoomUser?.last_name,
              ]
                .filter(Boolean)
                .join(" ") ||
              null,

            zoom_email:
              zoomUser?.email ||
              null,

            crm_user_id:
              crmUser?.id ||
              null,

            crm_user_name:
              crmUser?.name ||
              null,

            crm_user_email:
              crmUser?.email ||
              null,

            crm_user_role:
              crmUser?.role ||
              null,

            crm_status:
              crmUser?.status ||
              null,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Add CRM extensions not returned by Zoom
      |--------------------------------------------------------------------------
      */

      for (
        const [
          extension,
          crmUser,
        ] of crmByExtension
      ) {
        if (
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

              zoom_user_id:
                null,

              zoom_name:
                null,

              zoom_email:
                null,

              crm_user_id:
                crmUser.id,

              crm_user_name:
                crmUser.name,

              crm_user_email:
                crmUser.email,

              crm_user_role:
                crmUser.role,

              crm_status:
                crmUser.status,
            }
          );
        }
      }

    } else if (
      accessMode === "extension" &&
      userExtension
    ) {
      /*
      |--------------------------------------------------------------------------
      | NORMAL USER
      |
      | ONLY CURRENT USER EXTENSION
      |--------------------------------------------------------------------------
      */

      const zoomUser =
        zoomByExtension.get(
          userExtension
        );

      extensionMap.set(
        userExtension,
        {
          extension:
            userExtension,

          label:
            `Ext.${userExtension}`,

          calls: 0,

          zoom_user_id:
            zoomUser?.id ||
            zoomUser?.user_id ||
            null,

          zoom_name:
            zoomUser?.display_name ||
            zoomUser?.name ||
            [
              zoomUser?.first_name,
              zoomUser?.last_name,
            ]
              .filter(Boolean)
              .join(" ") ||
            null,

          zoom_email:
            zoomUser?.email ||
            null,

          crm_user_id:
            loggedInUser.id,

          crm_user_name:
            loggedInUser.name,

          crm_user_email:
            loggedInUser.email,

          crm_user_role:
            loggedInUser.role,

          crm_status:
            loggedInUser.status,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 20. ENRICH VISIBLE CALLS
    |--------------------------------------------------------------------------
    */

    const enrichedCalls =
      visibleCalls.map(
        (call) => {
          /*
          |--------------------------------------------------------------------------
          | For user's filtered calls, use their assigned extension.
          | For Admin, detect extension from call.
          |--------------------------------------------------------------------------
          */

          let extension =
            getCallExtension(
              call
            );

          if (
            accessMode ===
              "extension" &&
            userExtension
          ) {
            extension =
              userExtension;
          }

          const crmUser =
            extension
              ? crmByExtension.get(
                  extension
                )
              : null;

          const zoomUser =
            extension
              ? zoomByExtension.get(
                  extension
                )
              : null;

          /*
          |--------------------------------------------------------------------------
          | Update extension count
          |--------------------------------------------------------------------------
          */

          if (extension) {
            if (
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

                  zoom_user_id:
                    zoomUser?.id ||
                    zoomUser?.user_id ||
                    null,

                  zoom_name:
                    zoomUser?.display_name ||
                    zoomUser?.name ||
                    null,

                  zoom_email:
                    zoomUser?.email ||
                    null,

                  crm_user_id:
                    crmUser?.id ||
                    null,

                  crm_user_name:
                    crmUser?.name ||
                    null,

                  crm_user_email:
                    crmUser?.email ||
                    null,

                  crm_user_role:
                    crmUser?.role ||
                    null,

                  crm_status:
                    crmUser?.status ||
                    null,
                }
              );
            }

            const extensionItem =
              extensionMap.get(
                extension
              );

            extensionItem.calls += 1;
          }

          return {
            ...call,

            /*
            |--------------------------------------------------------------------------
            | Extension
            |--------------------------------------------------------------------------
            */

            crm_extension:
              extension,

            crm_extension_label:
              extension
                ? `Ext.${extension}`
                : null,

            /*
            |--------------------------------------------------------------------------
            | Zoom User
            |--------------------------------------------------------------------------
            */

            zoom_user_id:
              zoomUser?.id ||
              zoomUser?.user_id ||
              null,

            zoom_user_name:
              zoomUser?.display_name ||
              zoomUser?.name ||
              [
                zoomUser?.first_name,
                zoomUser?.last_name,
              ]
                .filter(Boolean)
                .join(" ") ||
              null,

            zoom_user_email:
              zoomUser?.email ||
              null,

            /*
            |--------------------------------------------------------------------------
            | CRM User
            |--------------------------------------------------------------------------
            */

            crm_user_id:
              crmUser?.id ||
              null,

            crm_user_name:
              crmUser?.name ||
              null,

            crm_user_email:
              crmUser?.email ||
              null,

            crm_user_role:
              crmUser?.role ||
              null,

            crm_user_status:
              crmUser?.status ||
              null,
          };
        }
      );

    /*
    |--------------------------------------------------------------------------
    | 21. SORT EXTENSIONS
    |--------------------------------------------------------------------------
    */

    const extensions =
      Array.from(
        extensionMap.values()
      ).sort(
        (a, b) => {
          const aNumber =
            Number(a.extension);

          const bNumber =
            Number(b.extension);

          if (
            !Number.isNaN(
              aNumber
            ) &&
            !Number.isNaN(
              bNumber
            )
          ) {
            return (
              aNumber -
              bNumber
            );
          }

          return String(
            a.extension
          ).localeCompare(
            String(
              b.extension
            )
          );
        }
      );

    /*
    |--------------------------------------------------------------------------
    | 22. EXTENSION COUNTS
    |--------------------------------------------------------------------------
    */

    const extensionCounts =
      {};

    for (
      const extension of extensions
    ) {
      extensionCounts[
        extension.extension
      ] = extension.calls;
    }

    /*
    |--------------------------------------------------------------------------
    | 23. LOGGING
    |--------------------------------------------------------------------------
    */

    console.log(
      "===================================="
    );

    console.log(
      "FINAL ZOOM CRM DATA"
    );

    console.log(
      "LOGGED USER:",
      loggedInUser.name
    );

    console.log(
      "LOGGED USER ID:",
      loggedInUser.id
    );

    console.log(
      "LOGGED USER EXTENSION:",
      userExtension
    );

    console.log(
      "ACCESS MODE:",
      accessMode
    );

    console.log(
      "ZOOM CONNECTION:",
      connection.zoom_email
    );

    console.log(
      "TOTAL ZOOM PHONE USERS:",
      zoomPhoneUsers.length
    );

    console.log(
      "TOTAL CALLS FROM ZOOM:",
      allCalls.length
    );

    console.log(
      "UNIQUE CALLS:",
      uniqueCalls.length
    );

    console.log(
      "VISIBLE CALLS:",
      enrichedCalls.length
    );

    console.log(
      "FINAL EXTENSIONS:",
      extensions.map(
        (item) => item.extension
      )
    );

    console.log(
      "===================================="
    );

    /*
    |--------------------------------------------------------------------------
    | 24. RESPONSE
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        connected: true,

        live: true,

        /*
        |--------------------------------------------------------------------------
        | Login Information
        |--------------------------------------------------------------------------
        */

        logged_in_user: {
          id:
            loggedInUser.id,

          name:
            loggedInUser.name,

          email:
            loggedInUser.email,

          role:
            loggedInUser.role,

          zoom_extension:
            userExtension,
        },

        /*
        |--------------------------------------------------------------------------
        | Access Information
        |--------------------------------------------------------------------------
        */

        access: {
          mode:
            accessMode,

          extension:
            userExtension,

          can_view_all:
            accessMode === "all",
        },

        /*
        |--------------------------------------------------------------------------
        | Zoom Connection
        |--------------------------------------------------------------------------
        */

        zoom_connection: {
          user_id:
            connection.user_id,

          zoom_account_id:
            connection.zoom_account_id,

          zoom_user_id:
            connection.zoom_user_id,

          zoom_email:
            connection.zoom_email,
        },

        /*
        |--------------------------------------------------------------------------
        | Zoom Phone Users
        |--------------------------------------------------------------------------
        |
        | Admin gets all.
        | Normal user gets only own extension.
        |--------------------------------------------------------------------------
        */

        zoom_phone_users:
          zoomPhoneUsers
            .map((user) => {
              const extension =
                getZoomUserExtension(
                  user
                );

              const crmUser =
                extension
                  ? crmByExtension.get(
                      extension
                    )
                  : null;

              return {
                zoom_user_id:
                  user.id ||
                  user.user_id ||
                  null,

                name:
                  user.display_name ||
                  user.name ||
                  [
                    user.first_name,
                    user.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  null,

                email:
                  user.email ||
                  null,

                extension,

                crm_user_id:
                  crmUser?.id ||
                  null,

                crm_user_name:
                  crmUser?.name ||
                  null,

                crm_user_role:
                  crmUser?.role ||
                  null,
              };
            })
            .filter((user) => {
              if (
                accessMode ===
                "all"
              ) {
                return true;
              }

              if (
                accessMode ===
                  "extension" &&
                userExtension
              ) {
                return (
                  normalizeExtension(
                    user.extension
                  ) ===
                  userExtension
                );
              }

              return false;
            }),

        /*
        |--------------------------------------------------------------------------
        | Extensions
        |--------------------------------------------------------------------------
        */

        extensions,

        extension_counts:
          extensionCounts,

        /*
        |--------------------------------------------------------------------------
        | Calls
        |--------------------------------------------------------------------------
        */

        calls:
          enrichedCalls,

        total_records:
          enrichedCalls.length,

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        page_size:
          pageSize,

        pages_fetched:
          pageNumber,

        /*
        |--------------------------------------------------------------------------
        | Date Filter
        |--------------------------------------------------------------------------
        */

        from:
          from || null,

        to:
          to || null,

        /*
        |--------------------------------------------------------------------------
        | Metadata
        |--------------------------------------------------------------------------
        */

        fetched_at:
          new Date().toISOString(),

        next_page_token:
          null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",
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
