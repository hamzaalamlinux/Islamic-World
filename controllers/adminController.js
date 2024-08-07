const User = require('../models/User');
const Content = require('../models/Content');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isApproved = true;
        await user.save();
        res.json({ msg: 'User approved' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.approveContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ msg: 'Content not found' });

        content.isApproved = true;
        await content.save();
        res.json({ msg: 'Content approved' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.sendMoney = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.wallet = 0; // Reset wallet after sending money
        await user.save();
        res.json({ msg: 'Money sent and wallet reset' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
