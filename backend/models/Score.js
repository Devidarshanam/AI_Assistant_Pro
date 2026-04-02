const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    score: {
        correct: { type: Number, required: true },
        total: { type: Number, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
