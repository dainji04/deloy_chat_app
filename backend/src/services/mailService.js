const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendResetPasswordEmail(email, resetToken, firstName) {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p>Hi ${firstName || 'there'},</p>
                        
                        <p>You recently requested to reset your password. Click the button below to reset it:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                                style="background-color: #007bff; color: white; padding: 12px 30px; 
                                    text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
                        
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        
                        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <div style="text-align: center; color: #666; font-size: 12px;">
                        <p>This is an automated email. Please do not reply to this email.</p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Reset password email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send reset password email');
        }
    }

    async sendPasswordResetConfirmation(email, firstName) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Successful',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #28a745;">Password Reset Successful</h2>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p>Hi ${firstName || 'there'},</p>
                        
                        <p>Your password has been successfully reset. You can now log in with your new password.</p>
                        
                        <p>If you didn't make this change, please contact our support team immediately.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.CLIENT_URL}/login" 
                                style="background-color: #28a745; color: white; padding: 12px 30px; 
                                        text-decoration: none; border-radius: 5px; display: inline-block;">
                                Login Now
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; color: #666; font-size: 12px;">
                        <p>This is an automated email. Please do not reply to this email.</p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Password reset confirmation email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            return false; // Don't throw error for confirmation email
        }
    }
}

module.exports = new EmailService();
