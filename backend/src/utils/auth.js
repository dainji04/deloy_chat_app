const jwt = require('jsonwebtoken');

const getRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '15d',
    });
};

const getAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '30m',
    });
};

module.exports = {
    getRefreshToken,
    getAccessToken,
};
