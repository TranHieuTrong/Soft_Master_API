const TeacherModel = require('./TeacherModel');
const bcrypt = require('bcrypt');
const { ErrorHandler } = require('../../errorHandler');
const sendEmail = require('../../mailer');
const mongoose = require('mongoose');

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
        return await TeacherModel.find();
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách giáo viên');
    }
};

// lấy getAll teacher với điều kiện isBlocked = true
const getLockedTeachers = async () => {
    try {
        const allTeachers = await TeacherModel.find({ isLocked: true });
        return allTeachers;
    } catch (error) {
        console.error('lõi khi lấy danh sách giáo viên đang hd:', error);
        throw new ErrorHandler(500, 'lõi khi lấy danh sách giáo viên đang hd');
    }
};

const getTeacherByID = async (teacherID) => {
    try {
        const teacher = await TeacherModel.findById(teacherID);

        if (!teacher) {
            throw new ErrorHandler(404, 'Giáo viên không tồn tại');
        }

        return teacher;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin teacher:', error);
        throw new ErrorHandler(500, 'Lỗi khi lấy thông tin teacher');
    }
};

// get total teacher count
const getTotalTeachers = async () => {
    try {
        const count = await TeacherModel.countDocuments();
        return count;
    } catch (error) {
        console.error('loi khi đếm tong số giáo viên:', error);
        throw new ErrorHandler(500, 'loi khi đếm tong số giáo viên');
    }
};

