const mongoose = require('mongoose');
const { Schema } = mongoose;

const TestSchema = new Schema({
    title: { type: String, required: true },
    lessonID: { type: Schema.Types.ObjectId, ref: 'Lesson', default: null },
}, {
    timestamps: true
});

module.exports = mongoose.model('Test', TestSchema);
