const AdminModel = require('./AdminModel');
const bcrypt = require('bcrypt');
const { ErrorHandler } = require('../../errorHandler');
const sendEmail = require('../../mailer');

// Bộ nhớ tạm thời để lưu thông tin người dùng trước khi xác minh OTP
const tempStore = {};

// Hàm tạo mã OTP ngẫu nhiên
const generateOTP = (length = 6) => {
    const characters = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
};

const getAll = async () => {
    try {
        return await AdminModel.find();
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách admin');
    }
};

const getAdminByID = async (adminID) => {
    try {
        const admin = await AdminModel.findById(adminID);
        if (!admin) {
            throw new ErrorHandler(404, 'Admin không tồn tại');
        }
        return admin;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin admin:', error);
        throw new ErrorHandler(500, 'Lỗi khi lấy thông tin admin');
    }
};

// đếm tổng admin

const getTotalAdmins = async () => {
    try {
        const count = await AdminModel.countDocuments();
        return count;
    } catch (error) {
        console.error('L��i khi đếm t��ng số admin:', error);
        throw new ErrorHandler(500, 'Không thể đếm t��ng số admin');
    }
};

const register = async (name, email, phone, avatar, password, position, gender) => {
    try {
        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) {
            throw new ErrorHandler(400, 'Email đã được sử dụng');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (gender !== 'Nam' && gender !== 'Nữ') {
            throw new ErrorHandler(400, 'Giới tính không hợp lệ, chỉ chấp nhận Nam hoặc Nữ');
        }

        const newAdmin = new AdminModel({
            name,
            email,
            phone,
            avatar,
            password: hashedPassword,
            position,
            gender
        });

        await newAdmin.save();
        return { message: 'Đăng ký thành công' };
    } catch (error) {
        console.error('Lỗi khi đăng ký admin:', error.message);
        throw new ErrorHandler(500, 'Không thể đăng ký admin');
    }
};

const login = async (email, password) => {
    try {
        const admin = await AdminModel.findOne({ email });
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            throw new ErrorHandler(400, 'Email hoặc mật khẩu không đúng');
        }
        return admin;
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể đăng nhập');
    }
};

const updateAdmin = async (adminID, name, phone, password, avatar, position, gender) => {
    try {
        const updateData = { name, phone, position, gender };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }

        const admin = await AdminModel.findByIdAndUpdate(adminID, updateData, { new: true });
        if (!admin) {
            throw new ErrorHandler(404, 'Tài khoản không tồn tại');
        }
        return admin;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin tài khoản');
    }
};

const deleteAdmin = async (adminID) => {
    try {
        const admin = await AdminModel.findByIdAndDelete(adminID);
        if (!admin) {
            throw new ErrorHandler(404, 'Admin không tồn tại');
        }
        return admin;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể xóa người dùng');
    }
};

const forgotPassword = async (email) => {
    try {
        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            throw new ErrorHandler(404, 'Email không tồn tại');
        }

        const otp = generateOTP();
        tempStore[email] = { otp, adminID: admin._id };

        const subject = 'Mã OTP khôi phục mật khẩu Website SoftMaster';
        const html = `
            <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                    <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #4B0082;">Chào ${admin.name}</h1>
                    <p style="font-size: 16px;">Bạn đã yêu cầu khôi phục mật khẩu với email ${email}.</p>
                    <p style="font-size: 16px;">Mã OTP của bạn là: <strong>${otp}</strong></p>
              </div>
              <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Mã OTP của bạn sẽ hết hạn sau 10 phút.</div>
            </div>
        `;

        await sendEmail(email, subject, html);

        return { message: 'Mã OTP đã được gửi đến email của bạn', adminID: admin._id };
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể gửi mã OTP');
    }
};

const verifyOTP = async (adminID, otp) => {
    try {
        const email = Object.keys(tempStore).find(key => tempStore[key].adminID.toString() === adminID.toString());
        if (!email) {
            throw new ErrorHandler(404, 'Thông tin không hợp lệ');
        }

        const adminData = tempStore[email];

        // Kiểm tra mã OTP
        if (adminData.otp !== otp) {
            throw new ErrorHandler(400, 'OTP không hợp lệ');
        }

        const currentTime = new Date();
        if (adminData.otpExpiration < currentTime) {
            delete tempStore[email]; // Xóa OTP nếu hết hạn
            throw new ErrorHandler(400, 'OTP đã hết hạn');
        }

        // Nếu OTP hợp lệ và chưa hết hạn, xóa khỏi tempStore để không bị truy cập lại
        delete tempStore[email];

        return { message: 'Xác minh OTP thành công', adminID: adminData.adminID };
    } catch (error) {
        console.error('Lỗi khi xác minh OTP:', error);
        throw new ErrorHandler(500, 'Lỗi khi xác minh OTP');
    }
};

const resetPassword = async (adminID, newPassword) => {
    try {
        // Kiểm tra admin trong cơ sở dữ liệu
        const admin = await AdminModel.findById(adminID);
        if (!admin) {
            throw new ErrorHandler(404, 'Admin không tồn tại');
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu mới vào cơ sở dữ liệu
        const updatedAdmin = await AdminModel.findByIdAndUpdate(adminID, { password: hashedPassword }, { new: true });

        if (!updatedAdmin) {
            throw new ErrorHandler(404, 'Admin không tồn tại');
        }

        return { message: 'Mật khẩu đã được cập nhật thành công' };
    } catch (error) {
        console.error('Lỗi khi cập nhật mật khẩu:', error);
        throw new ErrorHandler(500, 'Lỗi khi cập nhật mật khẩu');
    }
};


// filter theo name email phone
const filterAdmins = async (name, email, phone) => {
    try {
        // Lấy tất cả admin từ cơ sở dữ liệu
        const admins = await AdminModel.find();

        // Lọc danh sách user theo các tiêu chí name, email, phone
        return admins.filter(admin =>
            (name ? admin.name.toLowerCase().includes(name.toLowerCase()) : true) &&
            (email ? admin.email.toLowerCase().includes(email.toLowerCase()) : true) &&
            (phone ? admin.phone.toLowerCase().includes(phone.toLowerCase()) : true)
        );
    } catch (error) {
        console.log("Lỗi rồi:", error);
        return []; // trả về mảng rỗng nếu có lỗi
    }
};

module.exports = {
    getAll, getAdminByID, getTotalAdmins, register, login, updateAdmin, deleteAdmin, forgotPassword, verifyOTP, resetPassword,
    filterAdmins
 };