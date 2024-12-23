const FavoriteCourseModel = require('./FavoriteCourseModel');
const { ErrorHandler } = require('../../errorHandler');

const favoriteCourse = async (userID, courseID) => {
    try {
        const favorite = await FavoriteCourseModel.findOne({ userID, courseID });

        if (favorite) {
            throw new ErrorHandler(400, 'Khóa học này đã được đánh dấu yêu thích rồi');
        }

        await new FavoriteCourseModel({ userID, courseID }).save();

        return { message: 'Khóa học đã được đánh dấu yêu thích thành công' };
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể đánh dấu khóa học yêu thích');
    }
};

const getFavoriteCourseByUserID = async (userID) => {
    try {
        const favoriteCourse = await FavoriteCourseModel.find({ userID }).populate('courseID');
        return favoriteCourse;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách khóa học yêu thích');
    }
};

const unFavoriteCourse = async (userID, courseID) => {
    try {
        const favoriteCourse = await FavoriteCourseModel.findOneAndDelete({ userID, courseID });
        if (!favoriteCourse) {
            throw new ErrorHandler(404, 'Theo dõi không tồn tại');
        }
        return { message: 'Xóa theo dõi thành công', favoriteCourse };
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể xóa theo dõi');
    }
};

module.exports = { favoriteCourse, getFavoriteCourseByUserID, unFavoriteCourse };
