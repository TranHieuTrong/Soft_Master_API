const { ErrorHandler } = require("../errorHandler");
const CourseModel = require("../Learning/Course/CourseModel");
const UserModel = require("../People/User/UserModel");
const crypto = require("crypto");
const querystring = require("qs");
const dateFormat = require("dayjs");
const sortObject = require("../sortObject");
const PaymentModel = require("./PaymentModel");

const createVNPayPaymentUrl = async (ipAddr, userId, courseId) => {
    try {
        // kiểm tra user có tồn tại không
        const user = await UserModel.findById(userId).exec();
        if (!user) {
            throw new ErrorHandler(404, "Không tìm thấy người dùng");
        }

        // kiểm tra khoá học có tồn tại không
        const course = await CourseModel.findById(courseId).exec();
        if (!course) {
            throw new ErrorHandler(404, "Không tìm thấy khoá học");
        }

        let orderId;

        // kiểm tra trạng thái thanh toán
        const findPayment = await PaymentModel.findOne({
            userID: userId,
            courseID: courseId,
        }).exec();

        if (findPayment) {
            orderId = findPayment._id;
        } else {
            const payment = await new PaymentModel({
                userID: userId,
                courseID: courseId,
                status: "PENDING",
                paymentDate: dateFormat(),
                total: course.price, // LY thêm trường total với giá trị là course.price
            }).save();

            orderId = payment._id;
        }

        const paymentUrl = generatePaymentUrl({
            ipAddr,
            orderId: `SOFTMASTER_${orderId}`,
            amount: course.price,
            orderInfo: `Mua khoa hoc ${course._id}`,
        });

        return paymentUrl;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

const updatePaymentStatus = async ({ paymentId, status }) => {
    try {
        const payment = await PaymentModel.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true }
        ).exec();

        return payment;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

const generatePaymentUrl = async ({ ipAddr, orderId, amount, orderInfo }) => {
    try {
        const tmnCode = "A14ZG7RU";
        const secretKey = "GWZVNUYKOESWJXIFUXGSWNQQLSJCPQGT";
        let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        const returnUrl = "https://vnpay.vn";

        const date = new Date();

        const createDate = dateFormat(date).format("YYYYMMDDHHmmss");
        const expiredDate = dateFormat(date)
            .add(10, "m")
            .format("YYYYMMDDHHmmss");

        const currCode = "VND";
        let vnp_Params = {};
        vnp_Params["vnp_Version"] = "2.1.0";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;
        vnp_Params["vnp_Locale"] = "vn";
        vnp_Params["vnp_CurrCode"] = currCode;
        vnp_Params["vnp_TxnRef"] = orderId;
        vnp_Params["vnp_OrderInfo"] = orderInfo;
        vnp_Params["vnp_OrderType"] = "other";
        vnp_Params["vnp_Amount"] = amount * 100;
        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        vnp_Params["vnp_ExpireDate"] = expiredDate;

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
        vnp_Params["vnp_SecureHash"] = signed;
        vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

        return vnpUrl;
    } catch (error) {
        res.status(500).json({
            error: error.message,
            message: "Internal server error",
        });
    }
};

// LY
// tính tổng doanh thu của 1 khóa học cụ thể, chỉ tính các giao dịch có trạng thái SUCCESS
const getTotalRevenueByCourseId = async (courseId) => {
    try {
        const payments = await PaymentModel.find({ courseID: courseId }).exec();
        let totalRevenue = 0;

        payments.forEach((payment) => {
            // Kiểm tra nếu trạng thái của payment là SUCCESS
            if (payment.status === 'SUCCESS') {
                totalRevenue += payment.total;
            }
        });

        return totalRevenue;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

// Tổng tất cả doanh thu của tất cả khóa học đã thanh toán có status success
const getTotalRevenue = async () => {
    try {
        const payments = await PaymentModel.find({ status: 'SUCCESS' }).exec();
        let totalRevenue = 0;

        payments.forEach((payment) => {
            totalRevenue += payment.total;
        });

        return totalRevenue;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

// đếm tổng số lượt bán ra của 1 khóa hc. chỉ tính status success
const getTotalSaleByCourseId = async (courseId) => {
    try {
        const payments = await PaymentModel.find({ courseID: courseId, status: 'SUCCESS' }).exec();
        return payments.length;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

// Hàm lấy doanh thu từng tháng trong khoảng thời gian
const getMonthlyRevenue = async () => {
    try {
        const payments = await PaymentModel.find({
            status: 'SUCCESS',
        }).exec();

        const monthlyRevenue = {};

        payments.forEach((payment) => {
            const paymentDate = new Date(payment.paymentDate);
            const year = paymentDate.getFullYear();
            const month = paymentDate.getMonth() + 1; // Tháng từ 0-11 nên cần +1

            const key = `${year}-${month < 10 ? "0" + month : month}`; // Chuỗi YYYY-MM để nhóm theo tháng

            if (!monthlyRevenue[key]) {
                monthlyRevenue[key] = 0;
            }

            monthlyRevenue[key] += payment.total; // Cộng dồn doanh thu theo tháng
        });

        return monthlyRevenue;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

// khóa học bán chạy nhất
const getTopSellingCourses = async (limit = 5) => {
    try {
        const topSellingCourses = await PaymentModel.aggregate([
            { $match: { status: 'SUCCESS' } }, // Chỉ lấy các thanh toán thành công
            { $group: { _id: "$courseID", salesCount: { $sum: 1 } } }, // Nhóm theo courseID và đếm số lượng
            { $sort: { salesCount: -1 } }, // Sắp xếp giảm dần theo số lượng bán
            { $limit: limit }, // Giới hạn số lượng kết quả
            {
                $lookup: { // Kết hợp với CourseModel
                    from: "courses", // Tên collection của CourseModel trong MongoDB
                    localField: "_id", // Trường khóa chính ở kết quả nhóm
                    foreignField: "_id", // Trường khóa chính trong CourseModel
                    as: "courseDetails" // Tên field sẽ chứa thông tin khóa học sau khi lookup
                }
            },
            { $unwind: "$courseDetails" } // Tách mảng courseDetails thành đối tượng đơn
        ]);

        return topSellingCourses;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

// tổng doanh thu mỗi năm
const getAnnualRevenue = async () => {
    try {
        const payments = await PaymentModel.aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: { year: { $year: "$paymentDate" } }, totalRevenue: { $sum: "$total" } } },
            { $sort: { "_id.year": 1 } }
        ]);

        return payments;
    } catch (error) {
        throw new ErrorHandler(500, error);
    }
};

//  lịch sử giao dịch. Sắp xếp theo thời gian giảm dần (gần nhất)
const getTransactionHistory = async () => {
    try {
        const transactions = await PaymentModel.find({ status: 'SUCCESS' })
            .sort({ createdAt: -1 })  // Sắp xếp theo thời gian giảm dần (gần nhất)
            .populate('userID', 'name')
            .exec();

        return transactions;
    } catch (error) {
        throw new Error('Không thể lấy lịch sử giao dịch');
    }
};

module.exports = {
    createVNPayPaymentUrl, updatePaymentStatus, getTotalRevenueByCourseId, getTotalRevenue, getTotalSaleByCourseId,
    getMonthlyRevenue, getTopSellingCourses, getAnnualRevenue, getTransactionHistory
};
