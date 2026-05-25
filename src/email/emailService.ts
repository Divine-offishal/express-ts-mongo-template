import nodemailer, { Transporter } from "nodemailer";
import CONFIG from "../config/config";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { format } from "date-fns";

const createTransporter = async (): Promise<Transporter> => {
  return nodemailer.createTransport({
    host: CONFIG.ENV.EMAIL_HOST,
    port: CONFIG.ENV.EMAIL_PORT_OUT,
    secure: true,
    auth: {
      user: CONFIG.ENV.EMAIL_USER,
      pass: CONFIG.ENV.EMAIL_PASSWORD,
    },
  } as nodemailer.TransportOptions);
};

let transporter: Transporter;

(async () => {
  transporter = await createTransporter();

  transporter.verify((err, success) => {
    if (err) {
      console.log("Mailing failed to verify.", err);
    } else {
      console.log("Mailing verified", success);
    }
  });
})();

const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `${CONFIG.ENV.APP_NAME} ${CONFIG.ENV.FROM_EMAIL}`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export const sendSignUpEmail = async (email: string, code: string) => {
  const subject = "Verify Your Email";
  const filePath = path.resolve(__dirname, "../templates/signup-email-welcome-and-verify.html");
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const html = template({ email, code });
  await sendEmail(email, subject, html);
};

export const sendResendVerifyCode = async (email: string, code: string) => {
  const subject = "Resend Verification Code";
  const filePath = path.resolve(__dirname, "../templates/resend-password-reset-code.html");
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const html = template({ email, code });
  await sendEmail(email, subject, html);
};

export const sendResetPasswordEmail = async (email: string, code: string) => {
  const subject = "Reset Your Password";
  const filePath = path.resolve(__dirname, "../templates/reset-password-email-notification.html");
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const html = template({ email, code });
  await sendEmail(email, subject, html);
};

export const passwordResetSuccessEmail = async (email: string) => {
  const subject = "Password Reset Successful";
  const filePath = path.resolve(__dirname, "../templates/password-reset-success-email.html");
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const html = template({ email });
  await sendEmail(email, subject, html);
};

export const changePasswordSuccessEmail = async (email: string) => {
  const subject = "Password Changed Successfully";
  const filePath = path.resolve(
    __dirname,
    "../templates/change-password-notification-user-initiated.html"
  );
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const html = template({ email });
  await sendEmail(email, subject, html);
};

export const sendAddAdminEmail = async (email: string, password: string) => {
  const subject = "You've Been Added as an Admin";
  const filePath = path.resolve(__dirname, "../templates/add-admin.html");
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const html = template({ email, password, year: new Date().getFullYear() });
  await sendEmail(email, subject, html);
};

interface NewLoginNotificationParams {
  location: string;
  updatedAt: string;
  deviceType: string;
}

export const newLoginNotification = async (
  email: string,
  user: NewLoginNotificationParams
): Promise<void> => {
  const subject = "Login Alert: New Device Detected";
  const filePath = path.resolve(__dirname, "../templates/new-login-alert.html");
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  const formattedDate = format(new Date(user.updatedAt), "MMM dd, yyyy 'at' h:mm a");
  const html = template({
    email,
    location: user.location,
    updatedAt: formattedDate,
    deviceType: user.deviceType,
  });
  await sendEmail(email, subject, html);
};
