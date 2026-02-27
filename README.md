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

## AI 코딩 도구 연동

이 프로젝트의 CLI는 stdin/stdout 파이프를 지원하므로, AI 코딩 도구와 결합하면 마크다운 변환을 자동화하거나 변환기 자체를 확장하는 데 활용할 수 있습니다. 아래는 주요 AI 코딩 도구별 설정 방법과 실전 활용 예시입니다.

### Claude Code (Anthropic)

**설정 파일:** 프로젝트 루트의 `CLAUDE.md`

Claude Code는 세션 시작 시 `CLAUDE.md`를 자동으로 읽어 프로젝트 컨텍스트를 인식합니다. 이 프로젝트에는 이미 `CLAUDE.md`가 포함되어 있어 별도 설정 없이 바로 활용할 수 있습니다.

추가로 `.mcp.json` 파일에 MCP 서버를 설정하면 외부 도구(파일 시스템, 코드 분석 등)와의 연동도 가능합니다.

**실전 활용 예시:**

```bash
# CLI 파이프로 변환 결과 확인
cat doc.md | node dist/md2confluence.js

# Claude Code에게 직접 요청
# 프롬프트: "README.md를 Confluence 마크업으로 변환해서 output/ 폴더에 저장해줘"
# 프롬프트: "converter.js에 Mermaid 다이어그램 지원을 추가해줘"
```

#### 커스텀 Skills (슬래시 커맨드)

이 프로젝트에는 반복 작업을 자동화하는 **커스텀 Skills**이 포함되어 있습니다. 프로젝트를 클론하면 별도 설정 없이 바로 사용할 수 있습니다.

**사전 준비:**

1. [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)가 설치되어 있어야 합니다.
2. 이 저장소를 클론합니다: `git clone <repo-url> && cd markdown-to-confluence-converter`

**Skills란?**

Skills는 `.claude/commands/` 디렉토리에 정의된 프로젝트 전용 슬래시 커맨드입니다. Claude Code 대화 중 `/`를 입력하면 사용 가능한 Skills 목록이 표시됩니다. 전역 Skills(`~/.claude/commands/`)와 달리, 프로젝트 Skills는 이 저장소를 클론한 모든 팀원이 동일하게 사용할 수 있습니다.

**사용 가능한 Skills:**

| 커맨드 | 설명 | 사용 예시 |
|---|---|---|
| `/convert` | 마크다운 파일을 Confluence 위키 마크업으로 변환 | `/convert README.md` |
| `/test-conversion` | 변환 결과 회귀 테스트 실행 | `/test-conversion heading` |
| `/add-renderer` | converter.js에 새 마크다운 요소 렌더러 추가 | `/add-renderer footnote` |
| `/add-template` | templates.js에 새 문서 템플릿 추가 | `/add-template 장애보고서` |
| `/build-and-verify` | 번들 재빌드 및 소스/번들 일치 검증 | `/build-and-verify` |

**사용 방법:**

```
1. 프로젝트 디렉토리에서 Claude Code를 실행합니다.
   $ claude

2. 대화창에 `/`를 입력하면 사용 가능한 Skills 목록이 나타납니다.

3. 원하는 커맨드를 선택하고 필요한 인자를 입력합니다.
   예: /convert README.md
       /test-conversion table
       /add-template 릴리스노트
```

**각 Skill 상세:**

- **`/convert`** — 마크다운 파일을 `.wiki` 파일로 변환합니다. **원본 `.md` 파일은 변경되지 않으며**, 동일 경로에 `.wiki` 확장자로 새 파일이 생성됩니다 (예: `README.md` → `README.wiki`). 파일 경로, `-o` (출력 디렉토리), `-r` (재귀 탐색), `-t` (코드 블록 테마) 옵션을 지원합니다. stdin/stdout 파이프 모드 사용 시 파일을 생성하지 않고 터미널에 결과만 출력합니다. 인자 없이 실행하면 현재 디렉토리의 `.md` 파일 목록을 표시합니다.
- **`/test-conversion`** — `converter.js` 수정 후 17개 마크다운 요소에 대한 회귀 테스트를 실행합니다. 특정 요소명을 인자로 전달하면 해당 요소만 테스트합니다.
- **`/add-renderer`** — `js/converter.js`에 새로운 마크다운 요소의 Confluence 렌더러를 추가합니다. 기존 렌더러 패턴을 분석하여 코드 스타일에 맞게 작성하고, 빌드 및 테스트까지 수행합니다.
- **`/add-template`** — `js/templates.js`에 새 문서 템플릿을 추가합니다. 기존 4개 템플릿 구조에 맞춰 작성하고 변환 테스트를 수행합니다.
- **`/build-and-verify`** — `npm run build`로 번들을 재생성한 뒤, 소스(`cli.js`)와 번들(`dist/md2confluence.js`)의 변환 결과가 일치하는지 검증합니다. 커밋 전 실행을 권장합니다.

