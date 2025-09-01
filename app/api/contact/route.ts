import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email, message, sessionType } = await req.json();

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: "mohammadsaer7@gmail.com",
    subject: "New Message from Contact Form",
    text: message,
    html: `<p>You have a new message from your contact form:</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Session Type:</strong> ${sessionType}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to send message." },
      { status: 500 }
    );
  }
}
