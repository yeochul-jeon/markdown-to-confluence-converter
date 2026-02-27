# Markdown to Confluence Converter

마크다운(Markdown)을 Confluence 위키 마크업(Wiki Markup)으로 변환하는 **브라우저 + CLI** 듀얼 변환기입니다.
브라우저에서 바로 사용하거나, CLI로 파일을 일괄 변환할 수 있습니다.

## 기술 스택

- **HTML / CSS / JavaScript** — 프레임워크 없이 순수 웹 기술로 구현
- **[marked.js](https://marked.js.org/)** (CDN / npm) — 마크다운 파싱 엔진
- **CSS Grid** — 듀얼 패널 반응형 레이아웃
- **Node.js** — CLI 런타임
- **esbuild** — 단일 파일 번들링

## 주요 기능

### 브라우저
- 실시간 마크다운 → Confluence 위키 마크업 변환
- 파일 업로드 (드래그 & 드롭 / 클릭 선택)
- 결과 클립보드 복사 및 파일 다운로드
- 코드 블록 테마 선택 (8종)
- 4종 문서 템플릿 제공 (기본 문서, 테이블 문서, API 문서, 회의록)
- 반응형 디자인 (모바일/태블릿 대응)

### CLI
- 단일/복수 파일 일괄 변환
- 디렉토리 재귀 탐색 (`-r`)
- stdin/stdout 파이프 지원
- esbuild 단일 파일 번들 배포 (`dist/md2confluence.js`)

## 지원 마크다운 요소

| 마크다운 요소 | 마크다운 문법 | Confluence 마크업 |
|---|---|---|
| 제목 (h1~h6) | `# 제목` | `h1. 제목` |
| 볼드 | `**텍스트**` | `*텍스트*` |
| 이탤릭 | `*텍스트*` | `_텍스트_` |
| 취소선 | `~~텍스트~~` | `-텍스트-` |
| 인라인 코드 | `` `코드` `` | `{{코드}}` |
| 코드 블록 | ` ```lang ` | `{code:language=lang}` |
| 링크 | `[텍스트](url)` | `[텍스트\|url]` |
| 이미지 | `![alt](url)` | `!url\|alt=alt!` |
| 인용 | `> 텍스트` | `{quote}텍스트{quote}` |
| 순서 없는 리스트 | `- 항목` | `* 항목` |
| 순서 있는 리스트 | `1. 항목` | `# 항목` |
| 테이블 | `\| a \| b \|` | `\|\| a \|\| b \|\|` (헤더) |
| 수평선 | `---` | `----` |
| 체크박스 (완료) | `- [x] 항목` | `* (/) 항목` |
| 체크박스 (미완료) | `- [ ] 항목` | `* (x) 항목` |

## 파일 구조

```
index.html              # SPA 진입점
css/style.css           # 스타일링 (CSS Grid, 반응형)
js/converter.js         # marked.js 커스텀 렌더러 (핵심 변환 엔진, UMD)
js/templates.js         # 4개 템플릿 정의
js/app.js               # UI 로직, 이벤트 핸들러
cli.js                  # CLI 진입점 (parseArgs 기반)
package.json            # 의존성 및 빌드 스크립트
dist/md2confluence.js   # esbuild 번들 (단일 파일 배포용)
```

### 핵심 모듈

- **`ConfluenceConverter`** (`js/converter.js`) — marked.js 커스텀 렌더러 기반 변환 엔진. `walkTokens` 훅으로 리스트 중첩 접두사를 사전 계산하고, 커스텀 렌더러에서 각 마크다운 요소를 Confluence 마크업으로 출력합니다. UMD 형태로 브라우저와 Node.js 양쪽에서 사용 가능합니다.
- **`Templates`** (`js/templates.js`) — 4종 문서 템플릿을 정의하고 `getAll()` / `getById()` API로 제공합니다.
- **`app.js`** — DOM 이벤트 바인딩, 실시간 변환(디바운스 200ms), 파일 업로드, 탭 전환, 템플릿 렌더링 등 UI 전반을 담당합니다.
- **`cli.js`** — Node.js `parseArgs` 기반 CLI 진입점. 파일/디렉토리 변환, stdin 파이프, 출력 경로 지정 등을 처리합니다.

## 실행 방법

### 브라우저

별도 빌드 과정이 필요 없습니다. `index.html`을 브라우저에서 직접 열거나 로컬 서버를 사용합니다.

```bash
# 방법 1: 브라우저에서 직접 열기
open index.html

# 방법 2: 로컬 서버
npx serve .
```

> marked.js는 CDN으로 로드되므로 인터넷 연결이 필요합니다.

### CLI

```bash
# 설치 및 빌드
npm install && npm run build

# 단일 파일 변환 (README.wiki 생성)
node dist/md2confluence.js README.md

# 여러 파일을 지정 디렉토리에 출력
node dist/md2confluence.js -o output/ docs/*.md

# 디렉토리 하위 재귀 변환
node dist/md2confluence.js -r docs/

# stdin → stdout 파이프
cat README.md | node dist/md2confluence.js
```

> **팀 배포:** `dist/md2confluence.js` 파일 하나만 전달하면 됩니다. `node_modules` 설치 없이 Node.js만 있으면 실행 가능합니다.

## 변환 예시

### 입력 (Markdown)

```markdown
# 프로젝트 소개

이 프로젝트는 **마크다운**을 _Confluence 마크업_으로 변환합니다.

## 설치

1. 저장소를 클론합니다
2. 브라우저에서 `index.html`을 엽니다

- 빠른 변환
- 파일 업로드 지원

> 자세한 사용법은 [가이드](docs/USAGE.md)를 참조하세요.

```bash
git clone https://github.com/example/project.git
```


### 출력 (Confluence Wiki Markup)

```
h1. 프로젝트 소개

이 프로젝트는 *마크다운*을 _Confluence 마크업_으로 변환합니다.

h2. 설치

# 저장소를 클론합니다
# 브라우저에서 {{index.html}}을 엽니다

* 빠른 변환
* 파일 업로드 지원

{quote}
자세한 사용법은 [가이드|docs/USAGE.md]를 참조하세요.
{quote}

{code:language=bash}
git clone https://github.com/example/project.git
{code}
```

## 라이선스

이 프로젝트는 자유롭게 사용할 수 있습니다.
