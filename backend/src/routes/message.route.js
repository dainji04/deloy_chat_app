const express = require('express');
const router = express.Router();

const messageController = require('../controllers/message.controller.js');

const { verifyAccessToken } = require('../middlewares/auth.middleware.js');
const {
    uploadSingle,
    handleMulterError,
} = require('../middlewares/upload.middleware.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, image, file, audio, video]
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             avatar:
 *               type: string
 *         conversation:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               filename:
 *                 type: string
 *               fileSize:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [private, group]
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   avatar:
 *                     type: string
 *               role:
 *                 type: string
 *                 enum: [member, admin, moderator]
 *         lastMessage:
 *           $ref: '#/components/schemas/Message'
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateConversationRequest:
 *       type: object
 *       required:
 *         - participantId
 *       properties:
 *         participantId:
 *           type: string
 *           description: ID của user để tạo conversation private
 *         type:
 *           type: string
 *           enum: [private, group]
 *           default: private
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - conversationId
 *         - content
 *       properties:
 *         conversationId:
 *           type: string
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [text, image, file, audio, video]
 *           default: text
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Lấy tất cả conversations của user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng conversations per page
 *     responses:
 *       200:
 *         description: Danh sách conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *                 pagination:
 *                   type: object
 */
router.get('/', verifyAccessToken, messageController.getAllConversations);

/**
 * @swagger
 * /api/messages/conversations/{conversationId}:
 *   get:
 *     summary: Lấy chi tiết conversation và messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của conversation
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang messages
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Số lượng messages per page
 *     responses:
 *       200:
 *         description: Chi tiết conversation và messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 *       404:
 *         description: Không tìm thấy conversation
 *       403:
 *         description: Không có quyền truy cập conversation
 */
router.get(
    '/:conversationId',
    verifyAccessToken,
    messageController.getConversationById
);

router.get(
    '/:conversationId/media',
    verifyAccessToken,
    messageController.getMediaInConversationById
);

/**
 * @swagger
 * /api/messages/conversations:
 *   post:
 *     summary: Tạo hoặc lấy conversation private với user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *     responses:
 *       200:
 *         description: Conversation đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *       201:
 *         description: Tạo conversation mới thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *       404:
 *         description: Không tìm thấy user
 */
router.post(
    '/conversations',
    verifyAccessToken,
    messageController.getOrCreateConversation
);

/**
 * @swagger
 * /api/messages/upload:
 *   post:
 *     summary: Upload file/media để gửi trong message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload file thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 fileUrl:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 fileSize:
 *                   type: number
 *       400:
 *         description: Lỗi upload file
 */
router.post(
    '/upload',
    verifyAccessToken,
    uploadSingle,
    handleMulterError,
    messageController.uploadMedia
);

router.delete('/delete', verifyAccessToken, messageController.deleteMedia);

/**
 * @swagger
 * /api/messages/send-message:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Gửi tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Lỗi validation
 *       404:
 *         description: Không tìm thấy conversation
 *       403:
 *         description: Không có quyền gửi tin nhắn
 */
router.post('/send-message', verifyAccessToken, messageController.sendMessage);

module.exports = router;
