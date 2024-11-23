import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Email } from 'src/domain/entities/email.entity';
@Injectable()
export class EmailSenderService {
  private transporter: {
    sendMail: (arg0: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }) => any;
  };

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(email: Email): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.recipient,
      subject: email.subject,
      html: `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          h1 {
            font-size: 24px;
            color: #4CAF50;
            text-align: center;
            margin-bottom: 20px;
          }

          .otp-code {
            display: block;
            font-size: 28px;
            font-weight: bold;
            color: #333;
            text-align: center;
            background-color: #f1f1f1;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }

          .message {
            font-size: 16px;
            color: #333;
            line-height: 1.5;
            margin-bottom: 20px;
          }

          .footer {
            font-size: 12px;
            color: #777;
            text-align: center;
            margin-top: 30px;
          }

          .footer a {
            color: #4CAF50;
            text-decoration: none;
          }

          .cta {
            text-align: center;
            margin-top: 20px;
          }

          .cta a {
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${email.subject === 'Your OTP Code from Hobbe EVMS' ? 'Your OTP Code from Hobbe EVMS' : 'Your Generated User Account Password from Hobbe EVMS'}</h1>
          
          <p class="message">Dear User,</p>
          
          <p class="message">
            ${
              email.subject === 'Your OTP Code from Hobbe EVMS'
                ? 'Thank you for using Hobbe EVMS. We have received a request to verify your action. Please use the OTP below to complete the process.'
                : 'Your new account password has been generated successfully. Please use the password below to access your account. We recommend that you change this password as soon as possible for your security.'
            }
          </p>
          
          ${
            email.subject === 'Your OTP Code from Hobbe EVMS'
              ? `<div class="otp-code">${email.body}</div>`
              : `<div class="message">${email.body}</div>`
          }  <!-- Display generated password -->

          <p class="message">
            ${
              email.subject === 'Your OTP Code from Hobbe EVMS'
                ? 'This code will expire in 10 minutes. If you did not request this OTP, please ignore this email or contact support immediately.'
                : 'For your security, please change the generated password once you log in. If you did not request this generated password, please ignore this email or contact support immediately.'
            }
          </p>

          <div class="cta">
            <a href="https://hobbe.com/support" target="_blank">Contact Support</a>
          </div>

          <div class="footer">
            <p>Best regards,<br>The Hobbe EVMS Team</p>
            <p><a href="https://hobbe.com">hobbe.com</a> | <a href="mailto:support@hobbe.com">support@hobbe.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`);
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send email');
    }
  }
}
