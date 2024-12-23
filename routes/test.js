var express = require('express');
var router = express.Router();
const TestController = require('../module/Quiz/Test/TestController');

// Lấy danh sách Tests
router.get('/getAll', async (req, res) => {
    try {
        const test = await TestController.getAll();
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Lỗi khi lấy danh sách Tests' });
    }
});

//http://localhost:3001/test/getTestByLessonID/:lessonID
router.get('/getTestByLessonID/:lessonID', async (req, res) => {
    const { lessonID } = req.params;
    try {
        const test = await TestController.getTestByLessonID(lessonID);
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message || 'L��i khi lấy Test theo lessonID' });
    }
});

router.post('/add', async (req, res) => {
    const { title, lessonID } = req.body;
    try {
        const response = await TestController.addTest(title, lessonID);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Lỗi khi thêm Test' });
    }
});

// Cập nhật Test
router.put('/update/:testID', async (req, res) => {
    const { testID } = req.params;
    const { title, lessonID } = req.body;
    try {
        const updatedTest = await TestController.updateTest(testID, title, lessonID);
        res.status(200).json(updatedTest);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi cập nhật Test' });
    }
});

// Xóa Test
router.delete('/delete/:testID', async (req, res) => {
    const { testID } = req.params;
    try {
        await TestController.deleteTest(testID);
        res.status(200).json({ message: 'Test đã được xóa' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi xóa Test' });
    }
});

module.exports = router;
