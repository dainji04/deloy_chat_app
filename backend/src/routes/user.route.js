const express = require('express');
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const {
    handleMulterError,
    uploadAvatar,
} = require('../middlewares/upload.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
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
 *         bio:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, offline, away]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         bio:
 *           type: string
 *         status:
 *           type: string
 *           enum: [online, offline, away]
 */

/**
 * @swagger
 * /api/users/upload-avatar:
 *   post:
 *     summary: Upload avatar cho user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload avatar thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *       400:
 *         description: Lỗi upload file
 *       401:
 *         description: Chưa xác thực
 */
router.post(
    '/upload-avatar',
    verifyAccessToken,
    uploadAvatar,
    handleMulterError,
    userController.uploadAvatar
);

/**
 * @swagger
 * /api/users/update-profile:
 *   put:
 *     summary: Cập nhật thông tin profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Cập nhật profile thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Lỗi validation
 */
router.put('/update-profile', verifyAccessToken, userController.updateProfile);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Lấy thông tin profile của user hiện tại
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Chưa xác thực
 */
router.get('/profile', verifyAccessToken, userController.getProfile);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Tìm kiếm user theo email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email cần tìm kiếm
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng kết quả tối đa
 *     responses:
 *       200:
 *         description: Danh sách user tìm được
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Thiếu email parameter
 */
router.get('/search', verifyAccessToken, userController.searchUserByEmail);

router.put(
    '/status/enter-conversation',
    verifyAccessToken,
    userController.enterGroup
); // Change user status in group

router.put(
    '/status/leave-conversation',
    verifyAccessToken,
    userController.leaveGroup
); // Change user status in group

router.put(
    '/save-fcm-token',
    verifyAccessToken,
    userController.saveFcmToken
); // Change user status in group

module.exports = router;
