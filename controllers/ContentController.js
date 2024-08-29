const Transaction = require('../models/Transaction');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const UserAccounts = require('../models/UserAccounts');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Content = require('../models/Content');


exports.getContentForAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
        const skip = (page - 1) * limit;
        // Fetch content with pagination, sorting, and population
        const content = await Content.find()
            .populate('userId')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);

        if (!content.length) {
            return errorResponse(res, 'No Content Found', [], httpStatusCodes.OK);
        }

        // Count total content for pagination
        const totalContent = await Content.countDocuments();

        // Prepare the response with pagination data
        const response = {
            totalContent,
            currentPage: page,
            totalPages: Math.ceil(totalContent / limit),
            content,
        };
        return successResponse(res, 'Success', response, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.getContentForUser = async(req, res) => {
    const { userId } = req.body;
    let content = await Content.find( { userId: userId}).populate('userId');
    if (!content) {
        return errorResponse(res, 'Content Not Found!', [], httpStatusCodes.BAD_REQUEST);
    }
    return successResponse(res, 'Success', content, httpStatusCodes.OK);
};


exports.getContentForWeb = async (req, res) => {
    try {
        const content = await Content.find().populate('userId').sort({ _id: -1 });
        if (!content) return errorResponse(res, '',[], httpStatusCodes.OK);
        return successResponse(res, 'Success', content, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.approveContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id).populate('userId');
        if (!content) return errorResponse(res, 'Content not found!',[], httpStatusCodes.NOT_FOUND);
        content.isApproved = true;
        await content.save();
        return successResponse(res, 'Content Approved Successfully', content, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
