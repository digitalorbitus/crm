




// import { NextResponse } from "next/server";
// import { zoomConfig } from "../../../lib/db";

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const code = searchParams.get("code");
//   const errorParam = searchParams.get("error");

//   // 1. Agar Zoom se koi error aaye
//   if (errorParam) {
//     return NextResponse.json(
//       { error: `Zoom auth rejected: ${errorParam}` },
//       { status: 400 }
//     );
//   }

//   // 2. Authorization code check
//   if (!code) {
//     return NextResponse.json(
//       { error: "Authorization code missing" },
//       { status: 400 }
//     );
//   }

//   const { clientId, clientSecret } = zoomConfig;
  
//   // NOTE: Ye URL exact `/api/zoom/auth` route waali honi chahiye
//   const redirectUri = "http://localhost:3000/api/zoom/callback";

//   if (!clientId || !clientSecret) {
//     return NextResponse.json(
//       { error: "Zoom credentials missing in server config" },
//       { status: 500 }
//     );
//   }

//   // 3. Basic Auth Header for Zoom Token Exchange
//   const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

//   try {
//     const response = await fetch("https://zoom.us/oauth/token", {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${credentials}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams({
//         grant_type: "authorization_code",
//         code: code,
//         redirect_uri: redirectUri,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Zoom Token Error Payload:", data);
//       return NextResponse.json(
//         { error: "Failed to exchange code for token", details: data },
//         { status: response.status }
//       );
//     }

//     console.log("Zoom Access Token:", data.access_token);
//     console.log("Zoom Refresh Token:", data.refresh_token);

//     // TODO: Yahan DB mein tokens ko save karein

//     // 4. Successful Login Redirect
//     return NextResponse.redirect(new URL("/dashboard?zoom=connected", request.url));
    
//   } catch (err) {
//     console.error("Zoom Callback Internal Error:", err);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }





// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { query, zoomConfig } from "../../../lib/db";

// export async function GET(request) {
//   try {
//     // ==========================================
//     // 1. GET ZOOM CALLBACK PARAMETERS
//     // ==========================================

//     const { searchParams } = new URL(request.url);

//     const code = searchParams.get("code");
//     const errorParam = searchParams.get("error");

//     if (errorParam) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Zoom authorization rejected: ${errorParam}`,
//         },
//         { status: 400 }
//       );
//     }

//     if (!code) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Zoom authorization code missing",
//         },
//         { status: 400 }
//       );
//     }

//     // ==========================================
//     // 2. GET CRM USER FROM JWT COOKIE
//     // ==========================================

//     const token = request.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM login required before connecting Zoom",
//         },
//         { status: 401 }
//       );
//     }

//     let decoded;

//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (jwtError) {
//       console.error("JWT VERIFY ERROR:", jwtError);

//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid or expired CRM login session",
//         },
//         { status: 401 }
//       );
//     }

//     const crmUserId = decoded.id;

//     if (!crmUserId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM user ID not found in login session",
//         },
//         { status: 401 }
//       );
//     }

//     console.log("CRM USER ID:", crmUserId);

//     // ==========================================
//     // 3. CHECK CRM USER EXISTS
//     // ==========================================

//     const users = await query(
//       `
//       SELECT id, name, email, role
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//       `,
//       [crmUserId]
//     );

//     if (users.length === 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "CRM user not found",
//         },
//         { status: 404 }
//       );
//     }

//     const crmUser = users[0];

//     // ==========================================
//     // 4. ZOOM CONFIG
//     // ==========================================

//     const {
//       clientId,
//       clientSecret,
//       redirectUri,
//     } = zoomConfig;

//     if (!clientId || !clientSecret || !redirectUri) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Zoom configuration is incomplete",
//         },
//         { status: 500 }
//       );
//     }

//     // ==========================================
//     // 5. EXCHANGE CODE FOR ZOOM TOKEN
//     // ==========================================

//     const credentials = Buffer
//       .from(`${clientId}:${clientSecret}`)
//       .toString("base64");

//     const tokenResponse = await fetch(
//       "https://zoom.us/oauth/token",
//       {
//         method: "POST",

//         headers: {
//           Authorization: `Basic ${credentials}`,
//           "Content-Type":
//             "application/x-www-form-urlencoded",
//         },

//         body: new URLSearchParams({
//           grant_type: "authorization_code",
//           code,
//           redirect_uri: redirectUri,
//         }),
//       }
//     );

//     const tokenData = await tokenResponse.json();

//     if (!tokenResponse.ok) {
//       console.error(
//         "ZOOM TOKEN ERROR:",
//         tokenData
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error: "Failed to exchange Zoom authorization code",
//           details: tokenData,
//         },
//         { status: tokenResponse.status }
//       );
//     }

//     const accessToken = tokenData.access_token;
//     const refreshToken = tokenData.refresh_token;

