const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [20, 'Username cannot exceed 20 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            validate: {
                validator: function (email) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                        email
                    );
                },
                message: 'Please enter a valid email',
            },
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId; // Password only required if not using Google OAuth
            },
            minlength: [6, 'Password must be at least 6 characters'],
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple null values
        },
        provider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
        refreshToken: {
            type: String,
            default: null,
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        avatar: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio cannot exceed 200 characters'],
            default: '',
        },
        dateOfBirth: {
            type: Date,
        },
        phone: {
            type: String,
            validate: {
                validator: function (phone) {
                    return !phone || /^\+?[\d\s-()]+$/.test(phone);
                },
                message: 'Please enter a valid phone number',
            },
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        isInConversation: { // user is active in any group.
            type: Boolean,
            default: false,
        },
        FCMtoken: { // token firebase to send notifications
            type: String,
            default: null,
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        friends: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    unique: true,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        friendRequests: {
            sent: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                    sentAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            received: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                    receivedAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
        blockedUsers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                blockedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        settings: {
            theme: {
                type: String,
                enum: ['light', 'dark'],
                default: 'light',
            },
            notifications: {
                messages: {
                    type: Boolean,
                    default: true,
                },
                friendRequests: {
                    type: Boolean,
                    default: true,
                },
            },
            privacy: {
                showOnlineStatus: {
                    type: Boolean,
                    default: true,
                },
                showLastSeen: {
                    type: Boolean,
                    default: true,
                },
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for search functionality
userSchema.index({ email: 'text' });

// Transform JSON output
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);
