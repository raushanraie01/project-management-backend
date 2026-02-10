import nodemailer from "nodemailer";

console.log(process.env.ETHEREAL_SMTP_HOST, process.env.ETHEREAL_SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.ETHEREAL_SMTP_HOST,
  port: Number(process.env.ETHEREAL_SMTP_PORT),
  secure: process.env.ETHEREAL_SMTP_SECURITY === "true",
  auth: {
    user: process.env.ETHEREAL_SMTP_USER,
    pass: process.env.ETHEREAL_SMTP_PASS,
  },
});
export { transporter };
