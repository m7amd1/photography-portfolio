"use server";

import { Resend } from "resend";

export async function sendEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "", // add email and apikey from account who created api key 
      subject: "New Contact Form Submission",
      html: "<p>You have a new contact form submission:</p>",
    });
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    return { success: false, error: errorMessage };
  }
}
