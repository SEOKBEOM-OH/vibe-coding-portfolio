# Shopping Mall Client

React + Vite 프론트엔드입니다.

## 사전 요구사항

- Node.js 18+
- 백엔드 서버 (`server`) 실행 중이면 API 연결 상태를 확인할 수 있습니다.

## 설치

```bash
cd client
npm install
```

## 환경 변수

`.env.example`을 참고해 `.env` 파일을 작성합니다.

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_URL` | 백엔드 API 주소 | `http://localhost:5000` |

## 실행

```bash
# 개발 서버 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 폴더 구조

```
client/
├── public/           # 정적 파일
├── src/
│   ├── api/          # API 호출 유틸
│   ├── assets/       # 이미지 등 에셋
│   ├── components/   # 공통 컴포넌트
│   ├── hooks/        # 커스텀 훅
│   ├── pages/        # 페이지 컴포넌트
│   ├── App.jsx       # 라우터 설정
│   ├── main.jsx      # 앱 진입점
│   └── index.css     # 전역 스타일
├── .env
├── index.html
├── package.json
└── vite.config.js
```

## 백엔드 연동

- 개발 서버 포트: `3000` (서버 CORS `CLIENT_URL`과 동일)
- `/api` 요청은 Vite 프록시를 통해 `http://localhost:5000`으로 전달됩니다.
