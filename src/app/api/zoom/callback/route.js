import { NextResponse } from "next/server";
import { zoomConfig } from "../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  const { clientId, clientSecret, redirectUri } = zoomConfig;

  // Zoom token endpoint par Authorization code exchange karein
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  // data me access_token aur refresh_token mil jayega
  // Yahan token ko Database / Session me save karein
  console.log("Zoom Access Token:", data.access_token);

  // User ko dashboard ya home page par redirect kar dein
  return NextResponse.redirect(
  "https://jadescorp.com/dashboard?zoom=connected"
);
}