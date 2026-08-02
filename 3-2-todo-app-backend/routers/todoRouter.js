const express = require("express"); // 라우터 생성을 위해 Express 불러오기
const Todo = require("../models/todoModel"); // Todo 모델(DB 조회/저장용)

const router = express.Router(); // /todos API용 라우터 객체 생성

// 할일 목록 조회
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "할일 조회에 실패했습니다.", error: error.message });
  }
});

// 할일 단건 조회
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "할일을 찾을 수 없습니다." });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: "할일 조회에 실패했습니다.", error: error.message });
  }
});

// 할일 생성
router.post("/", async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "할일 제목을 입력해주세요." });
    }

    const todo = await Todo.create({
      title: title.trim(),
      completed: completed ?? false,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: "할일 생성에 실패했습니다.", error: error.message });
  }
});

// 할일 수정
router.put("/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;
    const updateData = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "할일 제목을 입력해주세요." });
      }
      updateData.title = title.trim();
    }

    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const todo = await Todo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return res.status(404).json({ message: "할일을 찾을 수 없습니다." });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: "할일 수정에 실패했습니다.", error: error.message });
  }
});

// 할일 삭제
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "할일을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "할일이 삭제되었습니다.", todo });
  } catch (error) {
    res.status(500).json({ message: "할일 삭제에 실패했습니다.", error: error.message });
  }
});

module.exports = router; // index.js에서 app.use("/todos", ...)로 연결할 수 있게 내보내기
