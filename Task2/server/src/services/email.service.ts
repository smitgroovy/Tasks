import nodemailer from 'nodemailer';
import { env } from '../config/env';

function getTransporter() {
  if (!env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email] SMTP not configured. Reset token for ${to}: ${resetToken}`);
    return;
  }

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Reset your Flowdo password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#171717;color:#fff;text-decoration:none;border-radius:8px;">
        Reset password
      </a>
      <p style="margin-top:24px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[email] SMTP not configured. Welcome email for ${name} (${to}) skipped.`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Welcome to Flowdo',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>You're all set to start managing your tasks. Get started by adding your first task.</p>
      <a href="${env.CLIENT_URL}" style="display:inline-block;padding:12px 24px;background:#171717;color:#fff;text-decoration:none;border-radius:8px;">
        Go to Flowdo
      </a>
    `,
  });
}
