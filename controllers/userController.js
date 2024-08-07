const User = require('../models/User');
const Content = require('../models/Content');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

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
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.register = async (req, res) => {
    const { name, email, password, referralCode } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

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
                return res.status(400).json({ msg: 'Invalid referral code' });
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

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
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
        res.json({ msg: 'Content uploaded' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}];

exports.getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ wallet: user.wallet });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const generateReferralCode = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
};