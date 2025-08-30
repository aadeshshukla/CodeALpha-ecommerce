require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d'
};