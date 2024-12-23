const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://i.ibb.co/wcq80BN/avatar.png' },
    position: { type: String, required: true },
    gender: {
        type: String,
        enum: ['Nam', 'Nữ'],
        required: true
    },
    otp: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);