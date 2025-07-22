// Simple auth utilities for FoodSuite
const crypto = require('crypto');

// Hash password (simple implementation)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate secure password
function generateSecurePassword() {
    return crypto.randomBytes(8).toString('hex');
}

// Validate password
function validatePassword(password, hash) {
    return hashPassword(password) === hash;
}

module.exports = {
    hashPassword,
    generateSecurePassword,
    validatePassword
};