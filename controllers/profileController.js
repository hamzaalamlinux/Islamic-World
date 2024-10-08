
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Replace with your User model
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');// Replace with your actual response handler

exports.updateProfile = async (req, res) => {
    const { name, email, password, referralCode, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return errorResponse(res, 'User not found', [], httpStatusCodes.NOT_FOUND);
        }

        if (name) user.name = name;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        if (referralCode) user.referralCode = referralCode;
        if (role) user.role = role;

        // Save the updated user
        await user.save();

        return successResponse(res, 'Profile updated successfully', user, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Failed to update profile', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
