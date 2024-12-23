const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', SubjectSchema);