const register = async (name, email, phone, password, avatar, major, slogan, gender, creatorID) => {
    try {
        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingTeacher = await TeacherModel.findOne({ email });
        if (existingTeacher) {
            throw new ErrorHandler(400, 'Email đã được sử dụng');
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Kiểm tra giá trị giới tính
        if (gender !== undefined && (gender !== 'Nam' && gender !== 'Nữ')) {
            throw new ErrorHandler(400, 'Giới tính không hợp lệ, chỉ chấp nhận Nam hoặc Nữ');
        }

        // Kiểm tra xem creatorID có tồn tại không
        if (!creatorID) {
            throw new ErrorHandler(400, 'creatorID không được để trống');
        }

        // Tạo giáo viên mới
        const newTeacher = new TeacherModel({
            name,
            email,
            phone,
            password: hashedPassword,
            avatar,
            major,
            slogan,
            gender,
            creatorID
        });

        await newTeacher.save();

        // Gửi email xác nhận
        const subject = 'Xác nhận đăng ký tài khoản SoftMaster';
        const html = `
            <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
                <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                    <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #4B0082;">Xin chào ${name},</h1>
                    <p style="font-size: 16px;">Tài khoản của bạn đã được tạo thành công trên hệ thống SoftMaster.</p>
                    <p style="font-size: 16px;">Bạn có thể đăng nhập vào tài khoản của mình để sử dụng các dịch vụ của chúng tôi.</p>
                    <a href="#">Xác nhận tài khoản</a>
                </div>
                <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</div>
            </div>
        `;

        await sendEmail(email, subject, html);

        return { message: 'Đăng ký thành công và email xác nhận đã được gửi', newTeacher };
    } catch (error) {
        console.log('Lỗi:', error.message);
        throw new ErrorHandler(500, 'Không thể đăng ký giáo viên');
    }
};


// const login = async (email, password) => {
//     try {
//         const teacher = await TeacherModel.findOne({ email });

//         if (!teacher) {
//             throw new Error('Email không tồn tại');
//         }

//         // Kiểm tra trạng thái isLocked
//         if (!teacher.isLocked) {
//             throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ với admin để được hỗ trợ.');
//         }

//         // Kiểm tra mật khẩu
//         const isPasswordMatch = await bcrypt.compare(password, teacher.password);
//         if (!isPasswordMatch) {
//             throw new Error('Mật khẩu không chính xác');
//         }

//         // Nếu thành công, trả về thông tin giáo viên hoặc token đăng nhập
//         return { message: 'Đăng nhập thành công', teacher };
//     } catch (error) {
//         console.error('Lỗi đăng nhập:', error.message);
//         throw new Error(error.message); // trả về lỗi với thông báo cụ thể
//     }
// };



const login = async (email, password) => {
    const teacher = await TeacherModel.findOne({ email });

    if (!teacher) throw new Error('Email không tồn tại');

    // Kiểm tra trạng thái isLocked
    if (!teacher.isLocked) throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ với admin để được hỗ trợ.');

    const isPasswordMatch = await bcrypt.compare(password, teacher.password);
    if (!isPasswordMatch) throw new Error('Email hoặc mật khẩu không đúng');

    return teacher; // Trả về đối tượng giáo viên nếu đăng nhập thành công
};



const updateTeacher = async (teacherID, name, phone, password, avatar, major, slogan, gender) => {
    try {
        // Tạo đối tượng dữ liệu cập nhật
        const updateData = { name, phone, password, avatar, major, slogan, gender };

        if (password) {
            // Mã hóa mật khẩu nếu có thay đổi
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Cập nhật thông tin người dùng bằng teacherID
        const teacher = await TeacherModel.findByIdAndUpdate(teacherID, updateData, { new: true });

        if (!teacher) {
            throw new ErrorHandler(404, 'Tài khoản không tồn tại');
        }

        return teacher;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin tài khoản');
    }
};

const deleteTeacher = async (teacherID) => {
    try {
        const teacher = await TeacherModel.findByIdAndDelete(teacherID);

        if (!teacher) {
            throw new ErrorHandler(404, 'Giáo viên không tồn tại');
        }

        return teacher;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể xóa giáo viên');
    }
};

// Nhập email -> kiểm tra email tồn tại -> gửi OTP
const forgotPassword = async (email) => {
    try {
        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const teacher = await TeacherModel.findOne({ email });
        if (!teacher) {
            throw new ErrorHandler(404, 'Email không tồn tại');
        }

        // Tạo mã OTP
        const otp = generateOTP();

        // Lưu thông tin OTP và teacherID vào bộ nhớ tạm thời với email
        tempStore[email] = { otp, teacherID: teacher._id };

        const subject = 'Mã OTP khôi phục mật khẩu Website SoftMaster';
        const html = `
            <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                    <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #4B0082;">Chào ${teacher.name}</h1>
                    <p style="font-size: 16px;">Bạn đã yêu cầu khôi phục mật khẩu với email ${email}.</p>
                    <p style="font-size: 16px;">Mã OTP của bạn là: <strong>${otp}</strong></p>
              </div>
              <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Mã OTP của bạn sẽ hết hạn sau 10 phút.</div>
            </div>
        `;

        // Gửi email với OTP
        await sendEmail(email, subject, html);

        return { message: 'Mã OTP đã được gửi đến email của bạn', teacherID: teacher._id };
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể gửi mã OTP');
    }
};


const verifyOTP = async (teacherID, otp) => {
    try {
        const teacher = Object.values(tempStore).find(item => item.teacherID.toString() === teacherID.toString());
        if (!teacher) {
            throw new ErrorHandler(404, 'Giáo viên không tồn tại');
        }

        if (teacher.otp !== otp) {
            throw new ErrorHandler(400, 'Mã OTP không đúng');
        }

        delete tempStore[Object.keys(tempStore).find(key => tempStore[key].teacherID.toString() === teacherID.toString())];

        return { message: 'Xác minh OTP thành công', teacherID: teacher.teacherID };
    } catch (error) {
        console.error('Lỗi khi xác minh OTP:', error);
        throw new ErrorHandler(500, 'Lỗi khi xác minh OTP');
    }
};

const resetPassword = async (teacherID, newPassword) => {
    try {
        const teacher = await TeacherModel.findById(teacherID);
        if (!teacher) {
            throw new ErrorHandler(404, 'Giáo viên không tồn tại');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu và thay đổi trạng thái isLocked thành true
        const updatedTeacher = await TeacherModel.findByIdAndUpdate(
            teacherID,
            { password: hashedPassword, isLocked: true },
            { new: true }
        );

        if (!updatedTeacher) {
            throw new ErrorHandler(404, 'Giáo viên không tồn tại');
        }

        return { message: 'Mật khẩu đã được cập nhật thành công' };
    } catch (error) {
        console.error('Lỗi khi cập nhật mật khẩu:', error);
        throw new ErrorHandler(500, 'Lỗi khi cập nhật mật khẩu');
    }
};


// filter theo name email phone
const filterTeachers = async (name, email, phone) => {
    try {
        // Lấy tất cả teachers từ cơ sở dữ liệu
        const teachers = await TeacherModel.find();

        // Lọc danh sách teachers theo các tiêu chí name, email, phone
        return teachers.filter(teacher =>
            (name ? teacher.name.toLowerCase().includes(name.toLowerCase()) : true) &&
            (email ? teacher.email.toLowerCase().includes(email.toLowerCase()) : true) &&
            (phone ? teacher.phone.toLowerCase().includes(phone.toLowerCase()) : true)
        );
    } catch (error) {
        console.log("Lỗi rồi:", error);
        return []; // trả về mảng rỗng nếu có lỗi
    }
};

// t đổi isLocked giữa true và false để kích hoạt tài khoản
// const toggleIsLocked = async (teacherID) => {
//     try {
//         const teacher = await TeacherModel.findById(teacherID);

//         if (!teacher) {
//             throw new ErrorHandler(404, 'Giáo viên không tồn tại');
//         }

//         // t đảo ngược giá trị của isLocked
//         const newIsLockedStatus = !teacher.isLocked;

//         // t cập nhật isLocked và lưu lại
//         teacher.isLocked = newIsLockedStatus;
//         await teacher.save();

//         return { message: 'Trạng thái tài khoản đã được thay đổi', isLocked: teacher.isLocked };
//     } catch (error) {
//         console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
//         throw new ErrorHandler(500, 'Lỗi khi thay đổi trạng thái tài khoản');
//     }
// };

const toggleIsLocked = async (teacherID, reason) => {
    try {
        // Tìm giáo viên dựa trên teacherID
        const teacher = await TeacherModel.findById(teacherID);

        if (!teacher) {
            throw new ErrorHandler(404, 'Giáo viên không tồn tại');
        }

        // Xuất log kiểm tra thông tin giáo viên
        console.log('Đã tìm thấy giáo viên:', teacher.name);
        console.log('Email giáo viên:', teacher.email);

        // Nếu tài khoản đang mở (true) và muốn khóa (false), cần lý do
        if (teacher.isLocked === true) {
            if (!reason) {
                throw new ErrorHandler(400, 'Bạn cần cung cấp lý do khi khóa tài khoản');
            }

            teacher.isLocked = false; // Khóa tài khoản
            await teacher.save();

            // Gửi email thông báo tài khoản đã bị khóa
            const subject = 'Thông báo tài khoản bị khóa';
            const html = `
                <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
                    <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                        <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                        <h1 style="color: #4B0082;">Tài khoản của bạn đã bị khóa</h1>
                        <p style="font-size: 16px;">Lý do: ${reason}</p>
                        <p style="font-size: 16px;">Vui lòng liên hệ với quản trị viên qua email <a href="mailto:softmasterofficial@gmail.com">softmasterofficial@gmail.com</a> để biết thêm chi tiết và mở khóa tài khoản.</p>
                    </div>
                    <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</div>
                </div>
            `;

            console.log('Đang gửi email cho giáo viên:', teacher.email);
            await sendEmail(teacher.email, subject, html);
            console.log('Email đã được gửi đến:', teacher.email);

            return { message: 'Tài khoản đã bị khóa và email thông báo đã được gửi', isLocked: false };
        }

        // Nếu tài khoản đang bị khóa (false) và muốn mở (true)
        if (teacher.isLocked === false) {
            teacher.isLocked = true; // Mở khóa tài khoản
            await teacher.save();

            // Gửi email thông báo tài khoản đã được mở khóa
            const subject = 'Thông báo tài khoản đã được mở khóa';
            const html = `<div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
                    <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                        <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                        <h1 style="color: #4B0082;">Tài khoản của bạn đã được mở khóa</h1>
                        <p style="font-size: 16px;">Tài khoản của bạn đã được phục hồi và có thể sử dụng lại các dịch vụ của chúng tôi.</p>
                    </div>
                    <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</div>
                </div>
            `;

            console.log('Đang gửi email cho giáo viên:', teacher.email);
            await sendEmail(teacher.email, subject, html);
            console.log('Email đã được gửi đến:', teacher.email);

            return { message: 'Tài khoản đã được mở khóa và email thông báo đã được gửi', isLocked: true };
        }

        // Không có thay đổi nào
        throw new ErrorHandler(400, 'Trạng thái tài khoản không thay đổi');
    } catch (error) {
        console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
        throw new ErrorHandler(error.statusCode || 500, error.message || 'Lỗi khi thay đổi trạng thái tài khoản');
    }
};


module.exports = {
    getAll, getTeacherByID, getTotalTeachers, register, login, updateTeacher, deleteTeacher, forgotPassword, verifyOTP, resetPassword
    , filterTeachers, toggleIsLocked, getLockedTeachers
};