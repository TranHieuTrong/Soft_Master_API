const express = require('express');
const router = express.Router();
const EnrollCourseController = require('../module/Learning/EnrollCourse/EnrollCourseController');

// đăng ký khóa hc
// http:localhost:3001/enrollCourse/enrollCourse/:userID/:courseID
router.post('/enrollCourse/:userID/:courseID', async (req, res) => {
    const { userID } = req.params;
    const { courseID } = req.params;

    try {
        const enrollment = await EnrollCourseController.enrollUserInCourse(userID, courseID);
        res.status(201).json({
            message: 'Đăng ký khóa học thành công',
            enrollment,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Đăng ký khóa học thất bại',
        });
    }
});

// http:localhost:3001/enrollCourse/check-enrollment/:userID/:courseID
router.get('/check-enrollment/:userID/:courseID', async (req, res) => {
    const { userID } = req.params;
    const { courseID } = req.params;
    try {
        const result = await EnrollCourseController.checkStudentEnrollment(userID, courseID);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái đăng ký', error: error.message });
    }
});

// http://localhost:3001/enrollCourse/getCourseUserEnrolled/:userID
router.get('/getCourseUserEnrolled/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        const enrollments = await EnrollCourseController.getCourseUserEnrolled(userID);

        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy khóa học đã đăng ký', error: error.message });
    }
});

// đếm số người tham gia 1 khóa học đó
// http://localhost:3001/enrollCourse/countEnrolledUsers/:courseID
router.get('/countEnrolledUsers/:courseID', async (req, res) => {
    const { courseID } = req.params;
    try {
        const count = await EnrollCourseController.countUsersEnrolledInCourse(courseID);

        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đếm số người tham gia khóa học', error: error.message });
    }
});

// Hiển thị danh sách sinh viên tham gia khóa học
router.get('/getUserEnrolledInCourse/:courseID', async (req, res) => {
    const { courseID } = req.params;
    try {
        const count = await EnrollCourseController.getUserEnrolledInCourse(courseID);

        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi hiện ng tham gia khóa học', error: error.message });
    }
});
module.exports = router;
