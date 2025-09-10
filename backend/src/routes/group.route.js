const express = require('express');
const router = express.Router();

const groupController = require('../controllers/group.controller');

const { verifyAccessToken } = require('../middlewares/auth.middleware.js');

const {
    handleMulterError,
    uploadSingle,
} = require('../middlewares/upload.middleware.js');

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         avatar:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [member, moderator, admin]
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateGroupRequest:
 *       type: object
 *       required:
 *         - name
 *         - members
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             type: string
 *     AddMembersRequest:
 *       type: object
 *       required:
 *         - groupId
 *         - userIds
 *       properties:
 *         groupId:
 *           type: string
 *         userIds:
 *           type: array
 *           items:
 *             type: string
 *     RemoveMembersRequest:
 *       type: object
 *       required:
 *         - groupId
 *         - userIds
 *       properties:
 *         groupId:
 *           type: string
 *         userIds:
 *           type: array
 *           items:
 *             type: string
 *     UpdateGroupInfoRequest:
 *       type: object
 *       required:
 *         - groupId
 *       properties:
 *         groupId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/groups/create:
 *   post:
 *     summary: Tạo nhóm chat mới
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       201:
 *         description: Tạo nhóm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 group:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Lỗi validation
 *       401:
 *         description: Chưa xác thực
 */
router.post('/create', verifyAccessToken, groupController.createGroup); // Create a new group chat

/**
 * @swagger
 * /api/groups/add-members:
 *   put:
 *     summary: Thêm thành viên vào nhóm
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMembersRequest'
 *     responses:
 *       200:
 *         description: Thêm thành viên thành công
 *       400:
 *         description: Lỗi validation
 *       403:
 *         description: Không có quyền
 */
router.put('/add-members', verifyAccessToken, groupController.addMembers); // Add members to a group

/**
 * @swagger
 * /api/groups/remove-members:
 *   put:
 *     summary: Xóa thành viên khỏi nhóm
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveMembersRequest'
 *     responses:
 *       200:
 *         description: Xóa thành viên thành công
 *       400:
 *         description: Lỗi validation
 *       403:
 *         description: Không có quyền
 */
router.put('/remove-members', verifyAccessToken, groupController.removeMembers); // Remove members from a group

/**
 * @swagger
 * /api/groups/upload-avatar:
 *   put:
 *     summary: Upload avatar cho nhóm
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload avatar thành công
 *       400:
 *         description: Lỗi upload file
 *       403:
 *         description: Không có quyền
 */
router.put(
    '/upload-avatar',
    verifyAccessToken,
    uploadSingle,
    handleMulterError,
    groupController.uploadAvatar
); // Upload group avatar

/**
 * @swagger
 * /api/groups/update-info:
 *   put:
 *     summary: Cập nhật thông tin nhóm
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroupInfoRequest'
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 *       400:
 *         description: Lỗi validation
 *       403:
 *         description: Không có quyền
 */
router.put('/update-info', verifyAccessToken, groupController.updateInfo); // Update group info

/**
 * @swagger
 * /api/groups/delete:
 *   delete:
 *     summary: Xóa nhóm
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xóa nhóm thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy nhóm
 */
router.delete('/delete', verifyAccessToken, groupController.deleteGroup); // Delete a group

/**
 * @swagger
 * /api/groups/{groupId}/promote/{userId}:
 *   put:
 *     summary: Thăng cấp thành viên lên moderator
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nhóm
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần thăng cấp
 *     responses:
 *       200:
 *         description: Thăng cấp thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy nhóm hoặc user
 */
router.put(
    '/promote',
    verifyAccessToken,
    groupController.promoteToModerator
); // Promote user to moderator

/**
 * @swagger
 * /api/groups/{groupId}/demote/{userId}:
 *   put:
 *     summary: Hạ cấp moderator xuống thành viên
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nhóm
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần hạ cấp
 *     responses:
 *       200:
 *         description: Hạ cấp thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy nhóm hoặc user
 */
router.put(
    '/demote',
    verifyAccessToken,
    groupController.demoteToUser
); // Demote moderator to user

/**
 * @swagger
 * /api/groups/{groupId}/leave:
 *   put:
 *     summary: Rời khỏi nhóm
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của nhóm cần rời
 *     responses:
 *       200:
 *         description: Rời nhóm thành công
 *       404:
 *         description: Không tìm thấy nhóm
 *       400:
 *         description: Không thể rời nhóm (có thể là admin duy nhất)
 */
router.put('/leave', verifyAccessToken, groupController.leaveGroup); // Leave a group

module.exports = router;
