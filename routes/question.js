const express = require('express');
const router = express.Router();
const {
    createQuestions,
    getAllQuestions,
    getRandomQuestions,
    getDetailQuestionById,
    deleteQuestion,
    updateQuestion,
} = require('../module/Quiz/Question/QuestionController');

// Route liên quan đến câu hỏi
router.post('/addquestions/:testID/:teacherID', createQuestions); // Thêm câu hỏi
router.get('/getAll/:testID', getAllQuestions); // Lấy tất cả câu hỏi
router.get('/getRandomQuestions/:testID', getRandomQuestions); // Lấy câu hỏi ngẫu nhiên
router.put('/updatequestion/:testID/:questionID', updateQuestion); // Cập nhật câu hỏi
router.delete('/deletequestion/:testID/:questionID', deleteQuestion); // Xóa câu hỏi
router.get('/getDetailQuestionById/:testID/:questionID', getDetailQuestionById); // Lấy chi tiết câu hỏi

module.exports = router;
