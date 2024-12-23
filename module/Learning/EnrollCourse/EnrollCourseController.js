const EnrollCourse = require('./EnrollCourseModel');

const enrollUserInCourse = async (userID, courseID) => {
    try {
        const existingEnrollment = await EnrollCourse.findOne({ userID, courseID });

        if (existingEnrollment) {
            throw new Error('Người dùng đã đăng ký khóa học này rồi.');
        }

        const newEnrollment = new EnrollCourse({ userID, courseID });
        await newEnrollment.save();
        console.log('Đăng ký khóa học thành công.');

        return newEnrollment;
    } catch (error) {
        console.error('Lỗi khi đăng ký khóa học:', error.message);
        throw error;
    }
}

// Hàm kiểm tra sinh viên đã đăng ký khóa học chưa
const checkStudentEnrollment = async (userID, courseID) => {
    try {
        // Kiểm tra xem có bản ghi nào với userID và courseID không
        const enrollment = await EnrollCourse.findOne({ userID, courseID });

        if (enrollment) { // nếu tìm thấy thì trả về thông báo đã đăng ký
            console.log('Sinh viên đã đăng ký khóa học này rồi.');
            return { enrolled: true, message: 'Sinh viên đã đăng ký khóa học này rồi.' };
        } else { // nếu không tìm thấy thì trả về thông báo chưa đăng ký
            console.log('Sinh viên chưa đăng ký khóa học này.');
            return { enrolled: false, message: 'Sinh viên chưa đăng ký khóa học này.' };
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái đăng ký:', error.message);
        throw error;
    }
}

// Hiển thị danh sách sinh viên tham gia khóa học
const getUserEnrolledInCourse = async (courseID) => {
    try {
        // Lấy tất cả các sinh viên đã đăng ký khóa học theo courseID
        const enrollments = await EnrollCourse.find({ courseID })
            .populate('userID', '_id name email'); // Populated để lấy thông tin của sinh viên

        if (enrollments.length === 0) {
            console.log('Chưa có sinh viên nào đăng ký khóa học này.');
            return { enrolledStudents: [], message: 'Chưa có sinh viên nào đăng ký khóa học này.' };
        }

        // Trả về danh sách sinh viên đã đăng ký khóa học
        console.log('Danh sách sinh viên đã đăng ký khóa học:', enrollments);
        return {
            enrolledStudents: enrollments.map(enrollment => ({
                userID: enrollment.userID._id,
                name: enrollment.userID.name,
                email: enrollment.userID.email
            })),
            message: 'Danh sách sinh viên đã đăng ký khóa học.'
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sinh viên đã đăng ký khóa học:', error.message);
        throw error;
    }
}

// dùng populate tham chiếu get course user đã đăng ký
const getCourseUserEnrolled = async (userID) => {
    try {
        const enrollments = await EnrollCourse.find({ userID })
            .populate('courseID', '_id name');
        return enrollments; // trả về danh sách khóa học đã đăng ký
    } catch (error) {
        console.error('Lỗi khi lấy khóa học đã đăng ký:', error.message);
        throw error;
    }
}

// đếm số người tham gia 1 khóa học đó
const countUsersEnrolledInCourse = async (courseID) => {
    try {
        const count = await EnrollCourse.countDocuments({ courseID });
        return count;
    } catch (error) {
        console.error('loi khi đếm số người tham gia khóa học:', error.message);
        throw error;
    }
}

module.exports = {
    enrollUserInCourse, checkStudentEnrollment, getCourseUserEnrolled, countUsersEnrolledInCourse,
    getUserEnrolledInCourse
 };
