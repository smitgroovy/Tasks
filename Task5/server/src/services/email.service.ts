import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT || '587';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@studenthub.app';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

function getTransporter() {
  if (!SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const transporter = getTransporter();
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}`;

  if (!transporter) {
    console.log(`[StudentHub] SMTP not configured. Reset token for ${to}: ${resetToken}`);
    console.log(`[StudentHub] Reset URL: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Reset your StudentHub password',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="background:linear-gradient(135deg,#1e1b4b,#2e1065);padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;">StudentHub</h1>
        </div>
        <div style="padding:32px 24px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px;">Reset your password</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Click the button below to reset your password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
            Reset password
          </a>
          <p style="color:#94a3b8;font-size:13px;margin-top:32px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
