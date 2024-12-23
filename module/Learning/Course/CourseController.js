const CourseModel = require('./CourseModel');
const { ErrorHandler } = require('../../errorHandler');
const removeAccents = require('remove-accents');
const PaymentModel = require('../../Payment/PaymentModel')

// Lấy tất cả khóa học
const getAll = async () => {
    try {
        return await CourseModel.find().populate('subjectID teacherID');
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách khóa học');
    }
};

// Lấy khóa học theo subjectID và chỉ lấy khóa học có isBlock = true
const getCourseBySubjectID = async (subjectID) => {
    try {
        const courses = await CourseModel.find({ subjectID, isBlock: true }).populate('teacherID');
        if (courses.length === 0) {
            throw new ErrorHandler(404, 'Không có khóa học nào thuộc subject này hoặc khóa học chưa bị khóa');
        }
        return courses;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể tìm kiếm khóa học');
    }
};

const getDetailByCourseID = async (courseID, userId) => {
    try {
        const course = await CourseModel.findById(courseID).populate('subjectID teacherID');
        if (!course) {
            throw new ErrorHandler(404, 'Không tìm thấy khóa học này');
        }

        // kiểm tra user đã mua khoá học chưa
        const payment = await PaymentModel.findOne({ userID: userId, courseID, status: 'SUCCESS' }).exec()
        if (payment) {
            return {
                ...course.toJSON(),
                isJoinedCourse: true
            }
        }

        return course;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy chi tiết khóa học');
    }
}

const getCourseByTeacherID = async (teacherID) => {
    try {
        const courses = await CourseModel.find({ teacherID }).populate('teacherID');

        // Nếu không có khóa học nào, trả về 0
        if (courses.length === 0) {
            return 0;
        }

        return courses;
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể tìm kiếm khóa học');
    }
};



// đếm tổng số kháo học

const getTotalCourseCount = async () => {
    try {
        // Đếm t��ng số khóa học
        const courseCount = await CourseModel.countDocuments();
        return { courseCount }; // Trả về số lượng khóa học (0 nếu không có)
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể đếm t��ng số khóa học');
    }
};

// Tìm kiếm khóa học theo tên
const searchCourse = async (name) => {
    try {
        const normalizedQuery = removeAccents(name);
        const courses = await CourseModel.find({
            name: {
                $regex: removeAccents(normalizedQuery),
                $options: 'i'
            }
        });
        return courses;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể tìm kiếm khóa học');
    }
};

// Thêm một khóa học mới
// Thêm một khóa học mới với isBlock mặc định là false
const addCourse = async (name, img, describe, price, subjectID, teacherID) => {
    try {
        const newCourse = new CourseModel({ name, img, describe, price, subjectID, teacherID, isBlock: false,censor: false });
        await newCourse.save();
        return { message: 'Thêm khóa học thành công', newCourse };
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể thêm khóa học');
    }
};


// Cập nhật thông tin khóa học
const updateCourse = async (courseID, name, img, describe, price, subjectID, teacherID, isBlock) => {
    try {
        // Thêm `isBlock` vào dữ liệu cần cập nhật
        const updateData = { name, img, describe, price, subjectID, teacherID };
        
        // Thực hiện cập nhật và trả về khóa học đã được cập nhật
        const course = await CourseModel.findByIdAndUpdate(courseID, updateData);
        
        if (!course) {
            throw new ErrorHandler(404, 'Khóa học không tồn tại');
        }
        
        return course;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin khóa học');
    }
};


// Xóa khóa học theo ID
const deleteCourse = async (courseID) => {
    try {
        const course = await CourseModel.findByIdAndDelete(courseID);
        if (!course) {
            throw new ErrorHandler(404, 'Khóa học không tồn tại');
        }
        return course;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể xóa khóa học');
    }
};

// đếm số lượng khóa học theo teaherID
const getCourseCountByTeacherID = async (teacherID) => {
    try {
        // Đếm số lượng khóa học của giáo viên theo teacherID
        const courseCount = await CourseModel.countDocuments({ teacherID });
        return { courseCount }; // Trả về số lượng khóa học (0 nếu không có)
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể đếm số lượng khóa học của giáo viên');
    }
};

// Đổi trạng thái isBlock của khóa học
const toggleIsBlock = async (courseID) => {
    try {
        const course = await CourseModel.findById(courseID);
        
        if (!course) {
            throw new ErrorHandler(404, 'Khóa học không tồn tại');
        }
        
        // Đảo ngược giá trị của isBlock
        course.isBlock = !course.isBlock;
        await course.save();

        return { message: 'Trạng thái khóa học đã được thay đổi', isBlock: course.isBlock };
    } catch (error) {
        console.error('Lỗi khi thay đổi trạng thái khóa học:', error);
        throw new ErrorHandler(500, 'Không thể thay đổi trạng thái khóa học');
    }
};

// Lấy tất cả khóa học có trạng thái isBlock = true
const getAllBlockedCourses = async () => {
    try {
        const courses = await CourseModel.find({ isBlock: true });
        return courses;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách khóa học bị khóa');
    }
};

// Lấy tất cả khóa học có trạng thái censor = false
const getAllCensorCourses = async () => {
    try {
        const courses = await CourseModel.find({ censor: false });
        return courses;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách khóa học chưa xét duyệt');
    }
};

module.exports = { getTotalCourseCount, getAll, getCourseBySubjectID, getCourseCountByTeacherID, getDetailByCourseID, getCourseByTeacherID, searchCourse, addCourse, updateCourse, deleteCourse, toggleIsBlock,getAllBlockedCourses,getAllCensorCourses };