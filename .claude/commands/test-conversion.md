# /test-conversion — 변환 결과 검증

`converter.js` 수정 후 변환이 정상 동작하는지 확인하는 회귀 테스트를 실행합니다.
테스트 프레임워크 없이 CLI 파이프로 직접 검증합니다.

## 인자

테스트할 특정 요소 (선택): $ARGUMENTS

## 지원 요소 목록

아래 17개 요소에 대한 테스트 케이스를 제공합니다:

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

## 실행 절차

### 1. 특정 요소 테스트 (`$ARGUMENTS`가 지정된 경우)

해당 요소에 대한 일반 케이스와 엣지 케이스 테스트 입력을 생성합니다.

각 테스트 케이스에 대해:
1. 마크다운 입력을 `echo "..." | node cli.js --stdout`으로 변환
2. 실제 출력과 기대값 비교
3. 결과를 표 형태로 정리

### 2. 전체 회귀 테스트 (`$ARGUMENTS`가 비어 있는 경우)

위 17개 요소 전부에 대해 테스트를 실행합니다.
각 요소별로 최소 1개의 기본 케이스를 실행합니다.

### 3. 테스트 실행 방법

각 케이스를 아래 형식으로 실행합니다:

```bash
echo "<마크다운 입력>" | node cli.js --stdout
```

`cli.js`가 동작하지 않으면 `dist/md2confluence.js`로 대체합니다.
`node_modules/`가 없으면 먼저 `npm install`을 실행합니다.

### 4. 결과 보고

테스트 결과를 아래 표 형태로 정리합니다:

| 요소 | 입력 | 기대값 | 실제값 | 결과 |
|---|---|---|---|---|
| heading | `# Hello` | `h1. Hello` | `h1. Hello` | PASS |
| ... | ... | ... | ... | ... |

### 5. 실패 분석 (실패한 케이스가 있는 경우)

실패한 요소에 대해:
1. `js/converter.js`에서 해당 렌더러 코드를 확인
2. 원인 분석 (렌더러 로직 오류, postProcess 간섭, marked.js 토큰 구조 변경 등)
3. 수정 방향을 구체적으로 제안
4. 사용자 확인 후 수정 진행
