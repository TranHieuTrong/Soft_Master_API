const UserModel = require('./UserModel');
const bcrypt = require('bcrypt');
const { ErrorHandler } = require('../../errorHandler');
const sendEmail = require('../../mailer');
const jwt = require('jsonwebtoken');

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
        return await UserModel.find();
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách người dùng');
    }
};

const getUserByID = async (userID) => {
    try {
        const user = await UserModel.findById(userID);

        if (!user) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }

        return user;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        throw new ErrorHandler(500, 'Lỗi khi lấy thông tin người dùng');
    }
};

// đếm tổng user trong database
const getTotalUsers = async () => {
    try {
        const count = await UserModel.countDocuments();
        return count;
    } catch (error) {
        console.error('Lỗi khi đếm tổng số người dùng:', error);
        throw new ErrorHandler(500, 'Không thể đếm tổng số người dùng');
    }
};

const register = async (name, email, phone, password) => {
    try {
        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw new ErrorHandler(400, 'Email đã được sử dụng');
        }

        // Tạo mã OTP
        const otp = generateOTP();

        // Lưu thông tin người dùng vào bộ nhớ tạm thời
        tempStore[email] = { name, email, phone, password, otp };

        // Gửi email thông báo và mã OTP
        const subject = 'Mã OTP xác nhận đăng ký ứng dụng SoftMaster';
        const html = `
            <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; height: 100%; padding: 20px; text-align: center; color: #fff; font-family: Arial, sans-serif;">
              <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 8px; width: 60%; margin: 0 auto;">
                    <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #4B0082;">Chào ${name}</h1>
                    <p style="font-size: 16px;">Bạn đã đăng ký thành công với email ${email}.</strong></p>
                    <p style="font-size: 16px;">Mã OTP của bạn là: <strong>${otp}</strong></p>
                </div>
                <div style="text-align: center; font-size: 15px; margin-top: 20px; color: #FFFFFF;">Mã OTP của bạn sẽ hết hạn sau 10 phút.</div>
            </div>
        `;

        // Gọi hàm gửi email với tham số đúng
        await sendEmail(email, subject, html);

        return { message: 'Mã OTP đã được gửi đến email của bạn' };
    } catch (error) {
        console.log('Lỗi đăng ký:', error);
        throw new ErrorHandler(500, 'Không thể đăng ký người dùng');
    }
};


const verifyOTPRegister = async (email, otp) => {
    try {
        const user = tempStore[email];
        if (!user) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }
        // Kiểm tra mã OTP
        if (user.otp !== otp) {
            throw new ErrorHandler(400, 'Mã OTP không đúng');
        }

        delete tempStore[email];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const newUser = new UserModel({
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: hashedPassword,
            avatar: null,
            birthday: null,
            gender: null,
        });

        await newUser.save();

        return { message: 'Xác minh OTP thành công và đăng ký hoàn tất' };
    } catch (error) {
        console.error('Lỗi khi xác minh OTP:', error);
        throw new ErrorHandler(500, 'Lỗi khi xác minh OTP');
    }
};

// const register = async (name, email, phone, password) => {
//     try {
//         // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             throw new ErrorHandler(400, 'Email đã được sử dụng');
//         }

//         // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Lưu thông tin người dùng vào cơ sở dữ liệu
//         const newUser = new UserModel({
//             name,
//             email,
//             phone,
//             password: hashedPassword,
//             avatar: null,
//             birthday: null,
//             gender: null,
//         });

//         await newUser.save();

//         return { message: 'Đăng ký thành công' };
//     } catch (error) {
//         console.log('Lỗi đăng ký:', error);
//         throw new ErrorHandler(500, 'Không thể đăng ký người dùng');
//     }
// };

// const verifyOTPRegister = async (email, otp) => {
//     // Hàm này không còn cần thiết nữa vì OTP đã bị tắt
//     throw new ErrorHandler(400, 'Xác thực OTP đã bị tắt');
// };

// đăng ký bằng tài khoản google
const login = async (email, password) => {
    try {
        // Kiểm tra xem JWT_SECRET_KEY có tồn tại trong biến môi trường không
        const jwtSecret = process.env.JWT_SECRET_KEY;
        if (!jwtSecret) {
            console.log('JWT_SECRET_KEY is not set or undefined');
            throw new Error('JWT_SECRET_KEY is not defined in the environment');
        }
        console.log('JWT_SECRET_KEY is', jwtSecret);  // In ra để kiểm tra giá trị

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await UserModel.findOne({ email });

        // Kiểm tra nếu không có người dùng hoặc mật khẩu không đúng
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new ErrorHandler(400, 'Email hoặc mật khẩu không đúng');
        }

        // Tạo payload chứa các thông tin cần thiết cho JWT
        const payload = {
            userID: user._id,  // Giả sử user._id là ID của người dùng trong database
            email: user.email,
            fullname: user.name,
        };

        // Tạo token với payload và thời gian hết hạn là 1 giờ
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        return { user, token };  // Trả về thông tin người dùng và token
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể đăng nhập');
    }
};


