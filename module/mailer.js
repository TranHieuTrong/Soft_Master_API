const nodemailer = require('nodemailer');

// Cấu hình SMTP với mật khẩu ứng dụng
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'softmasterofficial@gmail.com',
        pass: 'icox lwaw oywf ifed'
    }
});

// Hàm kiểm tra định dạng email hợp lệ
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Hàm gửi email
const sendEmail = async (email, subject, html, attachments) => {
    console.log('Địa chỉ email được kiểm tra:', email);
    if (!isValidEmail(email)) {
        console.error('Địa chỉ email không hợp lệ:', email);
        return;
    }

    const mailOptions = {
        from: 'softmasterofficial@gmail.com',
        to: email,
        subject: subject,
        html: html,
        attachments: attachments,  // Chuyển attachments vào đây
    };

    console.log('Gửi email với thông tin:', mailOptions);

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã gửi thành công');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
    }
};

module.exports = sendEmail;


// const nodemailer = require('nodemailer');

// // Cấu hình SMTP với mật khẩu ứng dụng
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'softmasterofficial@gmail.com',
//         pass: 'icox lwaw oywf ifed'
//     }
// });

// // Hàm kiểm tra định dạng email hợp lệ
// const isValidEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
// };

// // Hàm gửi email
// const sendEmail = async (email, subject, html) => {
//     console.log('Địa chỉ email được kiểm tra:', email);
//     if (!isValidEmail(email)) {
//         console.error('Địa chỉ email không hợp lệ:', email);
//         return;
//     }

//     const mailOptions = {
//         from: 'softmasterofficial@gmail.com',
//         to: email,
//         subject: subject,
//         html: html,
//         attachments: attachments,
//     };

//     console.log('Gửi email với thông tin:', mailOptions);

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email đã gửi thành công');
//     } catch (error) {
//         console.error('Lỗi khi gửi email:', error);
//     }
// };

// // Cấu hình SMTP với mật khẩu ứng dụng
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'softmaster6666@gmail.com',
//         pass: 'gcho hfaf pype akea'
//     }
// });

// // Hàm kiểm tra định dạng email hợp lệ
// const isValidEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
// };

// // Hàm gửi email
// const sendEmail = async (email, subject, html) => {
//     console.log('Địa chỉ email được kiểm tra:', email);
//     if (!isValidEmail(email)) {
//         console.error('Địa chỉ email không hợp lệ:', email);
//         return;
//     }

//     const mailOptions = {
//         from: 'softmaster6666@gmail.com',
//         to: email,
//         subject: subject,
//         html: html
//     };

//     console.log('Gửi email với thông tin:', mailOptions);

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email đã gửi thành công');
//     } catch (error) {
//         console.error('Lỗi khi gửi email:', error);
//     }
// };

module.exports = sendEmail;