**나만의 Skill 추가하기:**

`.claude/commands/` 디렉토리에 `.md` 파일을 추가하면 새로운 프로젝트 전용 Skill이 됩니다.

```markdown
# 파일: .claude/commands/my-skill.md

# /my-skill — 간단한 설명

수행할 작업을 자연어로 기술합니다.

## 인자
$ARGUMENTS

## 실행 절차
1. 첫 번째 단계
2. 두 번째 단계
```

파일명이 곧 커맨드명이 됩니다 (예: `my-skill.md` → `/my-skill`). `$ARGUMENTS`는 사용자가 커맨드 뒤에 입력한 텍스트로 치환됩니다.

### GitHub Copilot

**설정 파일:** `.github/copilot-instructions.md`

프로젝트 루트에 아래 경로로 파일을 생성하면, Copilot Chat과 코드 자동완성 시 프로젝트 맥락을 반영합니다.

**설정 파일 내용 예시:**

```markdown
# Markdown to Confluence Converter

## 프로젝트 구조
- `js/converter.js` — marked.js 커스텀 렌더러 기반 변환 엔진 (UMD)
- `js/templates.js` — 4종 문서 템플릿
- `js/app.js` — UI 이벤트 핸들러
- `cli.js` — Node.js CLI 진입점

## 핵심 API
- `ConfluenceConverter.convert(markdown)` — 마크다운 → Confluence 위키 마크업 변환
- `Templates.getAll()` / `Templates.getById(id)` — 템플릿 조회

## CLI 사용법
- `node dist/md2confluence.js <파일>` — 파일 변환
- `cat file.md | node dist/md2confluence.js` — stdin 파이프
```

**실전 활용 예시:**

```
# Copilot Chat에서 @workspace 태그로 프로젝트 전체 맥락 참조
@workspace converter.js의 테이블 변환 로직을 설명해줘
@workspace 새로운 마크다운 요소(각주)를 변환기에 추가하려면?
```

### Cursor

**설정 파일:** `.cursor/rules/` 디렉토리 내 `.mdc` 파일

Cursor의 Rules 기능을 사용하면 AI가 프로젝트 아키텍처를 이해한 상태에서 코드를 생성합니다.

**설정 파일 내용 예시 (`.cursor/rules/converter.mdc`):**

```markdown
---
description: Markdown to Confluence 변환기 프로젝트 규칙
globs: ["js/**/*.js", "cli.js"]
---

# 변환 엔진 아키텍처
- marked.js 커스텀 렌더러 패턴 사용 (renderer 객체의 메서드 오버라이드)
- `walkTokens` 훅으로 리스트 중첩 접두사 사전 계산
- UMD 모듈 형태: 브라우저(window)와 Node.js(module.exports) 양쪽 지원

# CLI 옵션
- `-o, --output <dir>` — 출력 디렉토리 지정
- `-r, --recursive` — 디렉토리 재귀 탐색
- stdin/stdout 파이프 지원
```

**실전 활용 예시:**

```
# Composer에서 변환기 기능 수정 요청
"converter.js에서 이미지 변환 시 width/height 속성도 지원하도록 수정해줘"

# @file 참조로 특정 파일 기반 작업
@converter.js 코드 블록 테마 매핑 로직을 리팩토링해줘
```

### OpenAI Codex CLI

**설정 파일:** 프로젝트 루트의 `AGENTS.md`

Codex CLI는 `AGENTS.md`를 읽어 프로젝트 맥락을 파악합니다.

**설정 파일 내용 예시:**

```markdown
# Markdown to Confluence Converter

## 프로젝트 컨텍스트
브라우저 + CLI 듀얼 마크다운 → Confluence 위키 마크업 변환기.
순수 HTML/CSS/JS (프레임워크 없음), marked.js 커스텀 렌더러 기반.

## 주요 파일
- `js/converter.js` — 핵심 변환 엔진 (ConfluenceConverter 클래스)
- `cli.js` — CLI 진입점 (Node.js parseArgs)
- `dist/md2confluence.js` — esbuild 단일 번들

## CLI 사용법
node dist/md2confluence.js <파일>           # 파일 변환
node dist/md2confluence.js -r <디렉토리>    # 재귀 변환
cat file.md | node dist/md2confluence.js   # stdin 파이프
```

**실전 활용 예시:**

```bash
# Codex CLI로 변환 작업 요청
codex "README.md를 Confluence 마크업으로 변환해줘"

# stdin 파이프와 조합한 자동화
codex "docs/ 폴더의 모든 마크다운을 Confluence 마크업으로 일괄 변환하는 셸 스크립트를 만들어줘"
```

## 라이선스

이 프로젝트는 자유롭게 사용할 수 있습니다.
