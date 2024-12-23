const express = require('express');
const router = express.Router();
const messagesController = require('../module/Message/MessageController');

// Route thêm tin nhắn
router.post('/addMessage/:senderId/:receiverId', messagesController.addMessage);

// Route lấy tất cả tin nhắn của một cuộc trò chuyện 
router.get('/getMessages/:userId/:teacherId', messagesController.getMessagesWithNames);

// Route lấy danh sách các giáo viên mà user đã nhắn tin 
router.get('/getConversationsForUser/:userId', messagesController.getTeachersForUser);

// Route lấy danh sách các user mà teacher đã nhắn tin 
router.get('/getConversationsForTeacher/:teacherId', messagesController.getUsersForTeacher);

module.exports = router;
