const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

exports.sendResetEmail = async (to, link) => {
  await transporter.sendMail({
    from: config.emailUser,
    to,
    subject: 'Password Reset Request',
    html: `
      <p>You requested to reset your password.</p>
      <p><a href="${link}">Click here to reset</a></p>
    `,
  });
};
