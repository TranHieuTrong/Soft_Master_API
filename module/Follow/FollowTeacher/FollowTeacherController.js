// FollowTeacherController.js
const FollowTeacherModel = require('./FollowTeacherModel');
const { ErrorHandler } = require('../../errorHandler');

// Hàm theo dõi giáo viên
const followTeacher = async (userID, teacherID) => {
    try {
        // t kiểm tra teacherID
        let follow = await FollowTeacherModel.findOne({ teacherID });

        if (!follow) {
            // Nếu chưa có teacher này thì tạo mới
            follow = new FollowTeacherModel({ teacherID, followers: [userID] });
        } else {
            // Nếu teacher đã tồn tại, kiểm tra userID
            if (!follow.followers.includes(userID)) {
                follow.followers.push(userID);
            } else {
                return { message: 'Người dùng đã theo dõi giáo viên này', follow };
            }
        }

        await follow.save();
        return { message: 'Theo dõi thành công', follow };
    } catch (error) {
        console.log('Lỗi khi theo dõi giáo viên:', error);
        throw new ErrorHandler(500, 'Không thể thêm theo dõi');
    }
};

// Hàm lấy danh sách người theo dõi một giáo viên
const getFollowsByTeacherID = async (teacherID) => {
    try {
        const follows = await FollowTeacherModel.findOne({ teacherID }).populate('followers');
        if (!follows || follows.followers.length === 0) {
            console.log('Không tìm thấy followers cho teacherID này');
            return [];
        }
        console.log('Danh sách người theo dõi:', follows.followers);
        return follows.followers;
    } catch (error) {
        console.log('Lỗi khi lấy danh sách người theo dõi:', error);
        throw new ErrorHandler(500, 'Không thể lấy danh sách người dùng theo dõi giảng viên');
    }
};

// Hàm lấy danh sách giáo viên mà người dùng đang theo dõi
const getTeachersFollowedByUser = async (userID) => {
    try {
        const follows = await FollowTeacherModel.find({ followers: userID }).populate('teacherID');
        return follows.map(follow => follow.teacherID);
    } catch (error) {
        console.log('Lỗi khi lấy danh sách giáo viên:', error);
        throw new ErrorHandler(500, 'Không thể lấy danh sách giảng viên người dùng đang theo dõi');
    }
};

// Hàm hủy theo dõi giáo viên
const unFollowTeacher = async (teacherID, userID) => {
    try {
        const follow = await FollowTeacherModel.findOne({ teacherID });

        if (!follow) {
            throw new ErrorHandler(404, 'Theo dõi không tồn tại');
        }

        // Xóa userID khỏi mảng followers
        follow.followers = follow.followers.filter(follower => !follower.equals(userID));

        if (follow.followers.length === 0) {
            await FollowTeacherModel.findByIdAndDelete(follow._id);
        } else {
            await follow.save();
        }

        return { message: 'Xóa theo dõi thành công', follow };
    } catch (error) {
        console.log('Lỗi khi hủy theo dõi:', error);
        throw new ErrorHandler(500, 'Không thể xóa theo dõi');
    }
};

// Hàm lấy số lượng người theo dõi của một giáo viên
const getCountFollowersByTeacherID = async (teacherID) => {
    try {
        const follow = await FollowTeacherModel.findOne({ teacherID });
        const count = follow ? follow.followers.length : 0;
        return { teacherID, followerCount: count };
    } catch (error) {
        console.log('Lỗi khi lấy số lượng người theo dõi:', error);
        throw new ErrorHandler(500, 'Không thể đếm số lượng người theo dõi');
    }
};

// check trạng thái user có follow teacher đó chưa
const isUserFollowingTeacher = async (userID, teacherID) => {
    try {
        const follow = await FollowTeacherModel.findOne({ teacherID, followers: userID });
        return follow ? true : false;
    } catch (error) {
        console.log('Loi khi check trạng thái follow:', error);
        throw new ErrorHandler(500, 'Không thể kiểm tra trạng thái follow');
    }
};

module.exports = { followTeacher, getFollowsByTeacherID, getTeachersFollowedByUser, unFollowTeacher, getCountFollowersByTeacherID, isUserFollowingTeacher };
