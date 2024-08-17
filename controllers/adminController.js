const User = require('../models/User');
const Content = require('../models/Content');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        if(!users){
            return errorResponse(res, 'User Not Found!',[], httpStatusCodes.NOT_FOUND);
        }
        return successResponse(res, 'Success', users, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return errorResponse(res, 'User Not Found!',[], httpStatusCodes.NOT_FOUND);

        user.isApproved = true;
        await user.save();
        return successResponse(res, 'User approved successfully!', user, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};




exports.sendMoney = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return errorResponse(res, 'User not found!',[], httpStatusCodes.NOT_FOUND);

        user.wallet = 0; // Reset wallet after sending money
        await user.save();
        res.json({ msg: 'Money sent and wallet reset' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
