const express = require('express');
const router = express.Router();
const FeedbackCourseController = require('../module/FeedbackCourse/FeedbackCourseController');

// Lấy tất cả phản hồi khóa học
router.get('/getAll', async (req, res) => {
    try {
        const feedbackCourses = await FeedbackCourseController.getAll();
        res.status(200).json(feedbackCourses);
    } catch (error) { 
        +
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Thêm phản hồi mới
router.post('/feedback/:userID/:courseID', async (req, res) => {
    const { courseID, userID } = req.params;
    const { rating, content } = req.body;

    try {
        const response = await FeedbackCourseController.addFeedback(courseID, userID, rating, content);
        res.status(201).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Cập nhật phản hồi
router.put('/update/:userID/:courseID', async (req, res) => {
    const { courseID, userID } = req.params;
    const { rating, content } = req.body;

    try {
        const response = await FeedbackCourseController.updateFeedback(courseID, userID, rating, content);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Xóa phản hồi
router.delete('/delete/:userID/:courseID', async (req, res) => {
    const { courseID, userID } = req.params;

    try {
        const response = await FeedbackCourseController.deleteFeedback(courseID, userID);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Lấy phản hồi theo ID khóa học
router.get('/getFeedbackByCourseID/:courseID', async (req, res) => {
    const { courseID } = req.params;

    try {
        const feedbacks = await FeedbackCourseController.getFeedbackByCourseID(courseID);
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Lấy phản hồi theo ID khóa học
router.get('/getFeedbackByCourseID/:courseID', async (req, res) => {
    const { courseID } = req.params;

    try {
        const feedbacks = await FeedbackCourseController.getFeedbackByCourseID(courseID);
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Lấy phản hồi theo ID người dùng
router.get('/getFeedbackByUserID/:userID', async (req, res) => {
    const { userID } = req.params;

    try {
        const feedbacks = await FeedbackCourseController.getFeedbackByUserID(userID);
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// đếm số lượt feedback

router.get('/countFeedbackByCourseID/:courseID', async (req, res) => {
    const { courseID } = req.params;

    try {
        const count = await FeedbackCourseController.getCountFeedbackByCourseID(courseID);
        res.status(200).json({ count });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});


// tính trung bình reating

router.get('/averageRatingByCourseID/:courseID', async (req, res) => {
    const { courseID } = req.params;

    try {
        const averageRating = await FeedbackCourseController.calculateAverageRating(courseID);
        res.status(200).json({ averageRating });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

module.exports = router;
