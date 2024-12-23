const express = require('express');
const router = express.Router();
const FavoriteCourseController = require('../module/Follow/FavoriteCourse/FavoriteCourseController');

router.post('/favorite/:userID', async (req, res) => {
    const { userID } = req.params; 
    const { courseID } = req.body; 
    try {
        const response = await FavoriteCourseController.favoriteCourse(userID, courseID);
        res.status(201).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.post('/unfavorite/:userID', async (req, res) => {
    const { userID } = req.params;
    const { courseID } = req.body; 
    try {
        const response = await FavoriteCourseController.unFavoriteCourse(userID, courseID);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

router.get('/getFavoriteCourseByUserID/:userID', async (req, res) => {
    const { userID } = req.params;
    try {
        const response = await FavoriteCourseController.getFavoriteCourseByUserID(userID);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

module.exports = router;
