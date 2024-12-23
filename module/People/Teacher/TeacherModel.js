const mongoose = require('mongoose');
const { Schema } = mongoose;

const TeacherSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://i.ibb.co/wcq80BN/avatar.png' },
    major: { type: String, required: true },
    slogan: { type: String, default: null },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ'],
        required: true
    },
    creatorID: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    otp: { type: String },
    isLocked: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', TeacherSchema);



