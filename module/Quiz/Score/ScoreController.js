const ScoreModel = require('./ScoreModel');

// Lấy tất cả điểm
const getAllScores = async (req, res) => {
    try {
        const scores = await ScoreModel.find().populate('userID', 'name').populate('testID', 'name'); // Populate thêm testID
        res.status(200).json({ scores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy tất cả điểm' });
    }
};

// Lấy điểm theo userID
const getScoreByUserID = async (req, res) => {
    const { userID } = req.params;

    try {
        const scores = await ScoreModel.find({ userID })
            .populate('userID', 'name') // Lấy thông tin người dùng
            .populate('testID', 'name'); // Lấy thông tin bài kiểm tra từ testID

        if (!scores || scores.length === 0) {
            return res.status(200).json({ message: 'Không tìm thấy điểm cho userID này', scores: [] });
        }

        res.status(200).json({ scores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy điểm theo userID' });
    }
};


// const addScore = async (req, res) => {
//     const { userID, testID, score } = req.body;

//     try {
//         const userScore = await ScoreModel.findOne({ userID, testID });

//         if (userScore && userScore.score === 10) {
//             // Đã đạt 10 điểm, không cần cập nhật và không làm lại bài
//             return res.status(400).json({
//                 message: 'Bạn đã đạt 10 điểm, không thể làm lại bài kiểm tra này!',
//             });
//         }

//         if (userScore) {
//             if (userScore.score < 10) {
//                 // Chưa đạt 10 điểm, xuất thông báo
//                 return res.status(400).json({
//                     message: 'Bạn chưa đạt 10 điểm. Bạn muốn làm lại bài kiểm tra này không? Bạn không thể làm tiếp các bài kiểm tra khác cho đến khi đạt 10 điểm.',
//                 });
//             }
//         } else {
//             // Tạo điểm mới
//             const newScore = new ScoreModel({ userID, testID, score });
//             await newScore.save();
//             return res.status(201).json({
//                 message: 'Điểm đã được thêm thành công. Hãy làm lại để đạt 10 điểm.',
//                 newScore,
//             });
//         }
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ message: 'Lỗi khi thêm hoặc cập nhật điểm' });
//     }
// };

const addScore = async (req, res) => {
    const { userID, testID, score } = req.body;

    try {
        // Kiểm tra nếu người dùng đã làm bài kiểm tra này
        const userScore = await ScoreModel.findOne({ userID, testID });

        if (userScore) {
            // Nếu người dùng đã đạt 10 điểm, không cho phép cập nhật điểm nữa
            if (userScore.score === 10) {
                return res.status(400).json({
                    message: 'Bạn đã đạt 10 điểm, không thể làm lại bài kiểm tra này!',
                });
            }

            // Nếu người dùng chưa đạt 10 điểm, cập nhật điểm mới
            userScore.score = score;  // Ghi đè điểm mới
            await userScore.save();  // Lưu lại thông tin đã cập nhật

            return res.status(200).json({
                message: 'Điểm đã được cập nhật thành công.',
                score: userScore,
            });
        } else {
            // Nếu người dùng chưa làm bài kiểm tra, tạo điểm mới
            const newScore = new ScoreModel({ userID, testID, score });
            await newScore.save();

            return res.status(201).json({
                message: 'Điểm đã được thêm thành công.',
                score: newScore,
            });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Lỗi khi thêm hoặc cập nhật điểm' });
    }
};

// const addScore = async (req, res) => {
//     const { userID, testID, score } = req.body;

//     try {
//         // Kiểm tra nếu người dùng đã có điểm cho bài kiểm tra này
//         const existingScore = await ScoreModel.findOne({ userID, testID });

//         if (existingScore) {
//             // Nếu người dùng đã có điểm cho bài kiểm tra này, bạn có thể cập nhật điểm
//             if (existingScore.score === 10) {
//                 return res.status(400).json({
//                     message: 'Bạn đã đạt 10 điểm. Bạn không thể làm lại bài kiểm tra này.',
//                 });
//             }

//             // Cập nhật điểm mới cho bài kiểm tra này
//             existingScore.score = score;  // Cập nhật điểm mới
//             await existingScore.save();    // Lưu lại

//             return res.status(200).json({
//                 message: 'Điểm đã được cập nhật thành công.',
//                 score: existingScore,
//             });
//         } else {
//             // Nếu người dùng chưa làm bài kiểm tra này, tạo điểm mới
//             const newScore = new ScoreModel({ userID, testID, score });
//             await newScore.save(); // Lưu điểm mới

//             return res.status(201).json({
//                 message: 'Điểm đã được thêm thành công.',
//                 score: newScore,
//             });
//         }
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ message: 'Lỗi khi thêm hoặc cập nhật điểm' });
//     }
// };


const getPointByTestIDAndUserID = async (req, res) => {
    const { testID, userID } = req.params;

    try {
        // Kiểm tra đầu vào có hợp lệ không
        if (!testID || !userID) {
            return res.status(400).json({ message: 'Thiếu testID hoặc userID' });
        }

        // Tìm điểm của người dùng cho bài kiểm tra
        const scores = await ScoreModel.find({ testID, userID })
            .populate('userID', 'name')   // Lấy trường 'name' của user
            .populate('testID', 'title');  // Lấy trường 'name' của test

        console.log('Scores found:', scores); // Kiểm tra kết quả trả về

        if (!scores.length) {
            return res.status(404).json({ message: 'Không tìm thấy điểm của người dùng cho bài kiểm tra này' });
        }

        res.status(200).json({ scores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy điểm' });
    }
};

// Lấy điểm của người dùng cho câu hỏi cụ thể (nếu cần)
const getPoint = async (req, res) => {
    const { userID, testID } = req.params;

    try {
        const score = await ScoreModel.findOne({ userID, testID }).populate('testID', 'name'); // Truy vấn theo testID
        if (!score) {
            return res.status(404).json({ message: 'Không tìm thấy điểm của người dùng' });
        }
        res.status(200).json({ score });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy điểm' });
    }
};

// // Kiểm tra điều kiện làm bài kiểm tra tiếp theo
// const canTakeTest = async (req, res) => {
//     const { userID } = req.params;

//     try {
//         // Lấy tất cả điểm của người dùng, sắp xếp theo thời gian làm bài (mới nhất lên đầu)
//         const scores = await ScoreModel.find({ userID }).sort({ createdAt: -1 });

//         // Kiểm tra nếu người dùng chưa làm bài kiểm tra nào
//         if (scores.length === 0) {
//             return res.status(200).json({ message: 'Người dùng có thể làm bài kiểm tra đầu tiên.' });
//         }

//         // Lấy bài kiểm tra cuối cùng (mới nhất)
//         const lastScore = scores[0];

//         // Kiểm tra điểm bài kiểm tra cuối cùng
//         if (lastScore.score < 10) {
//             return res.status(403).json({
//                 message: 'Người dùng chưa đạt đủ điểm để làm bài kiểm tra tiếp theo.',
//                 lastTestID: lastScore.testID, // ID bài kiểm tra chưa đạt
//                 score: lastScore.score // Điểm của bài kiểm tra cuối cùng
//             });
//         }

//         res.status(200).json({ message: 'Người dùng có thể làm bài kiểm tra tiếp theo.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi kiểm tra điều kiện làm bài kiểm tra.' });
//     }
// };

const canTakeTest = async (req, res) => {
    const { userID, testID } = req.params;

    try {
        const userScore = await ScoreModel.findOne({ userID, testID });

        if (!userScore) {
            return res.status(404).json({ message: 'Người dùng chưa làm bài kiểm tra này.' });
        }

        if (userScore.score === 10) {
            return res.status(200).json({
                message: 'Bạn đã đạt 10 điểm. Bạn có thể qua bài kiểm tra tiếp theo.',
                score: userScore.score,
            });
        } else {
            return res.status(400).json({
                message: 'Bạn chưa đạt 10 điểm. Bạn cần làm lại bài kiểm tra này trước khi qua bài khác.',
                score: userScore.score,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi kiểm tra điều kiện qua bài kiểm tra tiếp theo.' });
    }
};

// lấy điểm của bài test
const getScoreByTestID = async (req, res) => {
    const { userID, testID } = req.params;

    // Kiểm tra đầu vào
    if (!userID || !testID) {
        return res.status(400).json({ message: 'Thiếu userID hoặc testID trong yêu cầu' });
    }

    try {
        const scores = await ScoreModel.find({ userID, testID })
            .populate('userID', 'name') // Lấy tên user
            .populate('testID', 'title'); // Lấy tiêu đề bài kiểm tra

        // Nếu không tìm thấy kết quả
        if (!scores.length) {
            return res.status(404).json({ message: 'Không tìm thấy điểm của bài kiểm tra này' });
        }

        // Trả về kết quả
        res.status(200).json({ scores });
    } catch (error) {
        // Log lỗi đầy đủ để dễ debug
        console.error('Lỗi khi lấy điểm:', error);

        // Trả về lỗi server
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy điểm, vui lòng thử lại sau.' });
    }
};


module.exports = {
    addScore,
    getPoint,
    getPointByTestIDAndUserID,
    getAllScores,
    getScoreByUserID,
    canTakeTest,
    getScoreByTestID
};
