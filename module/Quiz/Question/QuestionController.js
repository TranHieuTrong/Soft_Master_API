const mongoose = require('mongoose');
const QuestionModel = require('../Question/QuestionModel');

// Tạo nhiều câu hỏi mới
const createQuestions = async (req, res) => {
  const { teacherID, testID } = req.params;
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || !teacherID || !testID) {
    return res.status(400).json({ message: 'Thiếu thông tin câu hỏi' });
  }

  try {
    const existingQuestion = await QuestionModel.findOne({ testID });

    const newQuestions = questions.map(question => ({
      questionID: new mongoose.Types.ObjectId(),
      title: question.title,
      options: question.options,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    if (existingQuestion) {
      existingQuestion.questions.push(...newQuestions);
      await existingQuestion.save();
      res.status(201).json(newQuestions);
    } else {
      const question = new QuestionModel({
        testID,
        teacherID,
        questions: newQuestions,
      });
      await question.save();
      res.status(201).json(question);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo câu hỏi mới' });
  }
};

// Lấy tất cả câu hỏi
const getAllQuestions = async (req, res) => {
  const { testID } = req.params;

  try {
    const questions = await QuestionModel.findOne({ testID });

    if (!questions) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài kiểm tra này' });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy câu hỏi' });
  }
};

// Lấy tất cả câu hỏi ngẫu nhiên
const getRandomQuestions = async (req, res) => {
  const { testID } = req.params;

  try {
    const questionsData = await QuestionModel.findOne({ testID });

    if (!questionsData) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi cho bài kiểm tra này' });
    }

    let randomQuestions = [...questionsData.questions].sort(() => Math.random() - 0.5);

    randomQuestions = randomQuestions.map(question => {
      const randomOptions = [...question.options].sort(() => Math.random() - 0.5);
      return {
        ...question.toObject(),
        options: randomOptions
      };
    });

    res.status(200).json(randomQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy câu hỏi ngẫu nhiên' });
  }
};

// Lấy chi tiết câu hỏi theo questionID và testID
const getDetailQuestionById = async (req, res) => {
  const { questionID, testID } = req.params;

  try {
    const questionData = await QuestionModel.findOne({ testID, 'questions.questionID': questionID });

    if (!questionData) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    const foundQuestion = questionData.questions.find(q => q.questionID.toString() === questionID);

    res.status(200).json(foundQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy câu hỏi' });
  }
};

// Xóa câu hỏi
const deleteQuestion = async (req, res) => {
  const { questionID, testID } = req.params;

  try {
    const test = await QuestionModel.findOne({ testID });

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài kiểm tra' });
    }

    const questionIndex = test.questions.findIndex(q => q.questionID.toString() === questionID);

    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    test.questions.splice(questionIndex, 1);
    await test.save();

    res.status(200).json({ message: 'Câu hỏi đã được xóa thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa câu hỏi' });
  }
};

// Cập nhật câu hỏi
const updateQuestion = async (req, res) => {
  const { testID, questionID } = req.params;
  const { title, options } = req.body;

  if (!title || !Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ message: 'Thiếu thông tin câu hỏi hoặc đáp án không hợp lệ' });
  }

  try {
    const test = await QuestionModel.findOne({ testID });

    if (!test) {
      return res.status(404).json({ message: 'Không tìm thấy bài kiểm tra' });
    }

    const question = test.questions.find(q => q.questionID.toString() === questionID);

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    question.title = title;
    question.options = options;
    question.updatedAt = Date.now();

    await test.save();

    res.status(200).json({ message: 'Câu hỏi đã được cập nhật thành công', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật câu hỏi' });
  }
};

module.exports = {
  createQuestions,
  getAllQuestions,
  getRandomQuestions,
  getDetailQuestionById,
  deleteQuestion,
  updateQuestion,
};
