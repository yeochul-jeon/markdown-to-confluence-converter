# Claude Code 커스텀 Skills 구성 계획

## Context

이 프로젝트의 일상적인 작업(변환, 빌드, 테스트, 기능 확장)을 Claude Code 슬래시 커맨드(`/skill-name`)로 자동화한다. `.claude/commands/` 디렉토리에 프로젝트에 특화된 5개 skill 파일을 추가한다.

## 생성 파일 구조

```
.claude/commands/
  convert.md           # /convert — 마크다운 파일을 Confluence 마크업으로 변환
  add-renderer.md      # /add-renderer — converter.js에 새 마크다운 요소 렌더러 추가
  test-conversion.md   # /test-conversion — 변환 결과 검증 (개별/회귀 테스트)
  add-template.md      # /add-template — templates.js에 새 문서 템플릿 추가
  build-and-verify.md  # /build-and-verify — 번들 재빌드 및 소스/번들 일치 검증
```

## 각 Skill 상세

### 1. `/convert` — 마크다운 → Confluence 변환

**용도:** 파일 변환 시 CLI 플래그를 기억할 필요 없이 빠르게 실행

**사용 예:**
- `/convert README.md`
- `/convert -o output/ docs/*.md`
- `/convert -r docs/`

**주요 동작:**
1. `dist/md2confluence.js` 번들 존재 여부 확인 → 없으면 자동 빌드
2. 인자 파싱: 파일/디렉토리, `-o`, `-r`, `-t` 옵션 처리
3. 인자 없으면 현재 디렉토리 `.md` 파일 목록 표시 후 사용자에게 선택 요청
4. 변환 실행 후 결과 파일 처음 20줄 미리보기

---

### 2. `/add-renderer` — 새 마크다운 요소 지원 추가

**용도:** converter.js에 새 렌더러를 추가할 때 기존 패턴·체크리스트를 자동 안내

**사용 예:**
- `/add-renderer footnote`
- `/add-renderer subscript`

**주요 동작:**
1. `js/converter.js`의 기존 렌더러 패턴(인라인/블록 섹션) 분석
2. marked.js v15 토큰 타입과 렌더러 시그니처 확인
3. 기존 스타일과 동일한 형태로 렌더러 메서드 작성
4. 필요 시 `walkTokensFn`, `postProcess` 수정
5. `npm run build`로 번들 재생성
6. `echo` 파이프로 변환 결과 검증
7. README.md "지원 마크다운 요소" 테이블 및 docs/USAGE.md 업데이트

---

### 3. `/test-conversion` — 변환 결과 검증

**용도:** converter.js 수정 후 정상 동작을 확인하는 회귀 테스트 (테스트 프레임워크 없이)

**사용 예:**
- `/test-conversion nested lists`
- `/test-conversion` (전체)

**지원 요소 (17개):**

| # | 요소 | 마크다운 입력 예시 | 기대 Confluence 출력 |
|---|---|---|---|
| 1 | heading | `# 제목` | `h1. 제목` |
| 2 | bold | `**굵게**` | `*굵게*` |
| 3 | italic | `_기울임_` | `_기울임_` |
| 4 | strikethrough | `~~취소~~` | `-취소-` |
| 5 | inline code | `` `코드` `` | `{{코드}}` |
| 6 | code block | ` ```js\ncode\n``` ` | `{code:language=js}\ncode\n{code}` |
| 7 | link | `[텍스트](url)` | `[텍스트\|url]` |
| 8 | image | `![alt](url)` | `!url\|alt=alt!` |
| 9 | unordered list | `- 항목` | `* 항목` |
| 10 | ordered list | `1. 항목` | `# 항목` |
| 11 | nested list | 중첩 리스트 | `** 하위 항목` |
| 12 | blockquote | `> 인용` | `{quote}\n인용\n{quote}` |
| 13 | table | 마크다운 테이블 | `\|\| 헤더 \|\|` / `\| 셀 \|` |
| 14 | horizontal rule | `---` | `----` |
| 15 | checkbox | `- [x] 완료` | `* (/) 완료` |
| 16 | line break | 줄 끝 공백 2개 | `\n` |
| 17 | mermaid | ` ```mermaid\n...\n``` ` | `{code:language=text\|title=mermaid\|collapse=true}` |

**주요 동작:**
1. 특정 요소 지정 시: 해당 요소의 일반/엣지 케이스 테스트 입력 생성 → 파이프 변환 → 검증
2. 미지정 시: 17개 지원 요소 전체 회귀 테스트 실행
3. 결과를 표 형태(요소 | 입력 | 기대값 | 실제값 | 결과)로 정리
4. 실패 시 converter.js 해당 렌더러 코드 분석 및 수정 방향 제안

---

### 4. `/add-template` — 새 문서 템플릿 추가

**용도:** templates.js에 새 템플릿 추가 시 기존 구조(id, icon, name, desc, content) 자동 안내

**사용 예:**
- `/add-template release-notes`
- `/add-template retrospective`

**기존 템플릿 구조:**
```javascript
{
  id: 'kebab-case-id',       // 고유 ID (kebab-case)
  icon: '&#128196;',          // HTML 엔티티 이모지
  name: '한국어 이름',         // 카드에 표시되는 이름
  desc: '한 줄 설명',          // 카드 하단 설명
  content: `마크다운 내용`     // 실제 템플릿 (백틱 템플릿 리터럴, 15~40줄)
}
```

**기존 ID:** `basic-doc`, `table-doc`, `api-doc`, `meeting-note`

**주요 동작:**
1. `js/templates.js`의 기존 4개 템플릿 구조 확인
2. 요청 종류에 맞는 실용적 마크다운 템플릿(15~40줄) 작성
3. `list` 배열에 새 객체 추가
4. 파이프로 변환 테스트
5. 브라우저 확인 사항 안내 (카드 표시, 클릭 로드)

---

### 5. `/build-and-verify` — 빌드 및 검증

**용도:** 코드 수정 후 커밋 전, 번들 재빌드와 소스/번들 일치를 한 번에 확인

**사용 예:**
- `/build-and-verify` (인자 없음)

**주요 동작:**
1. `git diff --name-only`로 변경 파일 확인
2. `npm run build` 실행
3. 테스트 마크다운으로 `node cli.js` vs `node dist/md2confluence.js` 결과 비교
4. 번들 크기 보고 (이전 대비 변화)
5. 결과 요약:

```
빌드 검증 결과
━━━━━━━━━━━━━━━━━━━━━━━
빌드:        성공/실패
소스-번들 일치: 일치/불일치
번들 크기:    XX KB (이전 대비 +/- YY bytes)
변경 파일:    file1.js, file2.js, ...
━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 참조하는 핵심 파일

| 파일 | 참조하는 Skill |
|---|---|
| `js/converter.js` | add-renderer, test-conversion |
| `js/templates.js` | add-template |
| `cli.js` | convert, build-and-verify |
| `dist/md2confluence.js` | convert, test-conversion, build-and-verify |
| `package.json` | build-and-verify (`npm run build`) |

## 검증 체크리스트

- [ ] `.claude/commands/` 디렉토리 내 5개 `.md` 파일 생성 확인
- [ ] Claude Code에서 `/convert`, `/add-renderer`, `/test-conversion`, `/add-template`, `/build-and-verify` 슬래시 커맨드로 인식되는지 확인
- [ ] 각 skill의 `$ARGUMENTS` 플레이스홀더가 올바르게 동작하는지 테스트
