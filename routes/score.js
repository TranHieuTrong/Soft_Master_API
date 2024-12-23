const express = require('express');
const router = express.Router();
const { addScore, getPoint, getAllScores, getScoreByUserID, getPointByTestIDAndUserID,canTakeTest, getScoreByTestID } = require('../module/Quiz/Score/ScoreController');

// Route liên quan đến điểm số
router.post('/addScore', addScore); // Thêm hoặc cập nhật điểm
router.get('/getPoint/:userID/:testID', getPoint); // Lấy điểm người dùng
router.get('/getAll', getAllScores); 
router.get('/getScoreByUserID/:userID', getScoreByUserID);
router.get('/getPointByTestIDAndUserID/:userID/:testID', getPointByTestIDAndUserID); // admin
// Route kiểm tra điều kiện làm bài kiểm tra
router.get('/scores/canTakeTest/:userID/:testID', canTakeTest);
// lấy điểm của bài test
router.get('/getScoreByTestID/:userID/:testID', getScoreByTestID);


module.exports = router;
