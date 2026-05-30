export default async function handler(req, res) {
  return res.status(200).json({
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    EMAIL_FROM: !!process.env.EMAIL_FROM,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    environment: process.env.VERCEL_ENV || "unknown"
  });
}
