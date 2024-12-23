const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: null },
    password: { type: String, default: null },
    avatar: { type: String, default: 'https://i.ibb.co/wcq80BN/avatar.png' },
    birthday: { type: Date, default: null },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ'],
        default: null
    },
    otp: { type: String },
    otpVerified: { type: Boolean, default: false },

    // login = gg
    googleID: { type: String, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);