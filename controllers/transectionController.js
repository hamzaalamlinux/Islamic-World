const Transaction = require('../models/Transaction');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const UserAccounts = require('../models/UserAccounts');
const mongoose = require('mongoose');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
exports.createTransection = async (req, res) => {
    const { userId, amount, type, description, walletId, status, accountNumber, accountTitle, bankname } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'User Not Found!', [], httpStatusCodes.NOT_FOUND);
        }

        let wallet = await Wallet.findById(walletId).session(session);
        if (!wallet) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Wallet Not Found!', [], httpStatusCodes.NOT_FOUND);
        }

        let userAccounts = await UserAccounts.findOne({ userId: userId }).session(session);
        if (!userAccounts) {
            const accounts = new UserAccounts({
                userId: userId,
                accountNumber: accountNumber,
                accountTitle: accountTitle,
                bankName: bankname
            });
            await accounts.save({ session });
        }

        if (amount > wallet.balance) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Your amount exceeds your balance', [], httpStatusCodes.BAD_REQUEST);
        }

        const transaction = new Transaction({
            userId: userId,
            type: type,
            amount: amount,
            status: status,
            description: 'Referral bonus',
            accountNumber: accountNumber,
            accountTitle: accountTitle,
            bankName: bankname
        });
        await transaction.save({ session });

        wallet.balance = wallet.balance - amount;
        await wallet.save({ session });

        await session.commitTransaction();
        session.endSession();

        return successResponse(res, 'Transaction request submitted successfully!', transaction, httpStatusCodes.CREATED);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        return errorResponse(res, 'Something Went Wrong', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

exports.getTransectionsForAdmin = async(req, res) => {
    try{
        let transection = await Transaction.find().populate('userId');
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
  
    try{
        let transection = await Transaction.find({ userId: req.user.id});
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
    const {status, transectionId } = req.body;
    try {
        let transection = await Transaction.findById(transectionId);
        transection.status = status;
        transection.updatedAt = Date.now();
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