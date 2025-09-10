const Background = require('../models/background.model.js');
const Conversation = require('../models/conversation.model.js');

class BackgroundController {
    // GET /api/backgrounds - Lấy danh sách backgrounds
    async getBackgrounds(req, res) {
        try {
            const backgrounds = await Background.find({ isActive: true })
                .select('_id name url color category order')
                .sort({ order: 1 });

            res.json({
                success: true,
                data: backgrounds
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // PUT /api/conversations/:conversationId/background - Thay đổi background
    async updateBackground(req, res) {
        try {
            const { conversationId, backgroundId } = req.body;
            const userId = req.user.id; // Từ authentication middleware

            // Kiểm tra user có quyền thay đổi conversation không
            const conversation = await Conversation.findById(conversationId);
            if (!conversation.participants.includes(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền thay đổi background'
                });
            }

            // Kiểm tra background có tồn tại không
            const background = await Background.findById(backgroundId);
            if (!background || !background.isActive) {
                return res.status(404).json({
                    success: false,
                    message: 'Background không tồn tại'
                });
            }

            // Cập nhật background
            await Conversation.findByIdAndUpdate(conversationId, {
                background: backgroundId,
                updatedAt: new Date()
            });

            res.json({
                success: true,
                message: 'Đã thay đổi background thành công',
                data: { backgroundId }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // CREATE /api/backgrounds - Thêm background mới (chỉ admin)
    async createBackground(req, res) {
        try {
            const { name, url, color } = req.body;
            // Giả sử có middleware kiểm tra admin
            const newBackground = new Background({
                name,
                url,
                color,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await newBackground.save();

            res.status(201).json({
                success: true,
                message: 'Đã thêm background mới',
                data: newBackground
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BackgroundController();
