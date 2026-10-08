import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";

export const runtime = "nodejs";

function createImapClient(email, password) {
  return new ImapFlow({
    host:
      process.env.HOSTINGER_IMAP_HOST ||
      "imap.hostinger.com",

    port: Number(
      process.env.HOSTINGER_IMAP_PORT || 993
    ),

    secure: true,

    auth: {
      user: email,
      pass: password,
    },

    logger: false,
  });
}

function safeFilename(filename) {
  return String(filename || "attachment")
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   FIND ATTACHMENTS FROM IMAP BODY STRUCTURE
========================================================= */

function findAttachments(node) {
  const attachments = [];

  if (!node) {
    return attachments;
  }

  const type = String(node.type || "").toLowerCase();

  const disposition = String(
    node.disposition || ""
  ).toLowerCase();

  const topType = type.split("/")[0];

  const filename =
    node.dispositionParameters?.filename ||
    node.parameters?.name ||
    null;

  const isAttachment =
    disposition === "attachment" ||
    (filename &&
      topType !== "text" &&
      topType !== "multipart");

  if (isAttachment) {
    attachments.push({
      part: node.part || "1",
      filename: filename || "attachment",
      contentType:
        node.type ||
        "application/octet-stream",
      size: node.size || 0,
    });
  }

  if (Array.isArray(node.childNodes)) {
    for (const child of node.childNodes) {
      attachments.push(
        ...findAttachments(child)
      );
    }
  }

  return attachments;
}

/* =========================================================
   DOWNLOAD ATTACHMENT
========================================================= */

export async function POST(request) {
  let client;
  let lock;

  try {
    const body = await request.json();

    const email = String(
      body.email || ""
    ).trim();

    const password = String(
      body.password || ""
    );

    const uid = Number(body.uid);

    const attachmentIndex = Number(
      body.attachmentIndex
    );

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email credentials are required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(uid) ||
      uid <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email UID.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(
        attachmentIndex
      ) ||
      attachmentIndex < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid attachment index.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------------------
       CONNECT
    ----------------------------------------------------- */

    client = createImapClient(
      email,
      password
    );

    await client.connect();

    /* -----------------------------------------------------
       OPEN INBOX
    ----------------------------------------------------- */

    lock =
      await client.getMailboxLock(
        "INBOX"
      );

    /* -----------------------------------------------------
       FETCH EMAIL BY UID
       
       IMPORTANT:
       uid:true means the supplied UID is an
       IMAP UID, not sequence number.
    ----------------------------------------------------- */

    const message =
      await client.fetchOne(
        uid,
        {
          uid: true,
          bodyStructure: true,
        },
        {
          uid: true,
        }
      );

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email not found.",
        },
        { status: 404 }
      );
    }

    /* -----------------------------------------------------
       FIND ATTACHMENTS
    ----------------------------------------------------- */

    const attachments =
      findAttachments(
        message.bodyStructure
      );

    console.log(
      "EMAIL UID:",
      uid
    );

    console.log(
      "ATTACHMENTS:",
      attachments
    );

    if (
      !attachments.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No attachments found in this email.",
        },
        { status: 404 }
      );
    }

    const attachment =
      attachments[
        attachmentIndex
      ];

    if (!attachment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attachment not found.",
        },
        { status: 404 }
      );
    }

    /* -----------------------------------------------------
       DOWNLOAD ATTACHMENT DIRECTLY FROM IMAP
    ----------------------------------------------------- */

    const download =
      await client.download(
        uid,
        attachment.part,
        {
          uid: true,
        }
      );

    if (
      !download ||
      !download.content
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to download attachment content.",
        },
        { status: 500 }
      );
    }

    /* -----------------------------------------------------
       CONVERT STREAM TO BUFFER
    ----------------------------------------------------- */

    const chunks = [];

    for await (const chunk of download.content) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      );
    }

    const buffer =
      Buffer.concat(chunks);

    if (!buffer.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Attachment is empty.",
        },
        { status: 500 }
      );
    }

    /* -----------------------------------------------------
       FILE INFORMATION
    ----------------------------------------------------- */

    const filename =
      safeFilename(
        download.meta?.filename ||
          attachment.filename ||
          `attachment-${attachmentIndex + 1}`
      );

    const contentType =
      download.meta?.contentType ||
      attachment.contentType ||
      "application/octet-stream";

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return new NextResponse(
      new Uint8Array(buffer),
      {
        status: 200,

        headers: {
          "Content-Type": contentType,

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Content-Length":
            String(buffer.length),

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "EMAIL ATTACHMENT ERROR"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to download attachment.",
      },
      { status: 500 }
    );
  } finally {
    /* -----------------------------------------------------
       RELEASE MAILBOX LOCK
    ----------------------------------------------------- */

    try {
      if (lock) {
        lock.release();
      }
    } catch {}

    /* -----------------------------------------------------
       LOGOUT
    ----------------------------------------------------- */

    try {
      if (client) {
        await client.logout();
      }
    } catch {}
  }
}