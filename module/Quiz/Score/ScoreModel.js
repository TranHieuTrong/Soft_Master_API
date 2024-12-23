const mongoose = require('mongoose');

// Mô hình điểm số
const ScoreSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    testID: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Test',
        required: true,
    },
    score: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true, 
});

module.exports = mongoose.model('Score', ScoreSchema);

