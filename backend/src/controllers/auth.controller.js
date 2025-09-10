const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const mailService = require('../services/mailService');

const { getAccessToken, getRefreshToken } = require('../utils/auth.js');

class AuthController {
    async signup(req, res) {
        try {
            const { firstName, lastName, username, email, password } = req.body;
            if (!firstName || !lastName || !username || !email || !password) {
                return res
                    .status(400)
                    .json({ message: 'All fields are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters long',
                });
            }

            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res
                    .status(400)
                    .json({ message: 'Username already exists' });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'Email already exists' });
            }

            const avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                avatar,
            });
            // provide token
            const refreshToken = getRefreshToken(newUser);
            const accessToken = getAccessToken(newUser);

            newUser.refreshToken = refreshToken;

            await newUser.save();

            res.cookie('refresh-token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            });

            return res.status(201).json({
                message: 'User registered successfully',
                user: newUser,
                accessToken,
            });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log(email, password);
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ message: 'email and password are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: 'Password must be at least 6 characters long',
                });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ message: 'Email or password is incorrect' });
            }

            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Email or password is incorrect' });
            }

            // provide token
            const refreshToken = getRefreshToken(user);
            const accessToken = getAccessToken(user);

            user.refreshToken = refreshToken;

            await user.save();

            res.cookie('refresh-token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            });

            return res.status(200).json({
                message: 'Login successful',
                user,
                accessToken,
            });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async logout(req, res) {
        try {
            // User đã được xác thực từ middleware
            const user = req.user;

            // Clear refresh token from database
            user.refreshToken = null;
            await user.save();

            // Clear cookie
            res.clearCookie('refresh-token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0,
            });

            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async refreshToken(req, res) {
        try {
            const user = req.user;

            // Tạo access token mới
            const accessToken = getAccessToken(user);

            // Trả về access token qua JSON (không set cookie)
            return res.status(200).json({
                accessToken,
                message: 'Token refreshed successfully',
            });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res
                    .status(400)
                    .json({ message: 'Old and new passwords are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'New password must be at least 6 characters long',
                });
            }

            const user = req.user;
            // Kiểm tra mật khẩu cũ
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({ message: 'Old password is incorrect' });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();

            return res
                .status(200)
                .json({ message: 'Password reset successful' });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate reset token and save it to the user
            const randomText = Math.random().toString(36).substring(2, 15);
            const resetToken = await crypto
                .createHash('sha256')
                .update(randomText)
                .digest('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
            await user.save();
            // Send reset password email
            await mailService.sendResetPasswordEmail(
                email,
                resetToken,
                user.firstName
            );

            return res.status(200).json({
                message: 'Reset password email sent successfully',
            });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res
                    .status(400)
                    .json({ message: 'Token and new password are required' });
            }

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                return res
                    .status(400)
                    .json({ message: 'Invalid or expired reset token' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'New password must be at least 6 characters long',
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'New password must be at least 6 characters long',
                });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.resetPasswordToken = null; // Clear reset token
            user.resetPasswordExpires = null; // Clear expiration

            await user.save();

            // Send confirmation email
            await mailService.sendPasswordResetConfirmation(
                user.email,
                user.firstName
            );

            return res.status(200).json({
                message: 'Password reset successful',
            });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getMe(req, res) {
        try {
            const user = req.user; // User đã được xác thực từ middleware
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                message: 'User retrieved successfully',
                user,
            });
        } catch (error) {
            console.error('error:' + error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new AuthController();
