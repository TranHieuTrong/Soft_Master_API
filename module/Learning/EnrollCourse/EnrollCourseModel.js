const mongoose = require('mongoose');
const { Schema } = mongoose;

const EnrollCourseSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseID: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('EnrollCourse', EnrollCourseSchema);
