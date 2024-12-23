const express = require('express');
const router = express.Router();
const CourseController = require('../module/Learning/Course/CourseController');

// Route lấy tất cả các khóa học
router.get('/getAll', async (req, res) => {
    try {
        const courses = await CourseController.getAll();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách khóa học', error: error.message });
    }
});

// Route lấy tất cả khóa học có trạng thái isBlock = true
//http://localhost:3001/course/getBlockedCourses
router.get('/getBlockedCourses', async (req, res) => {
    try {
        const courses = await CourseController.getAllBlockedCourses();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy khóa học bị khóa', error: error.message });
    }
});

// Route lấy tất cả khóa học có trạng thái isBlock = true
//http://localhost:3001/course/getAllCensorCourses
router.get('/getCensorCourses', async (req, res) => {
    try {
        const courses = await CourseController.getAllCensorCourses();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy khóa học bị khóa', error: error.message });
    }
});



// đếm số khóa học theo teacherID
router.get('/countByTeacherID/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        const count = await CourseController.getCourseCountByTeacherID(teacherID);
        res.status(200).json({ count });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Route lấy khóa học theo subjectID
router.get('/getCourseBySubjectID/:subjectID', async (req, res) => {
    const { subjectID } = req.params;
    try {
        const courses = await CourseController.getCourseBySubjectID(subjectID);
        res.status(200).json(courses);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.get('/getDetailByCourseID/:courseID', async (req, res) => {
    const { courseID } = req.params;
    const { userId } = req.query;

    try {
        const courses = await CourseController.getDetailByCourseID(courseID, userId);
        res.status(200).json(courses);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.get('/getCourseByTeacherID/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        const courses = await CourseController.getCourseByTeacherID(teacherID);
        res.status(200).json(courses);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// đếm tổng số khóa học
router.get('/countCourse', async (req, res) => {
    try {
        const response = await CourseController.getTotalCourseCount();
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Route đếm số khóa học của một giáo viên
router.get('/getCourseCountByTeacher/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        const response = await CourseController.getCourseCountByTeacher(teacherID);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Route tìm kiếm khóa học theo tên
router.post('/search', async (req, res) => {
    const { name } = req.body;
    try {
        const response = await CourseController.searchCourse(name);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tìm khóa học', error: error.message });
    }
});

// Route thêm một khóa học mới
router.post('/add/:teacherID', async (req, res) => {
    const { teacherID } = req.params; // Lấy teacherID từ params
    const { name, img, describe, price, subjectID, isBlock, censor } = req.body; // Thêm isBlock vào body
    
    try {
        const response = await CourseController.addCourse(name, img, describe, price, subjectID, teacherID, isBlock,censor);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm khóa học', error: error.message });
    }
});



// Route cập nhật thông tin khóa học theo courseID
router.put('/update/:courseID', async (req, res) => {
    const { courseID } = req.params;
    const { name, img, describe, price, subjectID, teacherID } = req.body; // Thêm isBlock vào body
    
    try {
        const updatedCourse = await CourseController.updateCourse(courseID, name, img, describe, price, subjectID, teacherID);
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật khóa học', error: error.message });
    }
});


// Route xóa một khóa học theo courseID
router.delete('/delete/:courseID', async (req, res) => {
    const { courseID } = req.params;
    try {
        const deletedCourse = await CourseController.deleteCourse(courseID);
        res.status(200).json({ message: 'Xóa khóa học thành công', deletedCourse });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa khóa học', error: error.message });
    }
});

// Route thay đổi trạng thái của khóa học từ true thành false và ngược lại
router.put('/toggleIsBlock/:courseID', async (req, res) => {
    const { courseID } = req.params;
    try {
        const response = await CourseController.toggleIsBlock(courseID);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: 'Lỗi khi thay đổi trạng thái khóa học', error: error.message });
    }
});

module.exports = router;
