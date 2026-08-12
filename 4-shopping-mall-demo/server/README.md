# Shopping Mall Server

Node.js + Express + MongoDB API 서버입니다.

## 사전 요구사항

- Node.js 18+
- MongoDB (로컬 실행 또는 MongoDB Atlas)

## 설치

```bash
cd server
npm install
```

## 환경 변수

`.env.example`을 참고해 `.env` 파일을 작성합니다.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `PORT` | 서버 포트 | `5000` |
| `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb://127.0.0.1:27017/shopping-mall` |
| `CLIENT_URL` | CORS 허용 프론트엔드 주소 | `http://localhost:3000` |

## 실행

```bash
# 개발 모드 (src 파일 내용이 바뀔 때만 자동 재시작)
npm run dev

# 프로덕션 모드 (자동 재시작 없음)
npm start
```

`scripts/dev.js`가 `src`를 감시하며, **파일 내용이 실제로 변경된 경우에만** 서버를 재시작합니다.  
(수정 없이 Ctrl+S만 누른 경우에는 재시작하지 않습니다.)

## API

- `GET /api` — 서버 상태 확인

## 폴더 구조

```
server/
├── src/
│   ├── config/       # DB 연결 등 설정
│   ├── middleware/   # 공통 미들웨어
│   ├── models/       # Mongoose 모델
│   ├── routes/       # API 라우트
│   ├── controllers/  # 요청 처리 로직
│   ├── app.js        # Express 앱 설정
│   └── index.js      # 서버 진입점
├── .env
├── .env.example
├── .gitignore
└── package.json
```
