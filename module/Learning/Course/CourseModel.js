const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    describe: { type: String, required: true },
    price: { type: Number, required: true },
    subjectID: { type: Schema.Types.ObjectId, ref: 'Subject' },
    teacherID: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    isBlock: { type: Boolean, default: false },
    censor: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);

