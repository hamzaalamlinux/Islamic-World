const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Replace with your User model
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
// Step 1.1: Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Find the user by email
        
        const user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 'User with this email does not exist.', [], httpStatusCodes.BAD_REQUEST);
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiration on the user object
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes expiration
        await user.save();

        // Provide the reset token directly in the response
        return successResponse(res, 'Reset token generated successfully.', { resetToken }, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Error generating reset token', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};


exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return errorResponse(res, 'Invalid or expired token', [], httpStatusCodes.BAD_REQUEST);
        }

        // Update user's password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token and expiration
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return successResponse(res, 'Password updated successfully', [], httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Error updating password', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
