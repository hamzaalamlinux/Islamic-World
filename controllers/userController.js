const User = require('../models/User');
const Content = require('../models/Content');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Wallet = require('../models/Wallet');
const httpStatusCodes = require('../utils/httpStatusCodes');
const ReferralUsage = require('../models/ReferralUsage');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });
exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        
        if (!user) return errorResponse(res, 'Email  Is Wrong',[], httpStatusCodes.BAD_REQUEST);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return errorResponse(res, 'Password Is Wrong',[], httpStatusCodes.BAD_REQUEST);

        if(user.isApproved == false && user.role != "admin"){
            return errorResponse(res, 'User Not Approved', [], httpStatusCodes.UNAUTHORIZED);
        }
        const payload = {
            user: {
                id: user.id
            }
        };
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            user.token = token;
            return successResponse(res, 'Success', user, httpStatusCodes.OK);
          });
    } catch (err) {
      
        return errorResponse(res, 'Something Went Wrong',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
exports.register = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password, referralCode, role } = req.body;
        let user = await User.findOne({ email });
       
        if (user) {
            await session.abortTransaction();
            session.endSession();
            return errorResponse(res, 'Email already exists!', [], httpStatusCodes.BAD_REQUEST);
        }

        user = new User({
            name,
            email,
            password,
            role : role,
            referralCode: generateReferralCode(), // Generate a unique referral code for the new user
        });

        if (referralCode) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to start of the day

            const usage = await ReferralUsage.findOne({ referralCode, date: today }).session(session);

            if (usage && usage.usageCount >= 2) {
                await session.abortTransaction();
                session.endSession();
                return errorResponse(res, 'Referral code has already been used twice today', [], httpStatusCodes.BAD_REQUEST);
            }

            let referrer = await User.findOne({ referralCode }).session(session);
            if (referrer) {
                user.referredBy = referralCode;
                referrer.totalReferrals += 1;
                // Determine the referral bonus based on totalReferrals
                let referralBonus;
                const registrationFee = 5000; // Example registration fee, replace with your actual fee

                if (referrer.totalReferrals <= 2) {
                    referralBonus = registrationFee * 0.5; // 50% of registration fee
                } else if (referrer.totalReferrals <= 10) {
                    referralBonus = registrationFee * 0.1; // 10% of registration fee
                } else {
                    referralBonus = registrationFee * 0.08; // 8% of registration fee
                }

                // Find or create the referrer's wallet
                let referrerWallet = await Wallet.findOne({ userId: referrer._id }).session(session);
                if (!referrerWallet) {
                    referrerWallet = new Wallet({ userId: referrer._id, balance: referralBonus });
                } else {
                    referrerWallet.balance += referralBonus;
                }

                // Save the referrer wallet and transaction
                await referrerWallet.save({ session });

                await referrer.save({ session });

                // Update referral usage
                if (usage) {
                    usage.usageCount += 1;
                    await usage.save({ session });
                } else {
                    const newUsage = new ReferralUsage({
                        referralCode,
                        date: today,
                        usageCount: 1,
                    });
                    await newUsage.save({ session });
                }
            } else {
                await session.abortTransaction();
                session.endSession();
                return errorResponse(res, 'Invalid referral code', [], httpStatusCodes.BAD_REQUEST);
            }
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save the new user
        await user.save({ session });

        // Create and sign the JWT token
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, async (err, token) => {
            if (err) {
                await session.abortTransaction();
                session.endSession();
                throw err;
            }
            user.token = token;

            await session.commitTransaction();
            session.endSession();

            return successResponse(res, 'User registered successfully', user, httpStatusCodes.CREATED);
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err)
        return errorResponse(res, 'Something went wrong', [], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};


exports.uploadContent = [upload.single('file'), async (req, res) => {
    try {
        const content = new Content({
            userId: req.user.id,
            type: req.file.mimetype.split('/')[0],
            path: req.file.path,
            description : req.description
        });
        
        await content.save();
        return successResponse(res, 'Content Uploaded Successfully', content, httpStatusCodes.CREATED);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something Went Wrong',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
}];

exports.getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if(!user){
            return errorResponse(res, 'User Not Found!',[], httpStatusCodes.NOT_FOUND);
        }
        let wallet = await Wallet.findOne({ userId: req.user.id });
        if(!wallet){
            return errorResponse(res, 'Wallet Not Found!',[], httpStatusCodes.NOT_FOUND);
        }
        return successResponse(res, 'Success', wallet, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something Went Wrong',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const generateReferralCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
};