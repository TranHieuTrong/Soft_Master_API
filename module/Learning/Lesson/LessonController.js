const LessonModel = require('./LessonModel');
const { ErrorHandler } = require('../../errorHandler');

// Lấy tất cả các bài học
const getAll = async () => {
    try {
        return await LessonModel.find();
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách bài học');
    }
};

// Lấy bài học theo courseID
const getLessonByCourseID = async (courseID) => {
    try {
        const lesson = await LessonModel.find({ courseID });
        return lesson;
    } catch (error) {
        console.error('Lỗi trong getLessonByCourseID:', error);
        throw new ErrorHandler(500, 'Không thể lấy bài học theo courseID');
    }
};

// get details lesson
const getDetailLesson = async (lessonID) => {
    try {
        const lesson = await LessonModel.findById(lessonID);

        if (!lesson) {
            return null;
        }

        return lesson;
    } catch (error) {
        console.error('Lỗi trong lesson:', error);
        throw new ErrorHandler(500, 'Không thể lấy video bài học theo lessonID');
    }
};

// Thêm một bài học mới
const addLesson = async (title, courseID) => {
    try {
        const newLesson = new LessonModel({
            title, courseID
        });

        await newLesson.save();

        return { message: 'Thêm bài học thành công', newLesson };
    } catch (error) {
        console.error('Lỗi trong addLesson:', error);
        throw new ErrorHandler(500, 'Không thể thêm bài học');
    }
};

// Cập nhật thông tin bài học
const updateLesson = async (lessonID, title, courseID) => {
    try {
        const updateData = { title, courseID };
        const lesson = await LessonModel.findByIdAndUpdate(lessonID, updateData, { new: true });

        if (!lesson) {
            throw new ErrorHandler(404, 'Bài học không tồn tại');
        }
        return lesson;
    } catch (error) {
        console.error('Lỗi trong updateLesson:', error);
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin bài học');
    }
};

// Xóa bài học theo ID
const deleteLesson = async (lessonID) => {
    try {
        const lesson = await LessonModel.findByIdAndDelete(lessonID);

        if (!lesson) {
            throw new ErrorHandler(404, 'Bài học không tồn tại');
        }

        return lesson;
    } catch (error) {
        console.error('Lỗi trong deleteLesson:', error);
        throw new ErrorHandler(500, 'Không thể xóa bài học');
    }
};

module.exports = { getAll, getLessonByCourseID, getDetailLesson, addLesson, updateLesson, deleteLesson };
