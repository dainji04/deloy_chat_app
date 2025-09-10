const userModel = require('../models/user.model');
const Conversation = require('../models/conversation.model.js');
const Message = require('../models/message.model.js');
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require('../utils/cloudinary.js');

class GroupController {
    // /api/groups/create [POST] : create a new group chat
    async createGroup(req, res) {
        try {
            let { name, description, participantIds = [], avatar = null } = req.body;
            const user = req.user;

            if (!name || !description || !participantIds) {
                return res.status(400).json({
                    message:
                        'Name, description, and participantIds are required.',
                });
            }

            // check if the creator is in the participantIds
            if (!participantIds.includes(user._id.toString())) {
                participantIds.push(user._id.toString());
            }

            // 2 participantIds + creator
            if (!Array.isArray(participantIds) || participantIds.length < 3) {
                return res.status(400).json({
                    message: 'A group must have at least three members.',
                });
            }

            const participants = await userModel.find({
                _id: { $in: participantIds },
            });

            if (participants.length !== participantIds.length) {
                return res.status(404).json({
                    message: 'Some participants not found.',
                });
            }

            if(!avatar) {
                avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                )}&background=random&color=fff&size=256`;
            }

            const newGroup = await Conversation.create({
                participants: participants,
                type: 'group',
                name,
                description,
                avatar: avatar,
                admin: user._id,
            });

            const group = await newGroup.populate([
                {
                    path: 'participants',
                    select: 'username avatar lastSeen isOnline',
                },
                { path: 'admin', select: 'username avatar lastSeen isOnline' },
            ]);

            return res.status(201).json({
                message: 'Group created successfully',
                data: {
                    group: group,
                },
            });
        } catch (error) {
            console.error('Error creating group:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/add-members [PUT] : add arrays of user
    async addMembers(req, res) {
        try {
            const user = req.user;

            const { groupId, participantIds = [] } = req.body;

            if (!groupId || !participantIds) {
                return res.status(400).json({
                    message: 'Group ID and participant IDs are required.',
                });
            }

            // check if the group exists
            const group = await Conversation.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            // check if the user is the admin of the group
            if (
                group.admin.toString() !== user._id.toString() &&
                !group.moderators.includes(user._id)
            ) {
                return res.status(403).json({
                    message:
                        'Only the group admin or moderators can add members.',
                });
            }

            if (!Array.isArray(participantIds) || participantIds.length === 0) {
                return res.status(400).json({
                    message: 'Participant IDs must be a non-empty array.',
                });
            }

            // check if the participants exist
            const participants = await userModel.find({
                _id: { $in: participantIds },
            });

            if (participants.length !== participantIds.length) {
                return res.status(404).json({
                    message: 'Some participants not found.',
                });
            }

            // check if the participants are already in the group
            const existingParticipants = group.participants.map((p) =>
                p._id.toString()
            );
            const newParticipants = participants.filter(
                (p) => !existingParticipants.includes(p._id.toString())
            );

            if (newParticipants.length === 0) {
                return res.status(400).json({
                    message: 'All participants are already in the group.',
                });
            }

            group.participants.push(...newParticipants);
            await group.save();

            return res.status(200).json({
                message: 'Members added successfully.',
                data: {
                    group: group,
                },
            });
        } catch (error) {
            console.error('Error adding members to group:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/remove-multi-members [PUT] : remove arrays of users
    async removeMultiMembers(req, res) {
        try {
            const user = req.user;

            const { groupId, removeMemberIds = [] } = req.body;

            if (!groupId || !removeMemberIds) {
                return res.status(400).json({
                    message: 'Group ID and participant IDs are required.',
                });
            }

            if (removeMemberIds.includes(user._id.toString())) {
                return res.status(400).json({
                    message: 'You cannot remove yourself from the group.',
                });
            }

            // check if the group exists
            const group = await Conversation.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            // check if the user is the admin of the group or a moderator
            if (
                group.admin.toString() !== user._id.toString() &&
                !group.moderators.includes(user._id)
            ) {
                return res.status(403).json({
                    message:
                        'Only the group admin or moderators can remove members.',
                });
            }

            if (
                !Array.isArray(removeMemberIds) ||
                removeMemberIds.length === 0
            ) {
                return res.status(400).json({
                    message: 'Participant IDs must be a non-empty array.',
                });
            }

            // check if the removeMembers exist
            const removeMembers = await userModel.find({
                _id: { $in: removeMemberIds },
            });

            if (removeMembers.length !== removeMemberIds.length) {
                return res.status(404).json({
                    message: 'Some removeMembers not found.',
                });
            }

            // check if the removeMembers are not in the group
            const existingRemoveMembers = group.participants.map((p) =>
                p._id.toString()
            );
            const oldRemoveMembers = removeMembers.filter((p) =>
                existingRemoveMembers.includes(p._id.toString())
            );

            if (oldRemoveMembers.length === 0) {
                return res.status(400).json({
                    message: 'All removeMembers are not in the group.',
                });
            }

            group.participants.pull(...oldRemoveMembers);
            if (group.participants.length === 0) {
                await group.deleteOne();
                return res.status(200).json({
                    message: 'Group deleted as it has no members.',
                });
            }
            await group.save();

            return res.status(200).json({
                message: 'Members removed successfully.',
                data: {
                    group: group,
                },
            });
        } catch (error) {
            console.error('Error removing members from group:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/remove-members [PUT] : remove a member
    async removeMembers(req, res) {
        try {
            const user = req.user;

            const { groupId, removeMemberId } = req.body;

            if (!groupId || !removeMemberId) {
                return res.status(400).json({
                    message: 'Group ID and participant ID are required.',
                });
            }

            if (removeMemberId.includes(user._id.toString())) {
                return res.status(400).json({
                    message: 'You cannot remove yourself from the group.',
                });
            }

            // check if the group exists
            const group = await Conversation.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            // check if the user is the admin of the group or a moderator
            if (
                group.admin.toString() !== user._id.toString() &&
                !group.moderators.includes(user._id)
            ) {
                return res.status(403).json({
                    message:
                        'Only the group admin or moderators can remove members.',
                });
            }

            group.participants.pull(removeMemberId);
            if (group.participants.length === 0) {
                await group.deleteOne();
                return res.status(200).json({
                    message: 'Group deleted as it has no members.',
                });
            }
            await group.save();

            return res.status(200).json({
                message: 'Members removed successfully.',
                data: {
                    group: group,
                },
            });
        } catch (error) {
            console.error('Error removing members from group:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/upload [PUT] : upload avatar of group
    async uploadAvatar(req, res) {
        try {
            const { groupId } = req.body;
            const file = req.file;
            console.log(file);

            if (!groupId) {
                return res.status(400).json({
                    message: 'Group ID is required.',
                });
            }

            if (!file) {
                return res.status(400).json({
                    message: 'File is required.',
                });
            }

            const group = await Conversation.findById(groupId);
            if (
                group.avatar &&
                group.avatar !== '' &&
                group.avatar.includes('cloudinary')
            ) {
                const publicId =
                    'chat-app/group_avatars/' +
                    group.avatar.split('/').pop().split('.')[0];
                await deleteFromCloudinary(publicId);
            }

            const upload = await uploadToCloudinary(
                file,
                'chat-app/group_avatars'
            );

            if (!upload) {
                return res.status(500).json({
                    message: 'Failed to upload avatar to cloud storage.',
                });
            }

            group.avatar = upload.secure_url;
            await group.save();

            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            return res.status(200).json({
                message: 'Group avatar uploaded successfully.',
                data: {
                    user: {
                        username: req.user.username,
                    },
                    group: {
                        _id: group._id,
                        name: group.name,
                        avatar: group.avatar,
                    },
                },
            });
        } catch (error) {
            console.error('Error uploading group avatar:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/update-info [PUT] : edit name or description of group
    async updateInfo(req, res) {
        try {
            const user = req.user;
            const { groupId, name, description } = req.body;

            if (!groupId) {
                return res.status(400).json({
                    message: 'Group IDis required.',
                });
            }

            if (!name && !description) {
                return res.status(400).json({
                    message: 'At least one of name or description is required.',
                });
            }

            const group = await Conversation.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            const isAdmin = group.admin.toString() === user._id.toString();
            const isModerator = group.moderators.includes(user._id);
            if (!isAdmin && !isModerator) {
                return res.status(403).json({
                    message:
                        'Only the group admin or moderators can update group info.',
                });
            }

            const updateData = {};
            if (name) updateData.name = name.trim();
            if (description) updateData.description = description.trim();

            const updatedGroup = await Conversation.findByIdAndUpdate(
                groupId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedGroup) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            return res.status(200).json({
                message: 'Group info updated successfully',
                data: {
                    group: updatedGroup,
                },
            });
        } catch (error) {
            console.error('Error updating group info:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/delete [DELETE] : delete a group
    async deleteGroup(req, res) {
        try {
            const user = req.user;
            const { groupId } = req.body;

            const group = await Conversation.findById(groupId);

            if (!group) {
                return res.status(404).json({
                    message: 'Group not found.',
                });
            }

            const isAdmin = group.admin.toString() === user._id.toString();
            if (!isAdmin) {
                return res.status(403).json({
                    message: 'Only the group admin can delete the group.',
                });
            }

            // delete all media in cloudinary
            const messages = await Message.find({ conversation: groupId });
            messages.forEach(async (message) => {
                if (message.content.type === 'image' || message.content.type === 'video') {
                    await deleteFromCloudinary(message.content.media.publicId);
                }
            });

            await Message.deleteMany({ conversation: groupId });

            await group.deleteOne();
            return res.status(200).json({
                message: 'Group deleted successfully.',
            });
        } catch (error) {
            return res.status(500).json({
                message: 'internal server',
                error: error.message,
            });
        }
    }

    // /api/groups/promote [PUT] : user to moderator
    async promoteToModerator(req, res) {
        try {
            const user = req.user;
            const { groupId, userId } = req.body;
            const group = await Conversation.findById(groupId);

            if (!group || group.type !== 'group') {
                return res.status(404).json({ message: 'Group not found.' });
            }

            const isAdmin = user._id.toString() === group.admin.toString();
            if (!isAdmin) {
                return res.status(403).json({
                    message:
                        'Only the group admin can promote users to moderator.',
                });
            }

            const userToPromote = group.participants.find(
                (p) => p._id.toString() === userId
            );

            if (!userToPromote) {
                return res
                    .status(404)
                    .json({ message: 'User not found in group.' });
            }

            if (group.moderators.includes(userId)) {
                return res.status(400).json({
                    message: 'User is already a moderator.',
                });
            }

            group.moderators.push(userId);
            await group.save();

            return res.status(200).json({
                message: 'User promoted to moderator successfully.',
                data: {
                    group: {
                        _id: group._id,
                        name: group.name,
                        moderators: group.moderators,
                    },
                },
            });
        } catch (error) {
            console.error('Error promoting user to moderator:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/demote [PUT] : moderator to user
    async demoteToUser(req, res) {
        try {
            const user = req.user;
            const { groupId, userId } = req.body;

            const group = await Conversation.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            const isAdmin = user._id.toString() === group.admin.toString();
            if (!isAdmin) {
                return res.status(403).json({
                    message:
                        'Only the group admin can demote users to moderator.',
                });
            }

            const userToDemote = group.participants.find(
                (p) => p._id.toString() === userId
            );

            if (!userToDemote) {
                return res
                    .status(404)
                    .json({ message: 'User not found in group.' });
            }

            if (!group.moderators.includes(userId)) {
                return res.status(400).json({
                    message: 'User is not a moderator.',
                });
            }

            group.moderators.pull(userId);
            await group.save();

            return res.status(200).json({
                message: 'User demoted to regular member successfully.',
                data: {
                    group: {
                        _id: group._id,
                        name: group.name,
                        moderators: group.moderators,
                    },
                },
            });
        } catch (error) {
            console.error('Error demoting user to regular member:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // /api/groups/:groupId/leave [PUT] : leave a group
    async leaveGroup(req, res) {
        try {
            const user = req.user;
            const { groupId } = req.body;

            const group = await Conversation.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: 'Group not found.' });
            }

            const isMember = group.participants.includes(user._id);
            if (!isMember) {
                return res.status(403).json({
                    message: 'You are not a member of this group.',
                });
            }
            const isAdmin = group.admin.toString() === user._id.toString();
            if (isAdmin) {
                return res.status(403).json({
                    message:
                        'Group admin cannot leave the group. Please transfer admin rights first.',
                });
            }

            group.participants.pull(user._id);
            await group.save();

            return res.status(200).json({
                message: 'You have left the group successfully.',
                data: {
                    group: {
                        _id: group._id,
                        name: group.name,
                        participants: group.participants,
                    },
                },
            });
        } catch (error) {
            console.error('Error leaving group:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new GroupController();
