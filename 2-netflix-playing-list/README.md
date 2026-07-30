# Netflix Playing List

TMDB API를 활용한 Netflix 스타일 영화 목록 웹 앱입니다.  
로그인 후 **현재 상영작(Now Playing)** 을 히어로·가로 스크롤 리스트·상세 모달로 확인할 수 있습니다.

## Features

- Netflix 스타일 로그인 화면 (데모용 인증)
- `localStorage` 기반 로그인 상태 유지 / 로그아웃
- 홈 진입 시 인증 가드 (미로그인 시 로그인 페이지로 이동)
- TMDB `now_playing` API로 현재 상영 영화 조회 (한국어)
- 인기순 대표작 Hero 배너 (재생 / 상세 정보)
- 가로 스크롤 영화 카드 행 (이전·다음 네비게이션)
- 영화 상세 모달 (평점, 개봉일, 투표 수, 줄거리)
- 로딩·에러·빈 목록 상태 UI
- 반응형 레이아웃

## Tech Stack

- HTML5
- CSS3 (공통 + 페이지 + 컴포넌트 분리)
- Vanilla JavaScript
- [TMDB API](https://www.themoviedb.org/)
- Google Fonts (Bebas Neue)

## Project Structure

```
2-netflix-playing-list/
├── index.html              # 로그인
├── home.html               # 홈 (현재 상영작)
├── css/
│   ├── common.css
│   ├── login.css
│   ├── home.css
│   └── components/
│       ├── navbar.css
│       ├── hero.css
│       ├── movie-card.css
│       └── modal.css
└── js/
    ├── secrets.example.js  # API 키 예시 (복사해서 secrets.js 생성)
    ├── config.js
    ├── auth.js
    ├── api.js
    ├── login.js
    ├── home.js
    └── components/
        ├── navbar.js
        ├── hero.js
        ├── movie-card.js
        └── modal.js
```

## Getting Started

1. 저장소를 클론합니다.

```bash
git clone https://github.com/SEOKBEOM-OH/vibe-coding-portfolio.git
cd vibe-coding-portfolio/2-netflix-playing-list
```

2. [TMDB](https://www.themoviedb.org/settings/api)에서 API 키를 발급받습니다.

3. 시크릿 파일을 만들고 키를 넣습니다.

```bash
cp js/secrets.example.js js/secrets.js
```

`js/secrets.js` 예시:

```js
const SECRETS = {
  API_KEY: "발급받은_TMDB_API_KEY",
};
```

`secrets.js`는 Git에 커밋되지 않습니다.

4. `index.html`을 브라우저에서 엽니다.  
   또는 VS Code Live Server 등으로 로컬 서버를 띄워도 됩니다.

5. 데모 로그인: **아무 이메일** + **비밀번호 4자 이상**으로 로그인할 수 있습니다.

## Notes

- 실제 Netflix 계정이 아니며, 학습용 클론입니다.
- 영화 데이터·이미지는 TMDB에서 제공합니다.
- API 키가 없거나 잘못되면 홈에서 영화 목록을 불러오지 못합니다.

## License

Personal / learning project.
