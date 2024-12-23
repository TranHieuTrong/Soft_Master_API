const express = require('express');
const router = express.Router();
const AdminController = require('../module/People/Amin/AdminController');

// Lấy danh sách admin
router.get('/getAll', async (req, res) => {
    try {
        const admins = await AdminController.getAll();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách admin', error });
    }
});

// Lấy thông tin admin theo ID
router.get('/getAdminByID/:adminID', async (req, res) => {
    const { adminID } = req.params;
    try {
        const admin = await AdminController.getAdminByID(adminID);
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin admin', error });
    }
});

// đếm tổng admin
// http://localhost:3001/admin/countAdmin
router.get('/countAdmin', async (req, res) => {
    try {
        const count = await AdminController.getTotalAdmins();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'L��i khi đếm số admin', error });
    }
});

// Đăng ký admin
router.post('/register', async (req, res) => {
    const { name, email, phone, password, avatar, position, gender } = req.body;
    try {
        const response = await AdminController.register(name, email, phone, avatar, password, position, gender);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng ký admin', error });
    }
});

// Đăng nhập admin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await AdminController.login(email, password);
        res.status(200).json({ message: 'Đăng nhập thành công', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng nhập', error });
    }
});

// Cập nhật thông tin admin
router.put('/update/:adminID', async (req, res) => {
    const { adminID } = req.params;
    const { name, phone, password, avatar, position, gender } = req.body;
    try {
        const user = await AdminController.updateAdmin(adminID, name, phone, password, avatar, position, gender);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin admin', error });
    }
});

// Xóa admin
router.delete('/delete/:adminID', async (req, res) => {
    const { adminID } = req.params;
    try {
        await AdminController.deleteAdmin(adminID);
        res.status(200).json({ message: 'Admin đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa admin', error });
    }
});

// Đường dẫn cho quên mật khẩu
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body; 
    try {
        const result = await AdminController.forgotPassword(email);
        return res.status(200).json(result); // Trả về kết quả nếu gửi mã OTP thành công
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message }); // Trả về lỗi nếu có
    }
});

// Đường dẫn cho xác minh OTP
router.post('/verify-otp/:adminID', async (req, res) => {
    const { adminID } = req.params; // Lấy adminID từ tham số URL
    const { otp } = req.body; // Lấy OTP từ body của yêu cầu
    try {
        const result = await AdminController.verifyOTP(adminID, otp);
        return res.status(200).json(result); // Trả về kết quả nếu xác minh OTP thành công
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message }); // Trả về lỗi nếu có
    }
});

// Đường dẫn cho đặt lại mật khẩu
router.post('/reset-password/:adminID', async (req, res) => {
    const { adminID } = req.params; // Lấy adminID từ tham số URL
    const { newPassword } = req.body; // Lấy mật khẩu mới từ body của yêu cầu
    try {
        const result = await AdminController.resetPassword(adminID, newPassword);
        return res.status(200).json(result); // Trả về kết quả nếu cập nhật mật khẩu thành công
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message }); // Trả về lỗi nếu có
    }
});

// filter theo name email phone
router.post('/filter', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const admins = await AdminController.filterAdmins(name, email, phone);
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'loi khi lọc user', error });
    }
});

module.exports = router;