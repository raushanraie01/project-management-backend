import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: process.env.APP_NAME || "Task Manager",
    link: process.env.FRONTEND_URL || "http://localhost:3000",
  },
});

const emailVerificationMailgenContent = function (username, verificationUrl) {
  return {
    body: {
      name: username,
      intro: "Welcome to Our App! We're very excited to have you on board.",
      action: {
        instructions: "To verify your email , please click here:",
        button: {
          color: "#17c060", // Optional action button color
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgotPasswordMailgenContent = function (username, passwordResetUrl) {
  return {
    body: {
      name: username,
      intro: "We got a request to reset the password of your account",
      action: {
        instructions: "To reset-password , please click on button or link :",
        button: {
          color: "#c13316", // Optional action button color
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  mailGenerator,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};
