const express = require('express');
const router = express.Router();
const certificateController = require('../module/Certificate/CertificateController');

// Route thêm chứng chỉ
router.post('/addcertificate/:userID/:courseID', certificateController.addCertificate);

// Route lấy tất cả chứng chỉ
router.get('/getall', certificateController.getAllCertificates);

// Route lấy chứng chỉ theo userID
router.get('/getbyuserID/:userID', certificateController.getCertificatesByUserID);

// Route cập nhật chứng chỉ
router.put('/updatecertificate/:certificateID', certificateController.updateCertificate);

// Route xóa chứng chỉ
router.delete('/deletecertificate/:certificateID', certificateController.deleteCertificate);

module.exports = router;
