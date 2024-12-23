const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const CertificateModel = require('./CertificateModel');
const sendEmail = require('../mailer'); // Import hàm sendEmail
const UserModel = require('../People/User/UserModel');
const CourseModel = require('../Learning/Course/CourseModel');

const addCertificate = async (req, res) => {
    const { userID, courseID } = req.params;

    try {
        // Tạo chứng chỉ mới
        const newCertificate = new CertificateModel({ userID, courseID });
        await newCertificate.save();

        // Lấy thông tin người dùng và khóa học
        const user = await UserModel.findById(userID);
        const course = await CourseModel.findById(courseID);

        if (!user || !course) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng hoặc khóa học' });
        }

        // Nội dung HTML chứng chỉ
        const html = `
         <div style="width: 31.33cm; height: 15.88cm; text-align: center; font-family: Arial, sans-serif; box-sizing: border-box;">
        <div style="background-color: #FFFFFF; color: #000; width: 100%; height: 100%; position: relative; overflow: hidden;">
            <img src="https://i.imgur.com/P81bal2.png" alt="Bóng người nền" style="position: absolute; bottom: 0; left: 0; width: 100%; z-index: 0;" />
            
            <div style="margin-top: 70px;">
                <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo" style="width: 180px; margin-bottom: 20px;position: relative;" />
                <h1 style="color: #4B0082; margin: 0;position: relative;">Chứng nhận hoàn thành khóa học</h1>
                <p style="font-size: 16px; margin: 0;position: relative;">Xin chúc mừng, <h2 style="position: relative;">${user.name}</h2></p>
                <p style="font-size: 16px;position: relative;">Bạn đã hoàn thành xuất sắc chương trình đào tạo: <strong>${course.name}</strong></p>
                <p style="font-size: 16px;position: relative;">Chứng nhận đã được cấp vào ngày: ${new Date().toLocaleDateString()}</p>
                <p style="font-size: 16px;position: relative;">ID chứng nhận: <strong>${newCertificate._id}</strong></p>   
            </div>
            
            <!-- Hình ảnh mảnh vải (nPWfUeQ) đè lên ảnh nền -->
            <img src="https://i.imgur.com/nPWfUeQ.png" alt="Mảnh vải" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;" />
        </div>
        
        <!-- Huy chương được căn góc trên bên trái -->
        <div style="position: absolute; top: -5px; left: 900px;">
            <img src="https://i.imgur.com/O04Q9RD.png" alt="Huy chương" style="width: 350px;" />
        </div>
    </div>
        `;

        // Tạo file ảnh từ HTML trong bộ nhớ
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Tăng timeout cho page.setContent nếu trang mất nhiều thời gian để tải
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 6000000 }); // Tăng timeout lên 60 giây
        const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: true });
        await browser.close();

        // Gửi email với file đính kèm
        const subject = 'Chúc mừng bạn đã hoàn thành khóa học!';
        const text = ` <div style="background: linear-gradient(180deg, #BCF2F6, #08C2FF); width: 100%; padding: 20px; text-align: center; color: #000; font-family: Arial, sans-serif;">
                <div style="background-color: #FFFFFF; color: #000; padding: 20px; border-radius: 10px; width: 60%; margin: 0 auto;">
                    <img src="https://i.imgur.com/39X8Hz7.png" alt="Logo SoftMaster" style="width: 150px; height: auto; margin-bottom: 20px;">
                <h1 style="color: #4B0082;">Chứng nhận hoàn thành khóa học</h1>
                    <p style="font-size: 16px;">Xin chúc mừng, ${user.name}!</p>
                    <p style="font-size: 16px;">Bạn đã hoàn thành xuất sắc chương trình đào tạo: <strong>${course.name}</strong></p>
                    <p style="font-size: 16px;">Chứng nhận đã được cấp vào ngày: ${new Date().toLocaleDateString()}</p>
                    <p style="font-size: 16px;">ID chứng nhận: <strong>${newCertificate._id}</strong></p>
                </div>
                <div style="text-align: center; font-size: 14px; margin-top: 10px; color: #FFFFFF;">Chúc bạn thành công với những dự định sắp tới!</div>
            </div>`;

        const attachments = [
            {
                filename: `Chứng nhận_${newCertificate._id}.png`,
                content: screenshotBuffer, // File ảnh dưới dạng buffer
                encoding: 'base64', // Đảm bảo rằng ảnh được mã hóa đúng
            },
        ];
        
        // Truyền tất cả các tham số vào sendEmail
        await sendEmail(user.email, subject, text, attachments);  // Chuyển attachments vào đây

        res.status(201).json({ message: 'Chứng chỉ đã được tạo và email thông báo đã gửi thành công', certificate: newCertificate });
    } catch (error) {
        console.error('Lỗi khi tạo chứng chỉ hoặc gửi email:', error);
        res.status(500).json({ message: 'Lỗi khi tạo chứng chỉ hoặc gửi email' });
    }
};





// Lấy tất cả chứng chỉ
const getAllCertificates = async (req, res) => {
    try {
        const certificates = await CertificateModel.find()
            .populate('userID', 'name email phone avatar') // Lấy thông tin user
            .populate('courseID', 'name img describe price subjectID teacherID') // Lấy thông tin course
            .populate('courseID.subjectID', 'name')  // Nếu muốn lấy thêm thông tin Subject
            .populate('courseID.teacherID', 'name email phone'); // Nếu muốn lấy thêm thông tin Teacher
        
        if (!certificates || certificates.length === 0) {
            return res.status(404).json({ message: 'Không có chứng chỉ nào trong hệ thống' });
        }

        res.status(200).json({ certificates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy tất cả chứng chỉ' });
    }
};

// Lấy chứng chỉ theo userID
const getCertificatesByUserID = async (req, res) => {
    const { userID } = req.params;

    try {
        const certificates = await CertificateModel.find({ userID })
            .populate('userID', 'name email phone avatar gender') // Lấy thông tin user
            .populate('courseID', 'name img describe price subjectID teacherID') // Lấy thông tin course
            .populate('courseID.subjectID', 'name')  // Nếu muốn lấy thêm thông tin Subject
            .populate('courseID.teacherID', 'name email phone'); // Nếu muốn lấy thêm thông tin Teacher
        
        if (!certificates || certificates.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy chứng chỉ cho người dùng này' });
        }

        res.status(200).json({ certificates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy chứng chỉ của người dùng' });
    }
};

// Cập nhật chứng chỉ
const updateCertificate = async (req, res) => {
    const { certificateID } = req.params;
    const { userID, courseID } = req.body;

    try {
        const certificate = await CertificateModel.findById(certificateID);
        if (!certificate) {
            return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' });
        }

        certificate.userID = userID || certificate.userID;
        certificate.courseID = courseID || certificate.courseID;
        certificate.updatedAt = Date.now();  // Cập nhật lại thời gian sửa

        await certificate.save();
        res.status(200).json({ message: 'Cập nhật chứng chỉ thành công', certificate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật chứng chỉ' });
    }
};

// Xóa chứng chỉ
const deleteCertificate = async (req, res) => {
    const { certificateID } = req.params;

    try {
        const certificate = await CertificateModel.findByIdAndDelete(certificateID);
        if (!certificate) {
            return res.status(404).json({ message: 'Không tìm thấy chứng chỉ để xóa' });
        }
        res.status(200).json({ message: 'Chứng chỉ đã được xóa thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa chứng chỉ' });
    }
};

module.exports = {
    addCertificate,
    getAllCertificates,
    getCertificatesByUserID,
    updateCertificate,
    deleteCertificate
};
