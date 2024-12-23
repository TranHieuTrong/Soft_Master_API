const LessonVideoModel = require('./LessonVideoModel');
const { ErrorHandler } = require('../../errorHandler');

// Lấy tất cả các video bài học
const getAll = async () => {
    try {
        // Tìm tất cả các video bài học
        return await LessonVideoModel.find().populate('lessonID'); // T dùng populate để lấy thông tin chi tiết của lessonID nếu có
    } catch (error) {
        console.error('Lỗi trong getAll:', error);
        throw new ErrorHandler(500, 'Không thể lấy danh sách bài học');
    }
};

// Lấy danh sách video theo lessonID
const getLessonVideoByLessonID = async (lessonID) => {
    try {
        const lessonVideos = await LessonVideoModel.find({ lessonID }).populate('lessonID');
        return lessonVideos;
    } catch (error) {
        console.error('Lỗi trong getLessonVideoByLessonID:', error);
        throw new ErrorHandler(500, 'Không thể lấy video bài học theo lessonID');
    }
};

// Lấy chi tiết video bài học theo ID
const getDetailLessonVideo = async (lessonVideoID) => {
    try {
        const lessonVideo = await LessonVideoModel.findById(lessonVideoID).populate('lessonID');

        if (!lessonVideo) {
            throw new ErrorHandler(404, 'Video bài học không tồn tại');
        }

        return lessonVideo;
    } catch (error) {
        console.error('Lỗi trong getDetailLessonVideo:', error);
        throw new ErrorHandler(500, 'Không thể lấy chi tiết video bài học');
    }
};

// Thêm video bài học mới
const addLessonVideo = async (title, video, lessonID) => {
    try {
        const newLessonVideo = new LessonVideoModel({
            title,
            video,
            lessonID
        });

        await newLessonVideo.save();

        return { message: 'Thêm video bài học thành công', newLessonVideo };
    } catch (error) {
        console.error('Lỗi trong addLessonVideo:', error);
        throw new ErrorHandler(500, 'Không thể thêm video bài học');
    }
};

// Cập nhật thông tin video bài học
const updateLessonVideo = async (lessonVideoID, title, video, lessonID) => {
    try {
        const updateData = { title, video, lessonID };
        const lessonVideo = await LessonVideoModel.findByIdAndUpdate(lessonVideoID, updateData, { new: true });

        if (!lessonVideo) {
            throw new ErrorHandler(404, 'Video bài học không tồn tại');
        }
        return lessonVideo;
    } catch (error) {
        console.error('Lỗi trong updateLessonVideo:', error);
        throw new ErrorHandler(500, 'Không thể cập nhật video bài học');
    }
};

// Xóa video bài học theo ID
const deleteLessonVideo = async (lessonVideoID) => {
    try {
        const lessonVideo = await LessonVideoModel.findByIdAndDelete(lessonVideoID);

        if (!lessonVideo) {
            throw new ErrorHandler(404, 'Video bài học không tồn tại');
        }

        return { message: 'Xóa video bài học thành công', lessonVideo };
    } catch (error) {
        console.error('Lỗi trong deleteLessonVideo:', error);
        throw new ErrorHandler(500, 'Không thể xóa video bài học');
    }
};

module.exports = { getAll, getLessonVideoByLessonID, getDetailLessonVideo, addLessonVideo, updateLessonVideo, deleteLessonVideo };
