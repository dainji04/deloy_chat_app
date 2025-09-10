const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            text: {
                type: String,
                maxlength: [1000, 'Message cannot exceed 1000 characters'],
            },
            type: {
                type: String,
                enum: ['text', 'image', 'video', 'audio'],
                default: 'text',
            },
            media: {
                url: String,
                publicId: String, // For Cloudinary
                fileName: String,
                fileSize: Number,
                mimeType: String,
                duration: Number, // For videos/voice messages
                thumbnail: String, // For videos
            },
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent',
        },
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        reactions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                emoji: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        edited: {
            isEdited: {
                type: Boolean,
                default: false,
            },
            editedAt: Date,
            originalContent: String,
        },
        deleted: {
            isDeleted: {
                type: Boolean,
                default: false,
            },
            deletedAt: Date,
            deletedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
        forwarded: {
            isForwarded: {
                type: Boolean,
                default: false,
            },
            originalMessage: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message',
            },
            forwardedAt: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'content.type': 1 });

module.exports = mongoose.model('Message', messageSchema);
