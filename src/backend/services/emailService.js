// require('dotenv').config();
// const nodemailer = require('nodemailer');
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();
// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // user: "teegelaakshaya@gmail.com",
    // pass: "ipfi ynny epsl lpoq", // Use App Password (not regular password)
    user: process.env.Email,
    pass: process.env.Email_Password, // Use App Password (not regular password)
  },
});

const sendEmail = async (to, subject, content) => {
  try {
    await transporter.sendMail({
      from: `Scorpion HR <${process.env.Email}>`,
      to,
      subject,
      text: content,
      // html: `<p>${content.replace(/\n/g, '<br>')}</p>`, // Optional HTML version
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const sendCredentialsEmail = async (email, name, password) => {
  const subject = 'Your Scorpion Account Credentials';
  
  const content = `
    Hello ${name},
    
    Your account has been created. Below are your login credentials:
    
    Email: ${email}
    Password: ${password}
    
   
    
    Best regards,
    Scorpion HR Team
  `;
  
  return sendEmail(email, subject, content);
};

export const sendUpdateCredentialsEmail = async (email, name, password) => {
    const subject = 'Your scorpion Account Credentials';
    
    const content = `
      Hello ${name},
      
      Your account has been Updated. Below are your login credentials:
      
      Email: ${email}
      Password: ${password}
      
      
      
      Best regards,
      Scorpion HR Team
    `;
    
    return sendEmail(email, subject, content);
  };


  export const sendOtpEmail = async (email, otp) => {
    const subject = 'Your Otp details';
    
    const content = `
      Hello user,
      
      Here is your otp :-
      
      ${otp}
      
      
      
      Best regards,
      Scorpion HR Team
    `;
    
    return sendEmail(email, subject, content);
  };
  export const sendPasswordResetMail = async (email, password) => {
    const subject = 'Your password changed successfully';
    
    const content = `
      Hello user,
      
      Here is your updated password :-
      
      ${password}
      
      
      
      Best regards,
      Scorpion HR Team
    `;
    
    return sendEmail(email, subject, content);
  };
// module.exports = {
//   sendEmail,
//   sendCredentialsEmail
// };

export default {sendCredentialsEmail,sendUpdateCredentialsEmail,sendOtpEmail}