//     if (!accessToken) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Zoom access token was not returned",
//         },
//         { status: 500 }
//       );
//     }

//     // ==========================================
//     // 6. GET ZOOM USER INFORMATION
//     // ==========================================

//     const zoomUserResponse = await fetch(
//       "https://api.zoom.us/v2/users/me",
//       {
//         method: "GET",

//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     const zoomUser = await zoomUserResponse.json();

//     if (!zoomUserResponse.ok) {
//       console.error(
//         "ZOOM USER API ERROR:",
//         zoomUser
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error: "Could not retrieve Zoom account information",
//           details: zoomUser,
//         },
//         { status: zoomUserResponse.status }
//       );
//     }

//     console.log(
//       "ZOOM USER:",
//       zoomUser.id,
//       zoomUser.email
//     );

//     // ==========================================
//     // 7. CALCULATE TOKEN EXPIRY
//     // ==========================================

//     let expiresAt = null;

//     if (tokenData.expires_in) {
//       expiresAt = new Date(
//         Date.now() +
//           Number(tokenData.expires_in) * 1000
//       );
//     }

//     // ==========================================
//     // 8. SAVE / UPDATE ZOOM CONNECTION
//     // ==========================================

//     await query(
//       `
//       INSERT INTO zoom_connections
//       (
//         user_id,
//         zoom_account_id,
//         zoom_user_id,
//         zoom_email,
//         access_token,
//         refresh_token,
//         expires_at
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?)

//       ON DUPLICATE KEY UPDATE
//         user_id = VALUES(user_id),
//         zoom_account_id = VALUES(zoom_account_id),
//         zoom_email = VALUES(zoom_email),
//         access_token = VALUES(access_token),
//         refresh_token = VALUES(refresh_token),
//         expires_at = VALUES(expires_at)
//       `,
//       [
//         crmUserId,
//         zoomUser.account_id || null,
//         zoomUser.id || null,
//         zoomUser.email || null,
//         accessToken,
//         refreshToken || null,
//         expiresAt,
//       ]
//     );

//     console.log(
//       `Zoom connected successfully for CRM user ${crmUserId}`
//     );

//     // ==========================================
//     // 9. REDIRECT TO DASHBOARD
//     // ==========================================

//     const dashboardUrl = new URL(
//       "/dashboard",
//       request.url
//     );

//     dashboardUrl.searchParams.set(
//       "zoom",
//       "connected"
//     );

//     return NextResponse.redirect(
//       dashboardUrl
//     );

//   } catch (error) {
//     console.error(
//       "ZOOM CALLBACK ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           error.message ||
//           "Zoom callback server error",
//       },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query, zoomConfig } from "../../../lib/db";

