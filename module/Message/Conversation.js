// Conversation.js
class Conversation {
    constructor(userId, teacherId) {
        this.userId = userId;  // ID của người dùng
        this.teacherId = teacherId;  // ID của giáo viên
        this.messages = [];  // Mảng lưu các tin nhắn
    }

    // Phương thức thêm tin nhắn vào cuộc trò chuyện
    addMessage(message) {
        this.messages.push(message);
    }

    // Phương thức chuyển đối tượng thành dạng Firebase
    toFirebaseObject() {
        return {
            userId: this.userId,
            teacherId: this.teacherId,
            messages: this.messages.map(msg => msg.toFirebaseObject()),  // Chuyển tất cả tin nhắn thành dạng Firebase
        };
    }

    // Phương thức tạo conversationId duy nhất từ userId và teacherId
    static generateConversationId(userId, teacherId) {
        // Lấy conversationId từ việc sắp xếp userId và teacherId
        return [userId, teacherId].sort().join('_');  // Dùng sort để đảm bảo không phân biệt giữa user và teacher
    }
}

module.exports = Conversation;
