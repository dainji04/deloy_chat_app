const cloudinary = require('../utils/cloudinary.js');
const User = require('../models/user.model.js');

class UserController {
    async uploadAvatar(req, res) {
        try {
            const user = req.user; // middleware should set req.user

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            if (user.avatar) {
                if (user.avatar.includes('cloudinary')) {
                    const publicId = user.avatar.split('/').pop().split('.')[0];
                    await cloudinary.deleteFromCloudinary(
                        'chat-app/avatars/' + publicId
                    );
                }
            }

            const uploadResult = await cloudinary.uploadToCloudinary(
                req.file,
                'chat-app/avatars'
            );

            if (!uploadResult || !uploadResult.secure_url) {
                return res
                    .status(500)
                    .json({ message: 'Failed to upload avatar' });
            }

            user.avatar = uploadResult.secure_url;

            await user.save();

            return res.status(200).json({
                message: 'Avatar uploaded successfully',
                avatarUrl: user.avatar,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const user = req.user; // middleware should set req.user
            const { firstName, lastName, username, bio, phone, dateOfBirth } =
                req.body;

            if (
                !firstName &&
                !lastName &&
                !username &&
                !bio &&
                !phone &&
                !dateOfBirth
            ) {
                return res.status(400).json({ message: 'No fields to update' });
            }

            const updated = {};

            if (firstName) updated.firstName = firstName.trim();
            if (lastName) updated.lastName = lastName.trim();
            if (username) updated.username = username.trim();
            if (bio) updated.bio = bio.trim();
            if (phone) updated.phone = phone;
            if (dateOfBirth) {
                const dateDiff = new Date() - new Date(dateOfBirth);
                if (dateDiff < 0) {
                    return res.status(400).json({
                        message: 'Date of birth cannot be in the future',
                    });
                }
                if (dateDiff < 568025136000) {
                    // 18 years in milliseconds
                    return res.status(400).json({
                        message: 'You must be at least 18 years old',
                    });
                }
                updated.dateOfBirth = new Date(dateOfBirth);
            }

            const newUser = await User.findByIdAndUpdate(
                user._id,
                { $set: updated },
                { new: true, runValidators: true }
            );

            if (!newUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                message: 'Profile updated successfully',
                user: newUser,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = req.user; // middleware should set req.user

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                message: 'Profile retrieved successfully',
                user,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }

    async searchUserByEmail(req, res) {
        try {
            const email = req.query.email;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const user = await User.findOne({ email })
                .populate('friends', 'firstName lastName username avatar')
                .populate(
                    'friendRequests.sent',
                    'firstName lastName username avatar'
                );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                message: 'User retrieved successfully',
                user,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }

    // api/user/status/enter-conversation [PUT]
    async enterGroup(req, res) {
        try {
            const user = req.user; // middleware should set req.user

            user.isInConversation = true;
            await user.save();

            return res.status(200).json({
                message: 'User entered the conversation',
                user,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }

    // api/user/status/leave-conversation [PUT]
    async leaveGroup(req, res) {
        try {
            const user = req.user; // middleware should set req.user

            user.isInConversation = false;
            await user.save();

            return res.status(200).json({
                message: 'User left the conversation',
                user,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }

    // api/user/save-fcm-token [PUT]
    async saveFcmToken(req, res) {
        try {
            const user = req.user;

            user.FCMtoken = req.body.FCMtoken;

            await user.save();

            return res.status(200).json({
                message: 'FCM token saved successfully',
                user,
            });
        } catch (error) {
            return res
                .status(500)
                .json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = new UserController();
