const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyAccessToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token missing' });
        }

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    return res
                        .status(403)
                        .json({ message: 'Invalid access token' });
                }

                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(403).json({ message: 'User not found' });
                }

                req.user = user;
                next();
            }
        );
    } catch (error) {
        console.error('Error in verifyAccessToken middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies['refresh-token'];

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token missing' });
        }

        // Verify token signature
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    return res
                        .status(403)
                        .json({ message: 'Invalid refresh token' });
                }

                // Check if token exists in database
                const user = await User.findOne({ refreshToken });
                if (!user) {
                    return res.status(403).json({
                        message: 'Refresh token not found or expired',
                    });
                }

                // Check if the user ID matches
                if (user._id.toString() !== decoded.id) {
                    return res
                        .status(403)
                        .json({ message: 'Invalid refresh token' });
                }

                req.user = user;
                next();
            }
        );
    } catch (error) {
        console.error('Error in verifyRefreshToken middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
