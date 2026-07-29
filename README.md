# eleFolio — Product Designer Portfolio

HTML, CSS, JavaScript로 만든 프로덕트 디자이너 포트폴리오 웹사이트입니다.

**Live demo:** [vibe-coding-portfolio-rouge.vercel.app](https://vibe-coding-portfolio-rouge.vercel.app)

## Features

- Navbar (데스크톱 / 모바일 햄버거 메뉴)
- Hero 섹션
- About 섹션
- Portfolio / Projects 섹션
- Skills 섹션
- 스크롤 등장 애니메이션
- 반응형 레이아웃

## Tech Stack

- HTML5
- CSS3 (모듈 분리, CSS 변수)
- Vanilla JavaScript
- Google Fonts (Poppins)
- Font Awesome 6

## Project Structure

```
.
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── layout.css
│   ├── navbar.css
│   ├── hero.css
│   ├── about.css
│   ├── portfolio.css
│   ├── skills.css
│   ├── services.css
│   └── responsive.css
└── js/
    ├── navbar.js
    ├── hero.js
    ├── about.js
    ├── portfolio.js
    ├── skills.js
    ├── services.js
    └── main.js
```

각 섹션은 JS에서 DOM으로 렌더링하고, 스타일은 섹션별 CSS 파일로 분리되어 있습니다.

## Getting Started

별도 빌드 도구 없이 바로 실행할 수 있습니다.

1. 이 저장소를 클론합니다.

```bash
git clone https://github.com/SEOKBEOM-OH/vibe-coding-portfolio.git
cd vibe-coding-portfolio
```

2. `index.html`을 브라우저에서 엽니다.  
   또는 VS Code의 Live Server 등으로 로컬 서버를 띄워도 됩니다.

## Notes

- 외부 의존성은 CDN으로 로드됩니다 (Google Fonts, Font Awesome).
- `services` 관련 CSS/JS 파일은 포함되어 있으나, 현재 `index.html`에는 해당 섹션이 연결되어 있지 않을 수 있습니다.

## License

Personal / learning project.
