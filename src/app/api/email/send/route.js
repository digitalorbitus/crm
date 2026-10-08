import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email credentials are required.",
        },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipient email is required.",
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.HOSTINGER_SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.HOSTINGER_SMTP_PORT || 465),
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: email,
      to,
      subject: subject || "(No subject)",
      text: message,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
    });
  } catch (error) {
    console.error("SEND EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send email.",
      },
      { status: 500 }
    );
  }
}