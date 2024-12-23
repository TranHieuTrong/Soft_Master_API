const TestModel = require('./TestModel');
const { ErrorHandler } = require('../../errorHandler');

const getAll = async () => {
    try {
        return await TestModel.find();
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách'); 
    }
};


const getTestByLessonID = async (lessonID) => {
    try {
        return await TestModel.find({ lessonID });
    } catch (error) {
        console.error('Error in getTestByLessonID:', error);
        throw new ErrorHandler(500, 'Không thể lấy Test theo ID Lesson');
    }
};

const addTest = async (title, lessonID) => {
    try {
        const newTest = new TestModel({
            title, lessonID
        });

        await newTest.save();

        return { message: 'Thêm Test thành công', newTest };
    } catch (error) {
        console.error('Error in addTest:', error);
        throw new ErrorHandler(500, 'Không thể thêm Test');
    }
};

const updateTest = async (testID, title, lessonID) => {
    try {
        const updateData = { title, lessonID };
        // Cập nhật Test và trả về Test đã cập nhật
        const test = await TestModel.findByIdAndUpdate(testID, updateData, { new: true });

        if (!test) {
            throw new ErrorHandler(404, 'Test không tồn tại');
        }

        return test;
    } catch (error) {
        console.error('Error in updateTest:', error);
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin Test');
    }
};

const deleteTest = async (testID, lessonID) => {
    try {
        const test = await TestModel.findByIdAndDelete(testID, lessonID);

        if (!test) {
            throw new ErrorHandler(404, 'Test không tồn tại');
        }

        return test;
    } catch (error) {
        console.error('Error in deleteTest:', error);
        throw new ErrorHandler(500, 'Không thể xóa Test');
    }
};

module.exports = { getAll, getTestByLessonID, addTest, updateTest, deleteTest };
