const mongoose = require('mongoose');
const { Schema } = mongoose;

const FollowTeacherSchema = new Schema({
    teacherID: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('FollowTeacher', FollowTeacherSchema);
