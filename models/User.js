const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallet: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
    referralCode: { type: String },
    totalReferrals : {type : Number, default : 0},
    referredBy: { type: String },
    isApproved: { type: Boolean, default: false },
    registrationFee: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    resetPasswordToken : {type : String},
    resetPasswordExpire : {type : Number},
    token: {
        type: String,
        select: false
      },
});

module.exports = mongoose.model('User', userSchema);
