const Message = require('../models/message.model.js');
const Conversation = require('../models/conversation.model.js');
const User = require('../models/user.model.js');
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require('../utils/cloudinary.js');

class MessageController {
    async getAllConversations(req, res) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const conversations = await Conversation.find({
                participants: req.user._id,
                isActive: true,
            })
                .populate('participants', 'username avatar isOnline lastSeen')
                .populate('lastMessage', 'content sender createdAt')
                .populate('background', 'url color')
                .sort({ lastActivity: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            if (!conversations || conversations.length === 0) {
                return res
                    .status(404)
                    .json({ message: 'No conversations found' });
            }

            const formatConversation = conversations.map((conversation) => {
                if (conversation.type === 'private') {
                    const otherParticipant = conversation.participants.find(
                        (participant) =>
                            participant._id.toString() !==
                            req.user._id.toString()
                    );
                    return {
                        ...conversation,
                        name: otherParticipant
                            ? otherParticipant.username
                            : 'Unknown',
                        avatar: otherParticipant
                            ? otherParticipant.avatar
                            : null,
                        isOnline: otherParticipant
                            ? otherParticipant.isOnline
                            : false,
                        lastSeen: otherParticipant
                            ? otherParticipant.lastSeen
                            : null,
                    };
                }
                return conversation;
            });

            res.status(200).json({
                data: formatConversation,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: conversations.length === parseInt(limit),
                },
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getConversationById(req, res) {
        try {
            const { conversationId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const messages = await Message.find({
                conversation: conversationId,
            })
                .populate('sender', 'username avatar')
                .populate('replyTo', 'content')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            if (!messages || messages.length === 0) {
                return res.status(404).json({ message: 'No messages found' });
            }

            res.status(200).json({
                data: messages.reverse(),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: messages.length === parseInt(limit),
                },
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getMediaInConversationById(req, res) {
        try {
            const { conversationId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const media = await Message.find({
                conversation: conversationId,
                'content.media.url': { $exists: true, $ne: null },
            })
                .populate('sender', 'username avatar')
                .populate('content', 'media')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            if (!media || media.length === 0) {
                return res.status(404).json({ message: 'No media found' });
            }

            res.status(200).json({
                data: media,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: media.length === parseInt(limit),
                },
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getOrCreateConversation(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }

            const user = await User.findById(userId).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (userId === req.user._id.toString()) {
                return res.status(400).json({
                    message: 'Cannot create conversation with yourself',
                });
            }

            let conversation = await Conversation.findOne({
                participants: { $all: [req.user._id, userId] },
                type: 'private',
            })
                .populate('participants', 'name avatar isOnline lastSeen')
                .populate('lastMessage');

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [req.user._id, userId],
                    type: 'private',
                    lastMessage: null,
                });

                conversation = await conversation.populate(
                    'participants',
                    'username firstName lastName avatar isOnline lastSeen'
                );
            }

            // format the private conversation
            const otherParticipant = conversation.participants.find(
                (participant) =>
                    participant._id.toString() !== req.user._id.toString()
            );

            const formattedConversation = {
                ...conversation.toObject(),
                name: otherParticipant ? otherParticipant.name : 'Unknown',
                avatar: otherParticipant ? otherParticipant.avatar : null,
                isOnline: otherParticipant ? otherParticipant.isOnline : false,
                lastSeen: otherParticipant ? otherParticipant.lastSeen : null,
            };

            res.status(201).json({
                message: 'Conversation created successfully',
                data: {
                    conversation: formattedConversation,
                },
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async uploadMedia(req, res) {
        try {
            const { conversationId = 'undefined' } = req.body;
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            let fileType = 'file';
            if (req.file.mimetype.startsWith('image/')) {
                fileType = 'image';
            } else if (req.file.mimetype.startsWith('video/')) {
                fileType = 'video';
            } else if (req.file.mimetype.startsWith('audio/')) {
                fileType = 'audio';
            }
            const upload = await uploadToCloudinary(
                req.file,
                `chat-app/message-medias/${conversationId}/${fileType}s`
            );

            if (!upload) {
                return res.status(500).json({ message: 'Upload failed' });
            }

            let thumbnail = null;
            if (fileType === 'video') {
                if (fileType === 'video') {
                    try {
                        thumbnail = upload.secure_url.replace(
                            /\.(mp4|avi|mov)$/,
                            '.jpg'
                        );
                    } catch (error) {
                        console.error('Thumbnail generation error:', error);
                    }
                }
            }

            const mediaData = {
                url: upload.secure_url,
                publicId: upload.public_id,
                type: req.file.mimetype.split('/')[0], // e.g., 'image', 'video'
                size: req.file.size,
            };

            if (thumbnail) {
                mediaData.thumbnail = thumbnail;
            }

            if (upload.duration) {
                mediaData.duration = upload.duration;
            }

            res.status(200).json({
                message: 'Media uploaded successfully',
                data: {
                    media: mediaData,
                },
            });

            // Save media data to the database if needed
        } catch (error) {
            console.error('Error uploading media:', error);
            return res.status(500).json({ message: error.message });
        }
    }

    async deleteMedia(req, res) {
        try {
            const { publicId } = req.body;
            await deleteFromCloudinary(publicId);

            return res.status(200).json({
                success: true,
                message: 'delete successfully from cloudinary',
            });
        } catch (error) {
            console.error('Error uploading media:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async sendMessage(req, res) {
        try {
            const {
                conversationId,
                content = '',
                type = 'text',
                replyTo,
                media,
            } = req.body;

            if (!conversationId) {
                return res.status(400).json({
                    message: 'Conversation ID is required',
                });
            }

            if (!content || !content.trim().length === 0) {
                return res.status(400).json({
                    message: 'Message content cannot be empty',
                });
            }

            if (content.length > 2000) {
                return res.status(400).json({
                    message:
                        'Message content exceeds maximum length of 2000 characters',
                });
            }

            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: req.user._id,
                isActive: true,
            });

            if (!conversation) {
                return res
                    .status(404)
                    .json({ message: 'Conversation not found' });
            }

            // Validate reply message if provided
            let replyToMessage = null;
            if (replyTo) {
                replyToMessage = await Message.findOne({
                    _id: replyTo,
                    conversation: conversationId,
                    'deleted.isDeleted': false,
                });

                if (!replyToMessage) {
                    return res.status(400).json({
                        success: false,
                        message: 'Reply message not found',
                    });
                }
            }

            // Create message
            const messageData = {
                conversation: conversationId,
                sender: req.user._id,
                content: {
                    text: content.trim(),
                    type,
                },
            };

            if (media && type !== 'text') {
                messageData.content.media = media;
            }

            if (replyTo) {
                messageData.replyTo = replyTo;
            }

            const message = await Message.create(messageData);

            // Update conversation's last message and activity
            conversation.lastMessage = message._id;
            conversation.lastActivity = new Date();
            await conversation.save();

            // Populate message for response
            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username firstName lastName avatar')
                .populate('replyTo', 'content sender')
                .populate('reactions.user', 'username firstName lastName');

            res.status(201).json({
                message: 'Message sent successfully',
                data: { message: populatedMessage },
            });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new MessageController();