export async function GET(request) {
  try {
    // ==========================================
    // 1. GET ZOOM CALLBACK PARAMETERS
    // ==========================================

    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    console.log("====================================");
    console.log("       ZOOM CALLBACK DEBUG");
    console.log("====================================");

    console.log("CODE RECEIVED:", !!code);
    console.log("CODE LENGTH:", code ? code.length : 0);
    console.log("ZOOM ERROR PARAM:", errorParam);

    // Security ke liye actual authorization code print nahi karna
    console.log("REQUEST URL:", request.url.replace(code || "", "[CODE]"));

    console.log("====================================");

    // ==========================================
    // 2. ZOOM AUTHORIZATION ERROR
    // ==========================================

    if (errorParam) {
      return NextResponse.json(
        {
          success: false,
          error: `Zoom authorization rejected: ${errorParam}`,
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. CHECK AUTHORIZATION CODE
    // ==========================================

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: "Zoom authorization code missing",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. GET CRM USER FROM JWT COOKIE
    // ==========================================

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM login required before connecting Zoom",
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
    } catch (jwtError) {
      console.error("JWT VERIFY ERROR:", jwtError);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired CRM login session",
        },
        { status: 401 }
      );
    }

    const crmUserId = decoded.id;

    if (!crmUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM user ID not found in login session",
        },
        { status: 401 }
      );
    }

    console.log("CRM USER ID:", crmUserId);

    // ==========================================
    // 5. CHECK CRM USER
    // ==========================================

    const users = await query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [crmUserId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "CRM user not found",
        },
        { status: 404 }
      );
    }

    const crmUser = users[0];

    console.log(
      "CRM USER:",
      crmUser.id,
      crmUser.name,
      crmUser.email
    );

    // ==========================================
    // 6. ZOOM CONFIGURATION
    // ==========================================

    const {
      clientId,
      clientSecret,
      redirectUri,
    } = zoomConfig;

    console.log("========== ZOOM CONFIG ==========");
    console.log("CLIENT ID:", clientId);
    console.log(
      "CLIENT SECRET EXISTS:",
      !!clientSecret
    );
    console.log("REDIRECT URI:", redirectUri);
    console.log("================================");

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        {
          success: false,
          error: "Zoom configuration is incomplete",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 7. EXCHANGE AUTHORIZATION CODE
    // ==========================================

    const credentials = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    console.log("========== TOKEN EXCHANGE ==========");
    console.log(
      "GRANT TYPE:",
      "authorization_code"
    );
    console.log("CODE EXISTS:", !!code);
    console.log(
      "CODE LENGTH:",
      code ? code.length : 0
    );
    console.log(
      "TOKEN REDIRECT URI:",
      redirectUri
    );
    console.log("CLIENT ID USED:", clientId);
    console.log("====================================");

    const tokenResponse = await fetch(
      "https://zoom.us/oauth/token",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }).toString(),
      }
    );

    const tokenData =
      await tokenResponse.json();

    console.log(
      "========== ZOOM TOKEN RESPONSE =========="
    );

    console.log(
      "STATUS:",
      tokenResponse.status
    );

    console.log(
      "OK:",
      tokenResponse.ok
    );

    // ==========================================
    // 8. TOKEN ERROR
    // ==========================================

    if (!tokenResponse.ok) {
      console.error(
        "ZOOM TOKEN ERROR:",
        tokenData
      );

      console.log(
        "========================================="
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to exchange Zoom authorization code",

          details: tokenData,
        },
        {
          status: tokenResponse.status,
        }
      );
    }

    // ==========================================
    // 9. TOKEN SUCCESS
    // ==========================================

    console.log(
      "ZOOM TOKEN SUCCESS"
    );

    console.log(
      "ACCESS TOKEN RECEIVED:",
      !!tokenData.access_token
    );

    console.log(
      "REFRESH TOKEN RECEIVED:",
      !!tokenData.refresh_token
    );

    console.log(
      "========================================="
    );

    const accessToken =
      tokenData.access_token;

    const refreshToken =
      tokenData.refresh_token || null;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Zoom access token was not returned",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 10. GET ZOOM USER INFORMATION
    // ==========================================

    console.log(
      "========== GET ZOOM USER =========="
    );

    const zoomUserResponse =
      await fetch(
        "https://api.zoom.us/v2/users/me",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

    const zoomUser =
      await zoomUserResponse.json();

    console.log(
      "ZOOM USER STATUS:",
      zoomUserResponse.status
    );

    if (!zoomUserResponse.ok) {
      console.error(
        "ZOOM USER API ERROR:",
        zoomUser
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Could not retrieve Zoom account information",

          details: zoomUser,
        },
        {
          status:
            zoomUserResponse.status,
        }
      );
    }

    console.log(
      "ZOOM USER:",
      zoomUser.id,
      zoomUser.email
    );

    console.log(
      "===================================="
    );

    // ==========================================
    // 11. CALCULATE TOKEN EXPIRY
    // ==========================================

    let expiresAt = null;

    if (tokenData.expires_in) {
      expiresAt = new Date(
        Date.now() +
          Number(tokenData.expires_in) *
            1000
      );
    }

    // ==========================================
    // 12. SAVE ZOOM CONNECTION
    // ==========================================

    console.log(
      "========== SAVING ZOOM CONNECTION =========="
    );

    await query(
      `
      INSERT INTO zoom_connections
      (
        user_id,
        zoom_account_id,
        zoom_user_id,
        zoom_email,
        access_token,
        refresh_token,
        expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE

        user_id = VALUES(user_id),
        zoom_account_id = VALUES(zoom_account_id),
        zoom_email = VALUES(zoom_email),
        access_token = VALUES(access_token),
        refresh_token = VALUES(refresh_token),
        expires_at = VALUES(expires_at)
      `,
      [
        crmUserId,
        zoomUser.account_id || null,
        zoomUser.id || null,
        zoomUser.email || null,
        accessToken,
        refreshToken,
        expiresAt,
      ]
    );

    console.log(
      "ZOOM CONNECTION SAVED"
    );

    // ==========================================
    // 13. SUCCESS
    // ==========================================

    console.log(
      "===================================="
    );

    console.log(
      `Zoom connected successfully for CRM user ${crmUserId}`
    );

    console.log(
      "====================================");

    // ==========================================
    // 14. REDIRECT TO CALLS PAGE
    // ==========================================

    const callsUrl = new URL(
      "/calls",
      request.url
    );

    callsUrl.searchParams.set(
      "zoom",
      "connected"
    );

    return NextResponse.redirect(
      callsUrl
    );

  } catch (error) {
    // ==========================================
    // 15. SERVER ERROR
    // ==========================================

    console.error(
      "===================================="
    );

    console.error(
      "ZOOM CALLBACK SERVER ERROR:"
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
          "Zoom callback server error",
      },
      { status: 500 }
    );
  }
}