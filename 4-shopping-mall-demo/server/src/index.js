/**
 * 서버 진입점 (Spring의 main / SpringApplication.run 에 해당)
 *
 * 순서: .env 로드 → MongoDB 연결 → Express 앱 생성 → 포트 listen
 * 배포(Cloudtype)는 npm start → 이 파일을 실행한다.
 */
const path = require('path');

// application.properties 와 같음. __dirname 기준이라 cwd가 src여도 .env를 찾음
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });


const createApp = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * 서버 기동 순서:
 * 1) MongoDB 연결
 * 2) Express 앱 생성
 * 3) 지정 포트에서 HTTP 요청 대기
 */
const startServer = async () => {
  try {
    await connectDB();  // DB가 안 되면 API를 띄울 의미가 없으므로 먼저 연결
    const app = createApp();  // 미들웨어·라우트가 설정된 Express 인스턴스

    // 포트 열기 → 브라우저/클라이언트가 여기로 요청을 보냄
    // 0.0.0.0: Cloudtype 등 컨테이너에서 외부 요청 수신
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server 실행 중: http://0.0.0.0:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. Stop the other server or run: npm run dev (auto-frees port)`
        );
        process.exit(1);
      }
      throw error;
    });
  } catch (error) {
    // 예: MongoDB 미실행, MONGODB_URI 누락 등
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
