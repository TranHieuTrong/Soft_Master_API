var express = require('express');
var router = express.Router();
const SubjectController = require('../module/Learning/Subject/SubjectController');

// Lấy danh sách subjects
router.get('/getAll', async (req, res) => {
    try {
        const subjects = await SubjectController.getAll();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Lỗi khi lấy danh sách subjects' });
    }
});

router.post('/add', async (req, res) => {
    const { name, img } = req.body;
    try {
        const response = await SubjectController.addSubject(name, img);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Lỗi khi thêm subject' });
    }
});

// Cập nhật subject
router.put('/update/:subjectID', async (req, res) => {
    const { subjectID } = req.params;
    const { name, img } = req.body;
    try {
        const updatedSubject = await SubjectController.updateSubject(subjectID, name, img);
        res.status(200).json(updatedSubject);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi cập nhật subject' });
    }
});

// Xóa subject
router.delete('/delete/:subjectID', async (req, res) => {
    const { subjectID } = req.params;
    try {
        await SubjectController.deleteSubject(subjectID);
        res.status(200).json({ message: 'Subject đã được xóa' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi xóa subject' });
    }
});

module.exports = router;
