const express = require('express');
const router = express.Router();
const LessonController = require('../module/Learning/Lesson/LessonController');

// Route lấy tất cả các bài học
router.get('/getAll', async (req, res) => {
    try {
        const lesson = await LessonController.getAll();
        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài học', error });
    }
});

// Route lấy bài học theo courseID
router.get('/getLessonByCourseID/:courseID', async (req, res) => {
    const { courseID } = req.params;
    try {
        const lesson = await LessonController.getLessonByCourseID(courseID);
        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy bài học theo courseID', error: error.message });
    }
});

router.get('/getDetail/:lessonID', async (req, res) => {
    try {
        const { lessonID } = req.params;

        // Gọi hàm getDetailLessonVideo để lấy thông tin bài học
        const lesson = await LessonController.getDetailLesson(lessonID);

        // Nếu không tìm thấy bài học, trả về thông báo lỗi
        if (!lessonID) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }

        // Trả về chi tiết video bài học
        res.json(lesson);
    } catch (error) {
        console.error('Lỗi trong router lesson:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy bài học' });
    }
});

// Route thêm một bài học mới
router.post('/add', async (req, res) => {
    const { title, courseID } = req.body;
    try {
        const response = await LessonController.addLesson(title, courseID);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm bài học', error });
    }
});

// Route cập nhật thông tin bài học theo lessonID
router.put('/update/:lessonID', async (req, res) => {
    const { lessonID } = req.params;
    const { title, courseID } = req.body;
    try {
        const updatedLesson = await LessonController.updateLesson(lessonID, title, courseID);
        res.status(200).json(updatedLesson);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi cập nhật bài học', error });
    }
});

// Route xóa một bài học theo lessonID
router.delete('/delete/:lessonID', async (req, res) => {
    const { lessonID } = req.params;
    try {
        const deletedLesson = await LessonController.deleteLesson(lessonID);
        res.status(200).json({ message: 'Xóa bài học thành công', deletedLesson });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bài học', error });
    }
});

module.exports = router;