const updateUser = async (userID, name, phone, password, avatar, birthday, gender) => {
    try {
        const updateData = { name, phone, avatar };

        if (birthday) {
            updateData.birthday = new Date(birthday);
        }

        // Kiểm tra giới tính hợp lệ
        if (gender !== undefined) {
            if (gender !== 'Nam' && gender !== 'Nữ') {
                throw new ErrorHandler(400, 'Giới tính không hợp lệ, chỉ chấp nhận Nam hoặc Nữ');
            }
            updateData.gender = gender;
        }

        // Nếu có mật khẩu mới, hash mật khẩu trước khi lưu
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Tìm và cập nhật thông tin người dùng theo userID
        const user = await UserModel.findByIdAndUpdate(userID, updateData, { new: true });

        // Nếu không tìm thấy người dùng, ném lỗi
        if (!user) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }

        return user;
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin người dùng');
    }
};

const deleteUser = async (userID) => {
    try {
        const user = await UserModel.findByIdAndDelete(userID);

        if (!user) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }

        return user;
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể xóa người dùng');
    }
};

// Nhập email -> kiểm tra email tồn tại -> gửi OTP
const forgotPassword = async (email) => {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new ErrorHandler(404, 'Email không tồn tại');
        }

        const otp = generateOTP();

        // Thêm thời gian hết hạn cho OTP (ví dụ: 10 phút)
        const expiresIn = Date.now() + 10 * 60 * 1000;
        tempStore[email] = { otp, userID: user._id, email, expiresIn };

        const subject = 'Mã OTP khôi phục mật khẩu ứng dụng SoftMaster';
        const html = `
            <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
              <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                    <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                    <h1 style="color: #4B0082;">Chào ${user.name}</h1>
                    <p style="font-size: 16px;">Bạn đã yêu cầu khôi phục mật khẩu với email ${email}.</p>
                    <p style="font-size: 16px;">Mã OTP của bạn là: <strong>${otp}</strong></p>
              </div>
              <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Mã OTP của bạn sẽ hết hạn sau 10 phút.</div>
            </div>
        `;

        // Gửi email với OTP
        await sendEmail(email, subject, html);

        return { message: 'Mã OTP đã được gửi đến email của bạn', userID: user._id, otp };
    } catch (error) {
        console.log(error);
        throw new ErrorHandler(500, 'Không thể gửi mã OTP');
    }
};


const verifyOTP = async (userID, otp) => {
    try {
        console.log('tempStore:', tempStore);
        console.log('userID:', userID);
        const user = Object.values(tempStore).find(item => item.userID.toString() === userID.toString());
        if (!user) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }

        if (user.otp !== otp) {
            throw new ErrorHandler(400, 'Mã OTP không đúng');
        }

        delete tempStore[Object.keys(tempStore).find(key => tempStore[key].userID.toString() === userID.toString())];

        return { message: 'Xác minh OTP thành công', userID: user.userID };
    } catch (error) {
        console.error('Lỗi khi xác minh OTP:', error);
        throw new ErrorHandler(500, 'Lỗi khi xác minh OTP');
    }
};

const resetPassword = async (userID, newPassword) => {
    try {
        const user = await UserModel.findById(userID);
        if (!user) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await UserModel.findByIdAndUpdate(userID, { password: hashedPassword }, { new: true });

        if (!updatedUser) {
            throw new ErrorHandler(404, 'Người dùng không tồn tại');
        }

        return { message: 'Mật khẩu đã được cập nhật thành công', updatedUser };
    } catch (error) {
        console.error('Lỗi khi cập nhật mật khẩu:', error);
        throw new ErrorHandler(500, 'Lỗi khi cập nhật mật khẩu');
    }
};

// filter theo name email phone
const filterUsers = async (name, email, phone) => {
    try {
        // Lấy tất cả user từ cơ sở dữ liệu
        const users = await UserModel.find();

        // Lọc danh sách user theo các tiêu chí name, email, phone
        return users.filter(user =>
            (name ? user.name.toLowerCase().includes(name.toLowerCase()) : true) &&
            (email ? user.email.toLowerCase().includes(email.toLowerCase()) : true) &&
            (phone ? user.phone.toLowerCase().includes(phone.toLowerCase()) : true)
        );
    } catch (error) {
        console.log("Lỗi rồi:", error);
        return []; // trả về mảng rỗng nếu có lỗi
    }
};

// // REGISTER AND LOGIN GG
const registerOrLoginWithGoogle = async (googleID, email, name, avatar) => {
    try {
        // Kiểm tra xem email đã tồn tại chưa
        let user = await UserModel.findOne({ email });

        if (user) {
            // Nếu tài khoản đã tồn tại nhưng chưa có Google ID -> cập nhật
            if (!user.googleID) {
                user.googleID = googleID;
                await user.save();
                return { message: 'Google ID đã được liên kết với tài khoản hiện có', user };
            }
            // Nếu tài khoản đã có Google ID -> Đăng nhập
            return { message: 'Đăng nhập thành công', user };
        }

        // Nếu email chưa tồn tại, tạo tài khoản mới
        const newUser = new UserModel({
            name,
            email,
            googleID,
            avatar,
            otpVerified: true // Tài khoản Google được coi là đã xác minh
        });

        await newUser.save();

        return { message: 'Đăng ký bằng Google thành công', user: newUser };
    } catch (error) {
        console.error('Lỗi đăng ký/đăng nhập bằng Google:', error);
        throw new ErrorHandler(500, 'Lỗi khi xử lý đăng ký hoặc đăng nhập bằng Google');
    }
};


module.exports = {
    getAll, getUserByID, getTotalUsers, register, verifyOTPRegister, login, updateUser, deleteUser, forgotPassword, verifyOTP, resetPassword,
    filterUsers, registerOrLoginWithGoogle
};
