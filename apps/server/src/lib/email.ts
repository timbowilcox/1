import { environment } from "../config/environment.js";

type EmailMessage = { to: string; subject: string; html: string; text: string };

function template(heading: string, body: string, cta: string, link: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
    <h1 style="font-size:22px;color:#1a1a1a;">${heading}</h1>
    <p style="color:#4b5563;line-height:1.6;">${body}</p>
    <a href="${link}" style="display:inline-block;margin-top:16px;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;">${cta}</a>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;word-break:break-all;">Or paste this link into your browser:<br>${link}</p>
  </div>`;
}

class EmailService {
  async send(msg: EmailMessage): Promise<void> {
    // Dev / unconfigured: log instead of sending (so verify/reset links are
    // visible in the server console).
    if (!environment.RESEND_API_KEY) {
      console.log(
        `\n[email:dev] To: ${msg.to}\nSubject: ${msg.subject}\n${msg.text}\n`,
      );
      return;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${environment.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: environment.EMAIL_FROM,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        }),
      });
      if (!res.ok) {
        console.error("Email send failed:", res.status);
      }
    } catch (err) {
      console.error("Email send error:", err);
    }
  }

  async sendVerification(to: string, link: string): Promise<void> {
    await this.send({
      to,
      subject: "Verify your RealStyler email",
      text: `Welcome to RealStyler! Verify your email address: ${link}`,
      html: template(
        "Verify your email",
        "Confirm your email address to finish setting up your RealStyler account.",
        "Verify email",
        link,
      ),
    });
  }

  async sendPasswordReset(to: string, link: string): Promise<void> {
    await this.send({
      to,
      subject: "Reset your RealStyler password",
      text: `Reset your password: ${link} (expires in 1 hour). If you didn't request this, ignore this email.`,
      html: template(
        "Reset your password",
        "Click below to choose a new password. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
        "Reset password",
        link,
      ),
    });
  }
}

export const emailService = new EmailService();
