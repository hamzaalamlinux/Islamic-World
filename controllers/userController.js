const User = require('../models/User');
const Content = require('../models/Content');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const httpStatusCodes = require('../utils/httpStatusCodes');
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
    const { name, email, password, referralCode } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return errorResponse(res, 'Email already exist!',[], httpStatusCodes.BAD_REQUEST);

        user = new User({
            name,
            email,
            password,
            referralCode: generateReferralCode() // Generate a unique referral code for the new user
        });

        if (referralCode) {
            let referrer = await User.findOne({ referralCode });
            if (referrer) {
                user.referredBy = referralCode;
                referrer.wallet += 100; // Increase referrer's wallet by $100
                await referrer.save();
            } else {
                return errorResponse(res, 'Invalid referreral code',[], httpStatusCodes.BAD_REQUEST);
            }
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            user.token = token;
            return successResponse(res, 'User Register Successfully', user, httpStatusCodes.CREATED);
          });
    } catch (err) {
        return errorResponse(res, 'Something Went Wrong',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};
exports.uploadContent = [upload.single('file'), async (req, res) => {
    try {
        const content = new Content({
            userId: req.user.id,
            type: req.file.mimetype.split('/')[0],
            path: req.file.path
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
        return successResponse(res, 'Success', user, httpStatusCodes.OK);
    } catch (err) {
        console.error(err.message);
        return errorResponse(res, 'Something Went Wrong',[], httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const generateReferralCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
};