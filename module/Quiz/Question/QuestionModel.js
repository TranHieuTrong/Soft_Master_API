const mongoose = require('mongoose');

// Mô hình câu hỏi
const QuestionSchema = new mongoose.Schema({
  testID: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Test',
    required: true,
  },
  teacherID: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Teacher',
    required: true,
  },
  questions: [
    {
      questionID: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Question',
        default: () => new mongoose.Types.ObjectId(),
      },
      title: {
        type: String,
        required: true,
      },
      options: {
        type: [
          {
            text: String,
            isCorrect: Boolean,
          }
        ],
        required: true,
        _id: false, // Tắt tự động tạo _id cho options
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
});

module.exports = mongoose.model('Question', QuestionSchema);

