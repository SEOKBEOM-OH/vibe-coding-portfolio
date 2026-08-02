const path = require("path"); // 경로 조합용 Node 내장 모듈

require("dotenv").config({ path: path.join(__dirname, ".env") });  // 현재 파일(index.js)이 있는 폴더의 .env를 읽어 process.env에 로드

const dns = require("dns"); // DNS 조회 설정용
const express = require("express"); // 웹 서버 프레임워크
const cors = require("cors"); // 다른 출처(프론트)에서의 API 요청 허용
const mongoose = require("mongoose"); // MongoDB 연결/ORM

// Windows/일부 ISP DNS에서 Atlas SRV 조회가 실패하는 경우 대비 (Google DNS 사용)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("./models/todoModel"); // Todo 스키마(모델) 등록
const todoRouter = require("./routers/todoRouter"); // /todos CRUD 라우터

const app = express(); // Express 앱 생성
const PORT = process.env.PORT || 5000;  // 서버 포트
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo";  // .env의 MONGO_URI 사용, 없으면 로컬 MongoDB로 연결

// CORS: 프론트엔드(다른 포트)에서 API 호출 가능하게 설정
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // 요청 body(JSON) 파싱
app.use("/todos", todoRouter); // /todos 경로에 할일 API 연결

// MongoDB 연결 후 서버 시작
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI); // DB 연결
    console.log(">>> MongoDB 연결 성공");
    console.log(`>>> 연결 DB: ${mongoose.connection.name}`);
    console.log(`>>> 연결 호스트: ${mongoose.connection.host}`);

    // DB 연결 성공 시 HTTP 서버 기동
    app.listen(PORT, () => {
      console.log(`>>> 서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error(">>> MongoDB 연결 실패:", error.message);
    process.exit(1); // 연결 실패 시 프로세스 종료
  }
}

startServer(); // 서버 실행
