


// import { NextResponse } from "next/server";
// import { zoomConfig } from "../../../lib/db";

// export async function GET() {
//   const { clientId } = zoomConfig;

//   const redirectUri = "http://localhost:3000/api/zoom/callback";

//   console.log("ZOOM CLIENT ID:", clientId);
//   console.log("ZOOM REDIRECT URI:", redirectUri);

//   if (!clientId) {
//     return NextResponse.json(
//       { error: "Zoom client ID missing" },
//       { status: 500 }
//     );
//   }

//   const zoomAuthUrl = new URL("https://us06web.zoom.us/myhome");

//   zoomAuthUrl.searchParams.set("response_type", "code");
//   zoomAuthUrl.searchParams.set("client_id", clientId);
//   zoomAuthUrl.searchParams.set("redirect_uri", redirectUri);

//   console.log("ZOOM AUTH URL:", zoomAuthUrl.toString());

//   return NextResponse.redirect(zoomAuthUrl.toString());
// }



import { NextResponse } from "next/server";
import { zoomConfig } from "../../../lib/db";

export async function GET(request) {
  try {
    // ==========================================
    // 1. ZOOM CONFIG
    // ==========================================

    const {
      clientId,
      clientSecret,
      redirectUri,
    } = zoomConfig;

    console.log("====================================");
    console.log("        ZOOM AUTH DEBUG");
    console.log("====================================");

    console.log("CLIENT ID:", clientId);
    console.log(
      "CLIENT SECRET EXISTS:",
      !!clientSecret
    );
    console.log("REDIRECT URI:", redirectUri);

    console.log(
      "REQUEST URL:",
      request.url
    );

    console.log("====================================");

    // ==========================================
    // 2. CHECK CONFIGURATION
    // ==========================================

    if (!clientId) {
      console.error(
        "ZOOM CLIENT ID MISSING"
      );

      return NextResponse.json(
        {
          success: false,
          error: "Zoom client ID missing",
        },
        { status: 500 }
      );
    }

    if (!clientSecret) {
      console.error(
        "ZOOM CLIENT SECRET MISSING"
      );

      return NextResponse.json(
        {
          success: false,
          error: "Zoom client secret missing",
        },
        { status: 500 }
      );
    }

    if (!redirectUri) {
      console.error(
        "ZOOM REDIRECT URI MISSING"
      );

      return NextResponse.json(
        {
          success: false,
          error: "Zoom redirect URI missing",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 3. CREATE ZOOM AUTH URL
    // ==========================================

    const zoomAuthUrl = new URL(
      "https://zoom.us/oauth/authorize"
    );

    zoomAuthUrl.searchParams.set(
      "response_type",
      "code"
    );

    zoomAuthUrl.searchParams.set(
      "client_id",
      clientId
    );

    zoomAuthUrl.searchParams.set(
      "redirect_uri",
      redirectUri
    );

    // ==========================================
    // 4. DEBUG AUTH URL
    // ==========================================

    console.log(
      "========== ZOOM AUTH URL =========="
    );

    console.log(
      "RESPONSE TYPE:",
      "code"
    );

    console.log(
      "CLIENT ID USED:",
      clientId
    );

    console.log(
      "REDIRECT URI USED:",
      redirectUri
    );

    console.log(
      "AUTH URL:",
      zoomAuthUrl.toString()
    );

    console.log(
      "===================================="
    );

    // ==========================================
    // 5. REDIRECT TO ZOOM
    // ==========================================

    return NextResponse.redirect(
      zoomAuthUrl.toString()
    );

  } catch (error) {

    console.error(
      "===================================="
    );

    console.error(
      "ZOOM AUTH SERVER ERROR:"
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
          "Zoom authentication error",
      },
      { status: 500 }
    );
  }
}

