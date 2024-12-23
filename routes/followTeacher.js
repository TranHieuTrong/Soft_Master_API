const express = require('express');
const router = express.Router();
const FollowTeacherController = require('../module/Follow/FollowTeacher/FollowTeacherController');

// Đăng ký theo dõi giáo viên
router.post('/follow/:userID', async (req, res) => {
    const userID = req.params.userID;
    const { teacherID } = req.body;
    try {
        const response = await FollowTeacherController.followTeacher(userID, teacherID);
        res.status(201).json(response);
    } catch (error) {
        console.log('Error in follow route:', error);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Hủy theo dõi giáo viên
router.post('/unfollow/:userID', async (req, res) => {
    const userID = req.params.userID;
    const { teacherID } = req.body;
    try {
        const response = await FollowTeacherController.unFollowTeacher(teacherID, userID);
        res.status(200).json(response);
    } catch (error) {
        console.log('Error in unfollow route:', error);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Lấy danh sách người theo dõi giáo viên
router.get('/getFollowers-details/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        console.log("Teacher ID:", teacherID);
        const response = await FollowTeacherController.getFollowsByTeacherID(teacherID);
        console.log("Response:", response);
        res.status(200).json(response);
    } catch (error) {
        console.log("Error:", error);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Lấy danh sách giáo viên mà người dùng theo dõi
router.get('/getFollowed-teachers/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        const response = await FollowTeacherController.getTeachersFollowedByUser(userID);
        res.status(200).json(response);
    } catch (error) {
        console.log("Error:", error);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Lấy số lượng người theo dõi của giáo viên
router.get('/getFollowerCount/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        const response = await FollowTeacherController.getCountFollowersByTeacherID(teacherID);
        res.status(200).json(response);
    } catch (error) {
        console.log("Error:", error);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

module.exports = router;
