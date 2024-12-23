const mongoose = require('mongoose');
const { Schema } = mongoose;

const LessonSchema = new Schema({
    title: { type: String, required: true },
    courseID: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
}, {
    timestamps: true
});

module.exports = mongoose.model('Lesson', LessonSchema);