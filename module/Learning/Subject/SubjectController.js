const SubjectModel = require('./SubjectModel');
const { ErrorHandler } = require('../../errorHandler');

const getAll = async () => {
    try {
        return await SubjectModel.find();
    } catch (error) {
        throw new ErrorHandler(500, 'Không thể lấy danh sách');
    }
};

const addSubject = async (name, img) => {
    try {
        const newSubject = new SubjectModel({
            name, img
        });

        await newSubject.save();

        return { message: 'Thêm Subject thành công', newSubject };
    } catch (error) {
        console.error('Error in addSubject:', error);
        throw new ErrorHandler(500, 'Không thể thêm Subject');
    }
};

const updateSubject = async (subjectID, name, img) => {
    try {
        const updateData = { name, img };
        // Cập nhật subject và trả về subject đã cập nhật
        const subject = await SubjectModel.findByIdAndUpdate(subjectID, updateData, { new: true });

        if (!subject) {
            throw new ErrorHandler(404, 'Subject không tồn tại');
        }

        return subject;
    } catch (error) {
        console.error('Error in updateSubject:', error);
        throw new ErrorHandler(500, 'Không thể cập nhật thông tin Subject');
    }
};

const deleteSubject = async (subjectID) => {
    try {
        const subject = await SubjectModel.findByIdAndDelete(subjectID);

        if (!subject) {
            throw new ErrorHandler(404, 'Subject không tồn tại');
        }

        return subject;
    } catch (error) {
        console.error('Error in deleteSubject:', error);
        throw new ErrorHandler(500, 'Không thể xóa Subject');
    }
};

module.exports = { getAll, addSubject, updateSubject, deleteSubject };
