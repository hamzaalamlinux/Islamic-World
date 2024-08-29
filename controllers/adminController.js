const User = require('../models/User');
const Content = require('../models/Content');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const Transaction = require('../models/Transaction');

exports.getUsers = async (req, res) => {
    try {
        // Extract filter parameters from the query string
        const filter = {};
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive regex search
        }
        if (req.query.email) {
            filter.email = req.query.email;
        }
        if (req.query.isApproved) {
            filter.isApproved = req.query.isApproved;
        }
       

        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
        const skip = (page - 1) * limit;

        // Fetch users with filters, pagination, and sorting (if needed)
        const users = await User.find(filter).skip(skip).limit(limit);

        if (!users.length) {
            return errorResponse(res, 'Users Not Found!', [], httpStatusCodes.NOT_FOUND);
        }

        // Count total users for pagination
        const totalUsers = await User.countDocuments(filter);

        // Prepare the response with pagination data
        const response = {
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            users,
        };

        return successResponse(res, 'Success', response, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something went wrong!', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
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


exports.analytics = async (req, res) => {
    try {
        // Get the total number of users
        const totalUsers = await User.countDocuments();

        // Get the total number of pending transactions
        const totalPendingTransactions = await Transaction.countDocuments({ status: 'pending' });

        // Return the counts in the response
        return successResponse(res, 'Analytics fetched successfully', {
            totalUsers,
            totalPendingTransactions
        }, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Failed to fetch analytics', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
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
