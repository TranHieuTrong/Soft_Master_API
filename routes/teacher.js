const express = require('express');
const router = express.Router();
const TeacherController = require('../module/People/Teacher/TeacherController');

// Lấy danh sách teachers
router.get('/getAll', async (req, res) => {
    try {
        const teachers = await TeacherController.getAll();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách teacher', error });
    }
});

// lấy getAll teacher với điều kiện isBlocked = true
router.get('/getLockedTeachers', async (req, res) => {
    try {
        const teachers = await TeacherController.getLockedTeachers();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'lõi khi lấy danh sách giáo viên đang hd', error });
    }
});

// get total teacher count
router.get('/countTeacher', async (req, res) => {
    try {
        const count = await TeacherController.getTotalTeachers();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'L��i khi đếm số teacher', error });
    }
});

// Lấy thông tin người dùng theo userID
router.get('/getTeacherByID/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        const teacher = await TeacherController.getTeacherByID(teacherID);
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin teacher', error });
    }
});

router.post('/register/:creatorID', async (req, res) => {
    const { creatorID } = req.params; // Lấy creatorID từ URL params
    const { name, email, phone, password, avatar, major, slogan, gender } = req.body;

    try {
        const response = await TeacherController.register(name, email, phone, password, avatar, major, slogan, gender, creatorID);
        res.status(201).json(response);
    } catch (error) {
        console.log('Lỗi:', error.message); // Ghi lại thông báo lỗi cụ thể
        res.status(500).json({ message: 'Lỗi khi đăng ký giáo viên', error: error.message });
    }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const teacher = await TeacherController.login(email, password);
        res.status(200).json({ message: 'Đăng nhập thành công', teacher });
    } catch (error) {
        // Phân biệt lỗi "tài khoản bị khóa" với lỗi khác
        const errorMessage = error.message || 'Lỗi khi đăng nhập';
        const statusCode = error.message.includes('Tài khoản đã bị khóa') ? 403 : 401;
        res.status(statusCode).json({ message: errorMessage });
    }
});


// Cập nhật thông tin người dùng
router.put('/update/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    const { name, phone, avatar, password, major, slogan, gender } = req.body;
    try {
        // Gọi hàm cập nhật thông tin người dùng
        const teacher = await TeacherController.updateTeacher(teacherID, name, phone, password, avatar, major, slogan, gender);
        res.status(200).json(teacher);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});


// Xóa người dùng
router.delete('/delete/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    try {
        await TeacherController.deleteTeacher(teacherID);
        res.status(200).json({ message: 'Người dùng đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa người dùng', error });
    }
});

// Khôi phục mật khẩu
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const response = await TeacherController.forgotPassword(email);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Xác minh OTP khôi phục mật khẩu
router.post('/verify-otp-forgotpass/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    const { otp } = req.body;
    try {
        const response = await TeacherController.verifyOTP(teacherID, otp);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Cập nhật mật khẩu
router.put('/reset-password/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    const { newPassword } = req.body;
    try {
        const response = await TeacherController.resetPassword(teacherID, newPassword);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// filter theo name email phone
router.post('/filter', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const teachers = await TeacherController.filterTeachers(name, email, phone);
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'loi khi lọc teacher', error });
    }
});

// đổi status từ true thành failed và ngược lại để kích hoạt accout

// router.put('/change-status/:teacherID', async (req, res) => {
//     const { teacherID } = req.params;
//     try {
//         const response = await TeacherController.toggleIsLocked(teacherID);
//         res.status(200).json(response);
//     } catch (error) {
//         res.status(error.statusCode || 500).json({ message: error.message });
//     }
// });

// Route để khóa hoặc mở khóa tài khoản giáo viên
// Route để khóa hoặc mở khóa tài khoản giáo viên
router.post('/change-status/:teacherID', async (req, res) => {
    // Log thông tin yêu cầu
    console.log('--- Request Info ---');
    console.log('Request URL:', req.originalUrl); // Log URL yêu cầu
    console.log('Request Method:', req.method); // Log method
    console.log('Request Params:', req.params); // Log teacherID từ URL
    console.log('Request Body:', req.body); // Log dữ liệu từ body
    console.log('---------------------');

    try {
        const { teacherID } = req.params; // Lấy teacherID từ params
        const { reason } = req.body; // Lấy lý do từ body request

        // Gọi controller xử lý logic
        const result = await TeacherController.toggleIsLocked(teacherID, reason);

        // Log kết quả xử lý từ controller
        console.log('Kết quả:', result);

        return res.status(200).json({
            success: true,
            message: result.message,
            isLocked: result.isLocked,
        });

    } catch (error) {
        // Log lỗi chi tiết để debug
        console.error('Lỗi xảy ra trong router /change-status:', error);

        // Xử lý lỗi trả về cho client
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi thay đổi trạng thái tài khoản',
        });
    }
});


router.get('/check-follow/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    const userID = req.user ? req.user.id : null; // Lấy userID từ req.user sau xác thực

    if (!userID) {
        return res.status(400).json({ message: 'Thiếu userID để kiểm tra trạng thái follow' });
    }

    try {
        const isFollowed = await TeacherController.isFollowedTeacher(teacherID, userID);
        res.status(200).json({ isFollowed });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});


module.exports = router;
