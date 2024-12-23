const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
    type: {
        type: String,
        enum: ['course', 'teacher', 'content', 'technical'], 
        required: true
    },
    content: { type: String, required: true }, 
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Report', ReportSchema);
