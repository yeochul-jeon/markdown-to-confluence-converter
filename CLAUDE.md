# Markdown to Confluence Wiki Markup Converter

## 프로젝트 개요
브라우저 기반 마크다운 → Confluence 위키 마크업 변환기. 순수 HTML/CSS/JavaScript로 구현.

## 기술 스택
- **HTML/CSS/JS** (순수, 프레임워크 없음)
- **marked.js** (CDN) - 마크다운 파싱
- **CSS Grid** - 듀얼 패널 레이아웃

## 파일 구조
```
index.html          # SPA 진입점
css/style.css       # 스타일링 (CSS Grid, 반응형)
js/converter.js     # marked.js 커스텀 렌더러 (핵심 변환 엔진)
js/templates.js     # 4개 템플릿 정의
js/app.js           # UI 로직, 이벤트 핸들러
```

## 아키텍처
- `ConfluenceConverter.convert(markdown)` - 변환 진입점
- marked.js 커스텀 렌더러로 HTML 대신 Confluence 위키 마크업 출력
- `walkTokens` 훅으로 리스트 중첩 접두사 사전 계산

## 실행 방법

### 브라우저
`index.html`을 브라우저에서 직접 열거나 로컬 서버 사용:
```bash
npx serve .
```

### CLI
```bash
npm install && npm run build    # dist/md2confluence.js 생성
node dist/md2confluence.js README.md              # README.wiki 생성
node dist/md2confluence.js -o output/ docs/*.md   # 디렉토리 출력
cat README.md | node dist/md2confluence.js        # stdin → stdout
```
팀 배포 시 `dist/md2confluence.js` 파일 하나만 전달. `node_modules` 불필요.

## CLI 파일 구조
```
cli.js              # CLI 진입점 (parseArgs 기반)
package.json        # 의존성 및 빌드 스크립트
dist/md2confluence.js  # esbuild 번들 (단일 파일 배포용)
```
