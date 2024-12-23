const express = require("express");
const router = express.Router();
const PaymentController = require("../module/Payment/PaymentController");

// tạo link thanh toán mua khoá học
router.post("/create-payment-url", async (req, res) => {
    try {
        const { userID, courseId } = req.body;

        console.log(req.body);

        const ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const paymentUrl = await PaymentController.createVNPayPaymentUrl(
            ipAddr,
            userID,
            courseId
        );

        res.json(paymentUrl);
    } catch (error) {
        res.status(500).json({ message: "Không thể thanh toán", error });
    }
});

router.post("/update-payment-status", async (req, res) => {
    try {
        const { paymentId, status } = req.body;

        const payment = await PaymentController.updatePaymentStatus({
            paymentId,
            status,
        });

        res.json(payment);
    } catch (error) {
        res.status(500).json({
            message: "Không thể cập nhật trạng thái",
            error,
        });
    }
});

// LY
// tính tổng doanh thu của 1 khóa học cụ thể, chỉ tính các giao dịch có trạng thái SUCCESS
router.get("/total-revenue-by-course/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;

        const totalRevenue = await PaymentController.getTotalRevenueByCourseId(
            courseId
        );

        res.json({ totalRevenue });
    } catch (error) {
        res.status(500).json({
            message: "Không thể tính toán doanh thu",
            error,
        });
    }
});

// Tổng tất cả doanh thu của tất cả khóa học đã thanh toán có status success
router.get("/total-revenue-all-success", async (req, res) => {
    try {
        const totalRevenue = await PaymentController.getTotalRevenue();

        res.json({ totalRevenue });
    } catch (error) {
        res.status(500).json({
            message: "Không thể tính toán tổng doanh thu",
            error,
        });
    }
});

// đếm tổng số lượt bán ra của 1 khóa hc. chỉ tính status success
router.get("/total-sold-by-course/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;

        const totalSold = await PaymentController.getTotalSaleByCourseId(courseId);

        res.json({ totalSold });
    } catch (error) {
        res.status(500).json({
            message: "Không thể tính số lượt bán ra",
            error,
        });
    }
});

// Route để lấy doanh thu theo tháng dựa trên monthOffset
router.get('/getMonthlyRevenue', async (req, res) => {
    try {
        const monthOffset = parseInt(req.query.monthOffset) || 0; // lấy monthOffset từ query, mặc định = 0 nếu không có
        const totalRevenue = await PaymentController.getMonthlyRevenue(monthOffset);

        res.status(200).json({
            success: true,
            totalRevenue: totalRevenue,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Route lấy danh sách top 5 khóa học bán chạy nhất
router.get("/top-selling-courses", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const topSellingCourses = await PaymentController.getTopSellingCourses(limit);
        res.status(200).json(topSellingCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route lấy tổng doanh thu mỗi năm
router.get("/annual-revenue", async (req, res) => {
    try {
        const annualRevenue = await PaymentController.getAnnualRevenue();
        res.status(200).json(annualRevenue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//  lịch sử giao dịch. Sắp xếp theo thời gian giảm dần (gần nhất)
router.get("/payment-history-sort", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const paymentHistory = await PaymentController.getTransactionHistory(
            limit,
            page
        );
        res.status(200).json(paymentHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;