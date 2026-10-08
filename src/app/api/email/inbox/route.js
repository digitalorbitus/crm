import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

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
          message: "Email credentials are required.",
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
      const messages = [];

      for await (const message of client.fetch(
        "1:*",
        {
          envelope: true,
          flags: true,
          internalDate: true,
          source: true,
        },
        {
          reverse: true,
          uid: false,
        }
      )) {
        const parsed = await simpleParser(message.source);

        messages.push({
          id: message.uid,
          subject:
            parsed.subject ||
            message.envelope?.subject ||
            "(No subject)",

          from:
            parsed.from?.text ||
            message.envelope?.from?.[0]?.address ||
            "",

          fromName:
            message.envelope?.from?.[0]?.name ||
            "",

          to: parsed.to?.text || "",

          date: message.internalDate
            ? new Date(message.internalDate).toISOString()
            : null,

          text: parsed.text || "",

          html: parsed.html || null,

          seen: message.flags?.has("\\Seen") || false,

          attachments: (parsed.attachments || []).map((file) => ({
            filename: file.filename,
            contentType: file.contentType,
            size: file.size,
          })),
        });

        if (messages.length >= 100) {
          break;
        }
      }

      return NextResponse.json({
        success: true,
        emails: messages,
      });
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error("INBOX ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load inbox.",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.logout();
      } catch {}
    }
  }
}