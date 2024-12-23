const express = require('express');
const router = express.Router();
const userController = require('../module/People/User/UserController');
const jwt = require('jsonwebtoken');

// Lấy danh sách người dùng
router.get('/getAll', async (req, res) => {
  try {
    const users = await userController.getAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error });
  }
});

// Lấy thông tin người dùng theo userID
router.get('/getUserByID/:userID', async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await userController.getUserByID(userID);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error });
  }
});

// đếm tổng số user trong database
// http://localhost:3001/user/countUser
router.get('/countUser', async (req, res) => {
  try {
    const count = await userController.getTotalUsers();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'lỗi khi đếm tổng số user', error });
  }
});

// Đăng ký người dùng
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const response = await userController.register(name, email, phone, password);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng ký người dùng', error });
  }
});

// Xác minh OTP đăng ký
router.post('/verify-otp-register', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const response = await userController.verifyOTPRegister(email, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xác minh OTP đăng ký', error });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Tìm người dùng và tạo token
        const { user, token } = await userController.login(email, password);

        // Trả về token và thông tin người dùng
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token: token,  // Trả về token JWT
            user: {
                userID: user._id,
                email: user.email,
                fullname: user.name,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Lỗi khi đăng nhập' });
    }
});



// Cập nhật thông tin người dùng
router.put('/update/:userID', async (req, res) => {
  const { userID } = req.params;
  const { name, phone, password, avatar, birthday, gender } = req.body;
  
  console.log('birthday from body:', birthday); 
  console.log('gender from body:', gender); 

  try {
    const user = await userController.updateUser(userID, name, phone, password, avatar, birthday, gender);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});


// Xóa người dùng
router.delete('/delete/:userID', async (req, res) => {
  const { userID } = req.params;
  try {
    await userController.deleteUser(userID);
    res.status(200).json({ message: 'Người dùng đã bị xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng', error });
  }
});

// Khôi phục mật khẩu
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const response = await userController.forgotPassword(email);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});


// Xác minh OTP khôi phục mật khẩu
router.post('/verify-otp-forgotpass/:userID', async (req, res) => {
  const { userID } = req.params;
  const { otp } = req.body;
  try {
    const response = await userController.verifyOTP(userID, otp);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});


// Cập nhật mật khẩu
router.put('/reset-password/:userID', async (req, res) => {
  const { userID } = req.params;
  const { newPassword } = req.body;
  try {
    const response = await userController.resetPassword(userID, newPassword);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// filter theo name email phone
router.post('/filter', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const users = await userController.filterUsers(name, email, phone);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'loi khi lọc user', error });
  }
});

// REGISTER AND LOGIN GG
// router.post('/registerGoogle', async (req, res) => {
//   try {
//     const { googleID, email, name, avatar } = req.body;

//     if (!googleID || !email || !name) {
//       return res.status(400).json({ message: 'Thiếu thông tin cần thiết để đăng ký' });
//     }

//     const result = await userController.registerWithGoogle(googleID, email, name, avatar);
//     res.status(201).json(result);
//   } catch (error) {
//     console.error('Lỗi khi đăng ký bằng Google:', error);
//     res.status(error.statusCode || 500).json({ message: error.message || 'Có lỗi xảy ra' });
//   }
// });

// // Đăng nhập bằng Google
// router.post('/loginGoogle', async (req, res) => {
//   try {
//     const { googleID } = req.body;

//     if (!googleID) {
//       return res.status(400).json({ message: 'Thiếu Google ID để đăng nhập' });
//     }

//     const result = await userController.loginWithGoogle(googleID);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Lỗi khi đăng nhập bằng Google:', error);
//     res.status(error.statusCode || 500).json({ message: error.message || 'Có lỗi xảy ra' });
//   }
// });

router.post('/login/google-auth', async (req, res) => {
  const { googleID, email, name, avatar } = req.body;

  try {
    const result = await userController.registerOrLoginWithGoogle(googleID, email, name, avatar);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});


module.exports = router;
