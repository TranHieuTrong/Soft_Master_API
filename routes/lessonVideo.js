const express = require('express');
const router = express.Router();
const LessonVideoController = require('../module/Learning/LessonVideo/LessonVideoController');

// Route lấy tất cả các bài học
router.get('/getAll', async (req, res) => {
    try {
        const lessonVideos = await LessonVideoController.getAll();
        res.status(200).json(lessonVideos);
    } catch (error) {
        console.error('Lỗi khi lấy tất cả bài học:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài học', error: error.message });
    }
});

// Route lấy danh sách video bài học theo lessonID
router.get('/getLessonVideoByLessonID/:lessonID', async (req, res) => {
    const { lessonID } = req.params;
    try {
        const lessonVideos = await LessonVideoController.getLessonVideoByLessonID(lessonID);
        res.status(200).json(lessonVideos);
    } catch (error) {
        console.error('Lỗi khi lấy video theo lessonID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy bài học theo lessonID', error: error.message });
    }
});

// Định nghĩa route lấy thông tin chi tiết video bài học theo ID
router.get('/getDetail/:lessonVideoID', async (req, res) => {
    const { lessonVideoID } = req.params;
    try {
        const lessonVideo = await LessonVideoController.getDetailLessonVideo(lessonVideoID);
        if (!lessonVideo) {
            return res.status(404).json({ message: 'Không tìm thấy video bài học' });
        }
        res.status(200).json(lessonVideo);
    } catch (error) {
        console.error('Lỗi trong router getDetailLessonVideo:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy video bài học', error: error.message });
    }
});

// Route thêm một bài học mới
router.post('/add', async (req, res) => {
    const { title, video, lessonID } = req.body;
    if (!title || !video) {
        return res.status(400).json({ message: 'Thiếu title hoặc video' });
    }
    try {
        const newLessonVideo = await LessonVideoController.addLessonVideo(title, video, lessonID);
        res.status(201).json(newLessonVideo);
    } catch (error) {
        console.error('Lỗi khi thêm bài học:', error);
        res.status(500).json({ message: 'Lỗi khi thêm bài học', error: error.message });
    }
});

// Route cập nhật thông tin video bài học theo ID
router.put('/update/:lessonVideoID', async (req, res) => {
    const { lessonVideoID } = req.params;
    const { title, video, lessonID } = req.body;
    try {
        const updatedLessonVideo = await LessonVideoController.updateLessonVideo(lessonVideoID, title, video, lessonID);
        res.status(200).json(updatedLessonVideo);
    } catch (error) {
        console.error('Lỗi khi cập nhật bài học:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi cập nhật bài học', error: error.message });
    }
});

// Route xóa video bài học theo ID
router.delete('/delete/:lessonVideoID', async (req, res) => {
    const { lessonVideoID } = req.params;
    try {
        const deletedLessonVideo = await LessonVideoController.deleteLessonVideo(lessonVideoID);
        res.status(200).json({ message: 'Xóa video bài học thành công', deletedLessonVideo });
    } catch (error) {
        console.error('Lỗi khi xóa bài học:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài học', error: error.message });
    }
});

module.exports = router;