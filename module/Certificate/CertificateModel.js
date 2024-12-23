const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
