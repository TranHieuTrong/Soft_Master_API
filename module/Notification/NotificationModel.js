const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true }, 
    content: { type: String, required: true }, 
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Notification', NotificationSchema);
