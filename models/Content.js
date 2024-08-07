const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['video', 'picture'], required: true },
    path: { type: String, required: true },
    isApproved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Content', contentSchema);
