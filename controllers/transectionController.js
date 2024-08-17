const Transaction = require('../models/Transaction');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const UserAccounts = require('../models/UserAccounts');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
exports.createTransection = async (req, res) => {
    const { userId, amount, type, description, walletId, status, accountNumber, accountTitle, bankname } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let user = await User.findOne({ userId }).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'User Not Found!', [], httpStatusCodes.NOT_FOUND);
        }

        let wallet = await Wallet.findOne({ walletId }).session(session);
        if (!wallet) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Wallet Not Found!', [], httpStatusCodes.NOT_FOUND);
        }

        let userAccounts = await UserAccounts.findOne({ userId: userId }).session(session);
        if (!userAccounts) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'We dont have your bank information', [], httpStatusCodes.NOT_FOUND);
        }

        if (amount > wallet.balance) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Your amount exceeds your balance', [], httpStatusCodes.BAD_REQUEST);
        }

        const accounts = new UserAccounts({
            userId: userId,
            accountNumber: accountNumber,
            accountTitle: accountTitle,
            bankName: bankname
        });
        await accounts.save({ session });

        const transaction = new Transaction({
            userId: userId,
            type: type,
            amount: amount,
            status: status,
            description: 'Referral bonus',
            accountNumber: userAccounts.accountNumber,
            accountTitle: userAccounts.accountTitle,
            bankName: userAccounts.bankname
        });
        await transaction.save({ session });

        wallet.balance = wallet.balance - amount;
        await wallet.save({ session });

        await session.commitTransaction();
        session.endSession();

        return successResponse(res, 'Transaction request submitted successfully!', user, httpStatusCodes.CREATED);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, 'Something Went Wrong', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.getTransectionsForAdmin = async(req, res) => {
    try{
        let transection = await Transaction.find();
        if(!transection){
            return errorResponse(res, 'No Transections Found!',[], httpStatusCodes.BAD_REQUEST);
        }
        return successResponse(res, 'Success', transection, httpStatusCodes.OK);
    }
    catch (err) {
        return errorResponse(res, 'Something Went Wrong', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.getTransectionsForUser = async(req, res) => {
    const {userId } = req.body;
    try{
        let transection = await Transaction.findOne({ userId: userId});
        if(!transection){
            return errorResponse(res, 'No Transections Found!',[], httpStatusCodes.BAD_REQUEST);
        }
        return successResponse(res, 'Success!', transection, httpStatusCodes.CREATED);
    }
    catch (err) {
        return errorResponse(res, 'Something Went Wrong', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.ApproveTransection = async(req, res) => {
    const {userId, status } = req.body;
    try {
        let transection = await Transaction.findOne({ userId: userId});
        transection.status = status;
        transection.updatedAt = Date.now;
        transection.save();
        if(!transection){
            return errorResponse(res, 'No Transections Found!',[], httpStatusCodes.BAD_REQUEST);
        }
        return successResponse(res, 'Success!', transection, httpStatusCodes.CREATED);
    }
    catch (err) {
        return errorResponse(res, 'Something Went Wrong', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }

};