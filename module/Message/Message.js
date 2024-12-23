// Message.js
class Message {
    constructor(senderId, receiverId, content) {
        this.senderId = senderId;  // ID của người gửi
        this.receiverId = receiverId;  // ID của người nhận
        this.content = content;  // Nội dung tin nhắn
        this.timestamp = Date.now();  // Thời gian gửi tin nhắn
    }

    // Phương thức chuyển tin nhắn thành dạng Firebase
    toFirebaseObject() {
        return {
            senderId: this.senderId,
            receiverId: this.receiverId,
            content: this.content,
            timestamp: this.timestamp
        };
    }
}

module.exports = Message;