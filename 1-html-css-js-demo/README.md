# eleFolio — Product Designer Portfolio

HTML, CSS, Vanilla JavaScript로 구현한 프로덕트 디자이너 포트폴리오 랜딩 페이지입니다.  
빌드 도구 없이 브라우저에서 바로 실행할 수 있습니다.

**Live demo:** [vibe-coding-portfolio-rouge.vercel.app](https://vibe-coding-portfolio-rouge.vercel.app)

## Overview

**eleFolio**는 프리랜스 프로덕트 디자이너(SEOKBEOM_OH)를 소개하는 원페이지 포트폴리오입니다.

- 브랜드 소개와 CTA(Contact / Download CV)
- 제공 서비스(User Research, Visual Design, User Testing, Prototyping)
- 프로젝트 미리보기(브라우저 UI 모티브)
- 스킬 영역(Brand Identity, Product Design, Interaction Design, App Design)

각 섹션은 JS가 DOM에 마크업을 렌더링하고, 스타일은 섹션별 CSS 모듈로 분리되어 있습니다.

## Features

- 반응형 네비게이션 (데스크톱 메뉴 / 모바일 햄버거)
- Hero, About, Portfolio, Skills 섹션
- 스크롤 등장 애니메이션 (Intersection Observer)
- 서비스 카드 호버 인터랙션
- CSS 변수 기반 테마 컬러
- 모바일~데스크톱 반응형 레이아웃

## Tech Stack

| 구분 | 기술 |
|------|------|
| Markup | HTML5 |
| Style | CSS3 (모듈 분리, CSS Variables) |
| Script | Vanilla JavaScript |
| Fonts | Google Fonts (Poppins) |
| Icons | Font Awesome 6 (CDN) |

## Project Structure

```
1-html-css-js-demo/
├── index.html          # 진입점 (섹션 마운트 포인트)
├── README.md
├── css/
│   ├── reset.css
│   ├── variables.css   # 컬러, 그림자, 레이아웃 토큰
│   ├── layout.css
│   ├── navbar.css
│   ├── hero.css
│   ├── about.css
│   ├── portfolio.css
│   ├── skills.css
│   ├── services.css    # 미연결 (예비)
│   └── responsive.css
└── js/
    ├── navbar.js
    ├── hero.js
    ├── about.js
    ├── portfolio.js
    ├── skills.js
    ├── services.js     # 미연결 (예비)
    └── main.js         # 애니메이션 / 인터랙션
```

## Sections

| 섹션 | 파일 | 역할 |
|------|------|------|
| Navbar | `js/navbar.js`, `css/navbar.css` | 로고, 앵커 메뉴, 모바일 햄버거, 스크롤 시 스타일 변경 |
| Hero | `js/hero.js`, `css/hero.css` | 타이틀, 소개 문구, Contact / Download CV CTA |
| About | `js/about.js`, `css/about.css` | 서비스 카드 4종 + About Me 소개 |
| Portfolio | `js/portfolio.js`, `css/portfolio.css` | 브라우저 프레임 형태의 프로젝트 미리보기 |
| Skills | `js/skills.js`, `css/skills.css` | 클라이언트에게 제공하는 역량 카드 |

> `services.js` / `services.css`는 코드베이스에 포함되어 있으나, 현재 `index.html`에는 연결되어 있지 않습니다. About 섹션의 서비스 카드가 유사 역할을 담당합니다.

## Getting Started

1. 저장소를 클론합니다.

```bash
git clone https://github.com/SEOKBEOM-OH/vibe-coding-portfolio.git
cd vibe-coding-portfolio/1-html-css-js-demo
```

2. `index.html`을 브라우저에서 엽니다.  
   VS Code Live Server 등으로 로컬 서버를 띄워도 됩니다.

별도 `npm install` / 빌드 과정은 필요하지 않습니다.

## Notes

- Google Fonts, Font Awesome은 CDN으로 로드됩니다.
- 이미지 영역은 플레이스홀더로 구성되어 있어, 실제 프로필/프로젝트 이미지로 교체하면 됩니다.
- Contact / Download CV 링크는 데모용 앵커입니다. 실제 연락처·이력서 URL로 연결하세요.

## License

Personal / learning project.
