const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt : {type:Date},
    accountNumber : { type: Number, default: 0 },
    accountTitle : {type: String},
    bankName : {type: String}
});

module.exports = mongoose.model('Transaction', transactionSchema);
