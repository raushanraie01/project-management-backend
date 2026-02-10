import { mailGenerator } from "./mailgen.js";
import { transporter } from "./email.js";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const message = {
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(message);

    console.log("✅ Email sent");
    console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Email service failed silently:", error);
  }
};

export default sendMail;
