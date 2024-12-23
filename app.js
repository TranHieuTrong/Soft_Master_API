const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const db = require('./firebase');
require('dotenv').config();

// Khởi tạo Firebase Admin với file serviceAccount
const serviceAccount = require('./softmaster-app-98bb1-firebase-adminsdk-hlrsc-c58681bd8a.json');

// Kiểm tra và khởi tạo Firebase chỉ khi chưa có ứng dụng nào
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Kết nối MongoDB
mongoose.connect('mongodb+srv://yenlyhuynhthi991:yenly991@cluster0.xmeii.mongodb.net/', {})
  .then(() => console.log('>>>>>>>>>> DB Connected!!!!!!'))
  .catch(err => console.log('>>>>>>>>> DB Error: ', err));

// Import các route
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const teacherRouter = require('./routes/teacher');
const subjectRouter = require('./routes/subject');
const courseRouter = require('./routes/course');
const lessonRouter = require('./routes/lesson');
const lessonVideoRouter = require('./routes/lessonVideo');
const followTeacherRouter = require('./routes/followTeacher');
const favoriteCourseRouter = require('./routes/favoriteCourse');
const feedbackCourseRouter = require('./routes/feedbackCourse');
const testRouter = require('./routes/test');
const questionRouter = require('./routes/question');
const scoreRouter = require('./routes/score');
const paymentRouter = require('./routes/payment');
const enrollCourseRouter = require('./routes/enrollCourse');
const certificateRoute = require('./routes/certificate');
const messagesRouter = require('./routes/messages');


const app = express();
// Sử dụng CORS cho Express
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Các route chính
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/teacher', teacherRouter);
app.use('/subject', subjectRouter);
app.use('/course', courseRouter);
app.use('/lesson', lessonRouter);
app.use('/lessonVideo', lessonVideoRouter);
app.use('/followTeacher', followTeacherRouter);
app.use('/favoriteCourse', favoriteCourseRouter);
app.use('/feedbackCourse', feedbackCourseRouter);
app.use('/test', testRouter);
app.use('/question', questionRouter);
app.use('/score', scoreRouter);
app.use('/payment', paymentRouter);
app.use('/enrollCourse', enrollCourseRouter);
app.use('/certificate', certificateRoute);
app.use('/message', messagesRouter);


// Tạo server HTTP
const server = http.createServer(app);

// Tạo instance socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Khi client kết nối tới server qua socket.io
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Xử lý sự kiện khi client gửi tin nhắn
  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);

    // Phát tin nhắn tới tất cả các client khác
    io.emit('broadcastMessage', message);

    // Gửi thông báo FCM đến thiết bị di động
    const fcmMessage = {
      notification: {
        title: 'Tin nhắn mới',
        body: message.text,
      },
      token: message.token
    };

    admin.messaging().send(fcmMessage)
      .then((response) => {
        console.log('Thông báo FCM đã gửi thành công:', response);
      })
      .catch((error) => {
        console.log('Lỗi khi gửi thông báo FCM:', error);
      });
  });

  // Khi client ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Xử lý lỗi 404
app.use((req, res, next) => {
  next(createError(404));
});

// Xử lý các lỗi khác
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Khởi động server tại cổng 3001
server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

module.exports = app;
