// import { NextResponse } from "next/server";
// import { zoomConfig } from "../../../lib/db";

// export async function GET() {
//   const { clientId, redirectUri } = zoomConfig;

//   if (!clientId || !redirectUri) {
//     return NextResponse.json(
//       {
//         error: "Zoom configuration missing",
//         clientId: !!clientId,
//         redirectUri: !!redirectUri,
//       },
//       { status: 500 }
//     );
//   }

//   const zoomAuthUrl = new URL(
//     "https://zoom.us/oauth/authorize"
//   );

//   zoomAuthUrl.searchParams.set("response_type", "code");
//   zoomAuthUrl.searchParams.set("client_id", clientId);
//   zoomAuthUrl.searchParams.set("redirect_uri", redirectUri);

//   return NextResponse.redirect(zoomAuthUrl.toString());
// }




import { NextResponse } from "next/server";
import { zoomConfig } from "../../../lib/db";

export async function GET() {
  const { clientId } = zoomConfig;

  const redirectUri = "http://localhost:3000/api/zoom/callback";

  console.log("ZOOM CLIENT ID:", clientId);
  console.log("ZOOM REDIRECT URI:", redirectUri);

  if (!clientId) {
    return NextResponse.json(
      { error: "Zoom client ID missing" },
      { status: 500 }
    );
  }

  const zoomAuthUrl = new URL("https://zoom.us/oauth/authorize");

  zoomAuthUrl.searchParams.set("response_type", "code");
  zoomAuthUrl.searchParams.set("client_id", clientId);
  zoomAuthUrl.searchParams.set("redirect_uri", redirectUri);

  console.log("ZOOM AUTH URL:", zoomAuthUrl.toString());

  return NextResponse.redirect(zoomAuthUrl.toString());
}