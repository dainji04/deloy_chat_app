const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        type: {
            type: String,
            enum: ['private', 'group'],
            required: true,
        },
        name: {
            type: String,
            required: function () {
                return this.type === 'group';
            },
            maxlength: [50, 'Conversation name cannot exceed 50 characters'],
        },
        description: {
            type: String,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        avatar: {
            type: String,
            default: null,
        },
        background: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Background',
            default: null,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: function () {
                return this.type === 'group';
            },
        },
        moderators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
        settings: {
            muteNotifications: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                    },
                    mutedUntil: {
                        type: Date,
                    },
                },
            ],
            allowInvites: {
                type: Boolean,
                default: true,
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
