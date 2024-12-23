const admin = require('../../firebase'); // Firebase Admin SDK
const User = require('../People/User/UserModel'); // MongoDB User Model
const Teacher = require('../People/Teacher/TeacherModel'); // MongoDB Teacher Model
const Message = require('./Message'); // Firebase Message Model
const Conversation = require('./Conversation'); // Firebase Conversation Model

// Thêm tin nhắn
async function addMessage(req, res) {
    const { senderId, receiverId } = req.params;
    const { content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).send({ error: 'senderId, receiverId và content là bắt buộc.' });
    }

    try {
        const isTeacher = senderId.startsWith('teacher_');
        const userId = isTeacher ? receiverId : senderId;
        const teacherId = isTeacher ? senderId : receiverId;
        const conversationId = Conversation.generateConversationId(userId, teacherId);

        const conversationRef = admin.database().ref('conversations');
        const snapshot = await conversationRef.child(conversationId).once('value');

        let conversationData = null;

        if (snapshot.exists()) {
            conversationData = snapshot.val();
        } else {
            conversationData = new Conversation(userId, teacherId).toFirebaseObject();
        }

        if (!content || content.trim() === '') {
            return res.status(400).send({ error: 'Content không thể trống' });
        }

        const newMessage = new Message(senderId, receiverId, content);
        const messageToSave = newMessage.toFirebaseObject();

        conversationData.messages.push(messageToSave);

        await conversationRef.child(conversationId).set(conversationData);

        res.status(201).send({
            conversationId,
            message: {
                senderId,
                content,
                timestamp: newMessage.timestamp,
            },
        });
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        res.status(500).send({ error: 'Lỗi khi gửi tin nhắn.' });
    }
}

// Lấy tất cả tin nhắn kèm tên user/teacher
async function getMessagesWithNames(req, res) {
    const { userId, teacherId } = req.params;

    try {
        const conversationId = Conversation.generateConversationId(userId, teacherId);
        const conversationRef = admin.database().ref('conversations').child(conversationId);

        const snapshot = await conversationRef.once('value');
        if (!snapshot.exists()) {
            return res.status(404).send({ error: 'Cuộc trò chuyện không tồn tại' });
        }

        const conversationData = snapshot.val();
        const messages = conversationData.messages || [];

        const user = await User.findById(userId).select('name');
        const teacher = await Teacher.findById(teacherId).select('name');

        if (!user || !teacher) {
            return res.status(404).send({ error: 'Không tìm thấy user hoặc teacher trong MongoDB' });
        }

        const messagesWithNames = messages.map(msg => ({
            ...msg,
            senderName: msg.senderId === userId ? user.name : teacher.name,
            receiverName: msg.receiverId === teacherId ? teacher.name : user.name,
        }));

        res.status(200).send({
            conversationId,
            messages: messagesWithNames,
        });
    } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        res.status(500).send({ error: 'Lỗi khi lấy tin nhắn.' });
    }
}

// Lấy danh sách giáo viên mà user đã nhắn tin
// Lấy danh sách giáo viên mà user đã nhắn tin
async function getTeachersForUser(req, res) {
    const { userId } = req.params; // Đổi từ teacherId -> userId

    try {
        const conversationRef = admin.database().ref('conversations');
        const snapshot = await conversationRef.orderByChild('userId').equalTo(userId).once('value'); // Tìm theo userId

        if (!snapshot.exists()) {
            return res.status(404).send({ error: 'Không có cuộc trò chuyện nào cho user này' });
        }

        const conversations = snapshot.val();
        const teacherIds = Object.values(conversations).map(conv => conv.teacherId);

        const teachers = await Teacher.find({ _id: { $in: teacherIds } }).select('name');
        res.status(200).send(teachers);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giáo viên:', error);
        res.status(500).send({ error: 'Lỗi khi lấy danh sách giáo viên.' });
    }
}

// Lấy danh sách user mà teacher đã nhắn tin
async function getUsersForTeacher(req, res) {
    const { teacherId } = req.params; // Đổi từ userId -> teacherId

    try {
        const conversationRef = admin.database().ref('conversations');
        const snapshot = await conversationRef.orderByChild('teacherId').equalTo(teacherId).once('value'); // Tìm theo teacherId

        if (!snapshot.exists()) {
            return res.status(404).send({ error: 'Không có cuộc trò chuyện nào cho giáo viên này' });
        }

        const conversations = snapshot.val();
        const userIds = Object.values(conversations).map(conv => conv.userId); // Đổi conv.userIds -> conv.userId

        const users = await User.find({ _id: { $in: userIds } }).select('name'); // Đổi Teacher -> User
        res.status(200).send(users);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách user:', error);
        res.status(500).send({ error: 'Lỗi khi lấy danh sách user.' });
    }
}


module.exports = {
    addMessage,
    getMessagesWithNames,
    getTeachersForUser,
    getUsersForTeacher
};
