const mongoose = require('mongoose');

const referralUsageSchema = new mongoose.Schema({
    referralCode: { type: String, required: true },
    date: { type: Date, required: true },
    usageCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('ReferralUsage', referralUsageSchema);
