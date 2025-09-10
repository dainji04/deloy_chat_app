const mongoose = require('mongoose');

const backgroundSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        url: {
            type: String,
            unique: true,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Background', backgroundSchema);
