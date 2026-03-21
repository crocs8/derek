const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);
transport.verify(function (error, success) {
  if (error) {
    console.log("Verify error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
