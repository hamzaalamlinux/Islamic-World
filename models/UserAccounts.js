const mongoose = require('mongoose');

const UserAccountsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber : { type: Number, default: 0 },
    accountTitle : {type: String},
    bankName : {type: String}
});

module.exports = mongoose.model('UserAccounts', UserAccountsSchema);
