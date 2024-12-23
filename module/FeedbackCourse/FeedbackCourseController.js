const FeedbackCourseModel = require('./FeedbackCourseModel');
const { ErrorHandler } = require('../errorHandler');

// Lấy tất cả phản hồi khóa học
const getAll = async () => {
    try {
        return await FeedbackCourseModel.find()
            .populate({
                path: 'feedbacks.userID', // đường dẫn tới userID trong feedbacks
                select: 'name' // chỉ lấy field 'name' từ user
            });
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách phản hồi khóa học');
    }
};


// Danh sách từ cấm
const forbiddenWords = ['cc', 'vl', 'mày', 'tao', 'mẹ', 'má', 'chó'];

// Kiểm tra nội dung chứa từ cấm
const containsForbiddenWords = (content) => {
    return forbiddenWords.some(word => content.includes(word));
};

// Thêm phản hồi
const addFeedback = async (courseID, userID, rating, content) => {
    try {
        if (containsForbiddenWords(content)) {
            throw new ErrorHandler(400, 'Nội dung chứa từ cấm.');
        }

        const feedbackCourse = await FeedbackCourseModel.findOne({ courseID });

        if (feedbackCourse) {
            const feedbackExists = feedbackCourse.feedbacks.some(feedback => feedback.userID.toString() === userID);
            if (feedbackExists) {
                throw new ErrorHandler(400, 'Người dùng đã phản hồi cho khóa học này.');
            }

            feedbackCourse.feedbacks.push({
                userID,
                feedbackDetail: {
                    rating,
                    content
                }
            });
            await feedbackCourse.save();
            return { message: 'Thêm phản hồi thành công', feedbackCourse };
        } else {
            const newFeedbackCourse = new FeedbackCourseModel({
                courseID,
                feedbacks: [{
                    userID,
                    feedbackDetail: {
                        rating,
                        content
                    }
                }]
            });
            await newFeedbackCourse.save();
            return { message: 'Thêm phản hồi thành công', newFeedbackCourse };
        }
    } catch (error) {
        throw new ErrorHandler(error.status || 500, error.message || 'Không thể thêm phản hồi');
    }
};

// Cập nhật phản hồi
const updateFeedback = async (courseID, userID, rating, content) => {
    try {
        const feedbackCourse = await FeedbackCourseModel.findOne({ courseID });

        if (!feedbackCourse) {
            throw new ErrorHandler(404, 'Khóa học không tồn tại');
        }

        const feedbackIndex = feedbackCourse.feedbacks.findIndex(feedback => feedback.userID.toString() === userID);

        if (feedbackIndex === -1) {
            throw new ErrorHandler(404, 'Phản hồi không tìm thấy');
        }

        feedbackCourse.feedbacks[feedbackIndex].feedbackDetail = {
            rating,
            content
        };
        await feedbackCourse.save();

        return { message: 'Cập nhật phản hồi thành công', feedbackCourse };
    } catch (error) {
        console.error('Error in updateFeedback:', error);
        throw new ErrorHandler(500, 'Không thể cập nhật phản hồi');
    }
};

// Xóa phản hồi
const deleteFeedback = async (courseID, userID) => {
    try {
        const feedbackCourse = await FeedbackCourseModel.findOne({ courseID });

        if (!feedbackCourse) {
            throw new ErrorHandler(404, 'Khóa học không tồn tại');
        }

        const feedbackIndex = feedbackCourse.feedbacks.findIndex(feedback => feedback.userID.toString() === userID);

        if (feedbackIndex === -1) {
            throw new ErrorHandler(404, 'Phản hồi không tìm thấy');
        }

        // Xóa phản hồi khỏi mảng feedbacks
        feedbackCourse.feedbacks.splice(feedbackIndex, 1);
        await feedbackCourse.save();

        return { message: 'Xóa phản hồi thành công', feedbackCourse };
    } catch (error) {
        console.error('Error in deleteFeedback:', error);
        throw new ErrorHandler(500, 'Không thể xóa phản hồi');
    }
};

// Lấy phản hồi theo ID khóa học
const getFeedbackByCourseID = async (courseID) => {
    try {
        const feedbackCourse = await FeedbackCourseModel.findOne({ courseID }).populate({
            path: 'feedbacks.userID', // đường dẫn tới userID trong feedbacks
            select: 'name' // chỉ lấy field 'name' từ user
        });

        if (!feedbackCourse) {
            throw new ErrorHandler(404, 'Không tìm thấy phản hồi cho khóa học này');
        }

        return feedbackCourse.feedbacks;
    } catch (error) {
        console.error('Error in getFeedbackByCourseID:', error);
        throw new ErrorHandler(500, 'Không thể lấy phản hồi theo khóa học');
    }
};

// Lấy phản hồi theo ID người dùng
const getFeedbackByUserID = async (userID) => {
    try {
        const feedbackCourses = await FeedbackCourseModel.find({ 'feedbacks.userID': userID });

        if (feedbackCourses.length === 0) {
            throw new ErrorHandler(404, 'Không tìm thấy phản hồi cho người dùng này');
        }

        return feedbackCourses.map(course => ({
            courseID: course.courseID,
            feedbacks: course.feedbacks.filter(feedback => feedback.userID.toString() === userID)
        }));
    } catch (error) {
        console.error('Error in getFeedbackByUserID:', error);
        throw new ErrorHandler(500, 'Không thể lấy phản hồi theo người dùng');
    }
};

// đếm số lượt feedback
const getCountFeedbackByCourseID = async (courseID) => {
    try {
        const feedbackCourse = await FeedbackCourseModel.findOne({ courseID });

        if (!feedbackCourse) {
            throw new ErrorHandler(404, 'Không tìm thấy phản hồi cho khóa học này');
        }

        return feedbackCourse.feedbacks.length;
    } catch (error) {
        console.error('Error in getCountFeedbackByCourseID:', error);
        throw new ErrorHandler(500, 'Không thể đếm số lượt feedback');
    }
};

// tính trung bình rating 
    const calculateAverageRating = async (courseID) => {
    try {
        const feedbackCourse = await FeedbackCourseModel.findOne({ courseID });

        if (!feedbackCourse) {
            throw new ErrorHandler(404, 'Không tìm thấy phản hồi cho khóa học này');
        }

        const totalRating = feedbackCourse.feedbacks.reduce((sum, feedback) => sum + feedback.feedbackDetail.rating, 0);
        const countFeedback = feedbackCourse.feedbacks.length;

        return totalRating / countFeedback;
    } catch (error) {
        console.error('Error in calculateAverageRating:', error);
        throw new ErrorHandler(500, 'Không thể tính trung bình rating');
    }
};

module.exports = {
    getAll,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackByCourseID,
    getFeedbackByUserID,
    getCountFeedbackByCourseID,
    calculateAverageRating
};
