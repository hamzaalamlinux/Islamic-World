const Transaction = require('../models/Transaction');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const UserAccounts = require('../models/UserAccounts');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Content = require('../models/Content');


exports.getContentForAdmin = async (req, res) => {
    try {
        const content = await Content.find().sort({ _id: -1 });
        if (!content) return errorResponse(res, 'Content not found!',[], httpStatusCodes.NOT_FOUND);
        return successResponse(res, 'Success', content, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
exports.getContentForUser = async(req, res) => {
    const { userId } = req.body;
    let user = await User.findOne({ userId });
    if (!user) {
        return errorResponse(res, 'User Not Found!', [], httpStatusCodes.BAD_REQUEST);
    }
    return successResponse(res, 'Success', content, httpStatusCodes.OK);
};


exports.getContentForUser = async(req, res) => {
    let user = await User.find({isApproved : true});
    if (!user) {
        return errorResponse(res, 'User Not Found!', [], httpStatusCodes.BAD_REQUEST);
    }
};

exports.approveContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return errorResponse(res, 'Content not found!',[], httpStatusCodes.NOT_FOUND);
        content.isApproved = true;
        await content.save();
        return successResponse(res, 'Content Approved Successfully', content, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
