const mongoose = require('mongoose');
const { Schema } = mongoose;

const FeedbackCourseSchema = new Schema({
    courseID: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    feedbacks: [{
        userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        feedbackDetail: {
            rating: { type: Number, required: true, min: 1, max: 5 },
            content: { type: String, required: true }, 
            createdAt: { type: Date, default: Date.now }, 
            updatedAt: { type: Date, default: Date.now }
        }
    }]
});

module.exports = mongoose.model('FeedbackCourse', FeedbackCourseSchema);
