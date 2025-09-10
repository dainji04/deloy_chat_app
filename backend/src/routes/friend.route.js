const express = require('express');
const router = express.Router();

const { verifyAccessToken } = require('../middlewares/auth.middleware.js');

const friendController = require('../controllers/friend.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Friend:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, offline, away]
 *         friendsSince:
 *           type: string
 *           format: date-time
 *     FriendRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         from:
 *           $ref: '#/components/schemas/Friend'
 *         to:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AddFriendRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *     AcceptFriendRequest:
 *       type: object
 *       required:
 *         - requestId
 *       properties:
 *         requestId:
 *           type: string
 *     UnfriendRequest:
 *       type: object
 *       required:
 *         - friendId
 *       properties:
 *         friendId:
 *           type: string
 */

/**
 * @swagger
 * /api/friends/list:
 *   get:
 *     summary: Lấy danh sách bạn bè
 *     tags: [Friends]
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
 *         description: Số lượng per page
 *     responses:
 *       200:
 *         description: Danh sách bạn bè
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 friends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Friend'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 */
router.get('/list', verifyAccessToken, friendController.getListFriends);

/**
 * @swagger
 * /api/friends/add:
 *   post:
 *     summary: Gửi lời mời kết bạn
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFriendRequest'
 *     responses:
 *       200:
 *         description: Gửi lời mời kết bạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Lỗi validation hoặc đã là bạn bè
 *       404:
 *         description: Không tìm thấy user
 */
router.post('/add', verifyAccessToken, friendController.addFriend);

/**
 * @swagger
 * /api/friends/accept-request:
 *   post:
 *     summary: Chấp nhận lời mời kết bạn
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcceptFriendRequest'
 *     responses:
 *       200:
 *         description: Chấp nhận kết bạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy lời mời
 *       400:
 *         description: Lời mời đã được xử lý
 */
router.post('/accept', verifyAccessToken, friendController.acceptFriendRequest);

/**
 * @swagger
 * /api/friends/list-requests:
 *   get:
 *     summary: Lấy danh sách lời mời kết bạn
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *           default: received
 *         description: Loại lời mời (đã gửi hoặc nhận được)
 *     responses:
 *       200:
 *         description: Danh sách lời mời kết bạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendRequest'
 */
router.get('/requests', verifyAccessToken, friendController.getFriendRequests);

/**
 * @swagger
 * /api/friends/unfriend:
 *   delete:
 *     summary: Hủy kết bạn
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnfriendRequest'
 *     responses:
 *       200:
 *         description: Hủy kết bạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy bạn bè
 */
router.delete('/unfriend', verifyAccessToken, friendController.unFriend);

module.exports = router;
