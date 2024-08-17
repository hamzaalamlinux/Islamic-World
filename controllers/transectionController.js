const Transaction = require('../models/Transaction');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const UserAccounts = require('../models/UserAccounts');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
exports.createTransection = async(req, res) => {
    const {userId, amount, type, description, walletId, status, accountNumber, accountTitle, bankname } = req.body;
    try{
        let user = await User.findOne({ userId });
        if (!user) return errorResponse(res, 'User Not Found!',[], httpStatusCodes.NOT_FOUND);
         
        let wallet = await Wallet.findOne({walletId});
        if(!wallet) return errorResponse(res, 'Wallet Not Found!',[], httpStatusCodes.NOT_FOUND);
        
        let userAccounts = await UserAccounts.findOne({ userId: userId});
        if(!userAccounts) return errorResponse(res, 'We dont have you bank informations',[], httpStatusCodes.NOT_FOUND);
        if(amount > wallet.balance ){
            return errorResponse(res, 'Your amount is excedded from your balance',[], httpStatusCodes.BAD_REQUEST);
        }else{
            const accounts = new UserAccounts({
                userId: userId,
                accountNumber : accountNumber,
                accountTitle : accountTitle,
                bankName : bankname
            });
            await accounts.save();
        }
        const transaction = new Transaction({
            userId: userId,
            type: type,
            amount: amount,
            status : status,
            description: 'Referral bonus',
            accountNumber : userAccounts.accountNumber,
            accountTitle : userAccounts.accountTitle,
            bankName : userAccounts.bankname
        });
        await transaction.save();
        wallet.balance = wallet.balance - amount;
        await wallet.save();
        return successResponse(res, 'Transection request submitted successfully!', user, httpStatusCodes.CREATED);
    }catch (err) {
        return errorResponse(res, 'Something Went Wrong',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};