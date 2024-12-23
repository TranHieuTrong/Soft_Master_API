const mongoose = require('mongoose');
const { Schema } = mongoose;

const TemporaryAnswerSchema = new Schema({
    testID: { type: Schema.Types.ObjectId, ref: 'Test', required: true }, 
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    answers: [{
        questionID: { type: Schema.Types.ObjectId, ref: 'Question', required: true }, 
        answerID: { type: Schema.Types.ObjectId, ref: 'Answer', required: true }
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('TemporaryAnswer', TemporaryAnswerSchema);
