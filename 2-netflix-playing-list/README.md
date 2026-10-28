# Netflix Playing List

TMDB API를 활용한 Netflix 스타일 영화 목록 웹 앱입니다.  
로그인 후 **현재 상영작(Now Playing)** 을 히어로·가로 스크롤 리스트·상세 모달로 확인할 수 있습니다.


## 접속 흐름

영화 목록이 보이는 주소는 아래 공개 주소입니다.

**https://vibe-coding-portfolio-uidm.vercel.app/**

1. 위 주소로 접속하면 로그인 화면이 열립니다.
2. 데모 로그인입니다. **아무 이메일**과 **비밀번호 4자 이상**이면 로그인됩니다. 실제 Netflix 계정이 아닙니다.
3. 로그인하면 `home.html`로 이동하고, 현재 상영작 목록이 표시됩니다.
4. 로그아웃하면 다시 로그인 화면으로 돌아갑니다.

로그인 상태는 브라우저 `localStorage`에만 저장됩니다. `index.html` 파일을 더블클릭해 `file://`로 열면 브라우저가 이 저장을 막아 로그인 버튼이 넘어가지 않습니다. 로컬에서 볼 때는 아래 [로컬에서 실행](#로컬에서-실행)처럼 서버 주소로 엽니다.


### Vercel에서 여는 경우

Vercel 프로젝트 이름은 `vibe-coding-portfolio-uidm`입니다.

| 메뉴 | 의미 |
| --- | --- |
| Overview | 지금 방문자에게 열리는 배포 하나. 공개 주소가 가리키는 현재 Production |
| Deployments | 지금까지 배포한 기록. 한 줄이 그 커밋 시점의 사이트 |

Deployments의 예전 배포를 열면 그 시점의 코드가 열립니다. 영화 목록용 서버 호출을 넣기 전 배포에는 목록이 없습니다. 목록을 확인할 때는 Overview의 공개 주소, 또는 Deployments에서 **Production** 배지가 붙은 최신 배포를 엽니다.

대시보드의 Visit / Open은 `vibe-coding-portfolio-uidm-....vercel.app`처럼 배포 전용 주소로 열릴 수 있습니다. 이 프로젝트는 Deployment Protection(Standard Protection)이 켜져 있어서, 그 주소의 목록 API가 Vercel 로그인으로 막힐 수 있습니다. 목록 확인은 공개 주소를 사용합니다.


## 영화 목록이 나오는 경로

키는 [TMDB API 설정](https://www.themoviedb.org/settings/api)에서 발급받았습니다.

| 어디서 여나 | 키가 있는 곳 | 목록 요청 |
| --- | --- | --- |
| Vercel 공개 주소 | Vercel 환경 변수 `TMDB_API_KEY` | 브라우저 → `/api/now-playing` → TMDB |
| 로컬 서버 | `js/secrets.js`의 `API_KEY` | 브라우저 → TMDB 직접 호출 |

Vercel에는 환경 변수를 이렇게 등록해 두었습니다.

- 위치: 프로젝트 `vibe-coding-portfolio-uidm` → **Environment Variables**
- Key: `TMDB_API_KEY`
- Value: [TMDB API 설정](https://www.themoviedb.org/settings/api)에서 발급받은 키
- Environments: **Production**

`js/secrets.js`는 Git에 올리지 않습니다. 
Vercel 페이지는 이 파일을 읽지 않고, `api/now-playing.js`가 환경 변수 `TMDB_API_KEY`만 읽습니다. 
키 이름을 `secrets.js` 안에서 `TMDB_API_KEY`로 바꿀 필요는 없습니다. 그 파일의 속성 이름은 `API_KEY`입니다.

환경 변수를 추가하거나 값을 바꾼 뒤에는 Deployments에서 최신 배포를 **Redeploy**해야 실행 중인 사이트가 새 값을 읽습니다. `main`에 푸시하면 Production이 자동으로 다시 배포됩니다.

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
- Vercel Serverless Function (`api/now-playing.js`)
- Google Fonts (Bebas Neue)


## Project Structure

```
2-netflix-playing-list/
├── index.html              # 로그인
├── home.html               # 홈 (현재 상영작)
├── api/
│   └── now-playing.js      # Vercel 함수. TMDB_API_KEY 로 현재 상영작 조회
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
    ├── secrets.js          # 로컬 전용. Git에 없음
    ├── config.js
    ├── auth.js
    ├── api.js              # 키 있으면 TMDB 직접, 없으면 /api/now-playing
    ├── login.js
    ├── home.js
    └── components/
        ├── navbar.js
        ├── hero.js
        ├── movie-card.js
        └── modal.js
```


## 로컬에서 실행

1. 저장소를 클론합니다. (GitHub에 올려 둔 프로젝트 파일을 내 컴퓨터로 통째로 복사하는 일)

```bash
git clone https://github.com/SEOKBEOM-OH/vibe-coding-portfolio.git
cd vibe-coding-portfolio/2-netflix-playing-list
```

2. [TMDB API 설정](https://www.themoviedb.org/settings/api)에서 API 키를 발급받습니다. 
   Vercel에 넣어 둔 키와 같은 키를 써도 됩니다.

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

4. 프로젝트 폴더에서 로컬 서버를 띄웁니다.

```bash
python -m http.server 5500
```

5. 브라우저에서 http://localhost:5500 을 엽니다. `index.html`을 더블클릭하지 않습니다.

6. 데모 로그인: **아무 이메일** + **비밀번호 4자 이상**.


## Notes

- 실제 Netflix 계정이 아니며, 학습용 클론입니다.
- 영화 데이터·이미지는 TMDB에서 제공합니다.
- Vercel에서 목록이 안 보이면 공개 주소인지, Deployments의 최신 Production인지 먼저 확인합니다.
- 환경 변수 이름이 `TMDB_API_KEY`가 아니거나 Production에 없으면 `/api/now-playing`이 실패합니다.
- 로컬에서 `secrets.js`가 없거나 키가 잘못되면 홈에서 영화 목록을 불러오지 못합니다.


## License

Personal / learning project.
