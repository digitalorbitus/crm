import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";

export const runtime = "nodejs";

export async function POST(request) {
  let client;

  try {
    const body = await request.json();

    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address and password are required.",
        },
        { status: 400 }
      );
    }

    client = new ImapFlow({
      host: process.env.HOSTINGER_IMAP_HOST || "imap.hostinger.com",
      port: Number(process.env.HOSTINGER_IMAP_PORT || 993),
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
      logger: false,
    });

    await client.connect();

    const lock = await client.getMailboxLock("INBOX");

    try {
      const status = await client.status("INBOX", {
        messages: true,
        unseen: true,
      });

      return NextResponse.json({
        success: true,
        message: "Login successful.",
        email,
        mailbox: {
          messages: status.messages || 0,
          unseen: status.unseen || 0,
        },
      });
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error("EMAIL LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Login failed. Please check your Hostinger email address and password.",
      },
      { status: 401 }
    );
  } finally {
    if (client) {
      try {
        await client.logout();
      } catch {}
    }
  }
}