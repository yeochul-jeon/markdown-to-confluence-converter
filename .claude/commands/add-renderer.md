# /add-renderer — converter.js에 새 마크다운 요소 렌더러 추가

`js/converter.js`에 새로운 마크다운 요소의 렌더러를 추가합니다.

## 인자

추가할 마크다운 요소 이름: $ARGUMENTS

## 실행 절차

### 1. 기존 렌더러 패턴 분석

`js/converter.js` 파일을 읽고 기존 렌더러 구조를 파악합니다:
- **인라인 렌더러**: `strong`, `em`, `del`, `codespan`, `link`, `image`, `br`, `text`
- **블록 렌더러**: `heading`, `paragraph`, `blockquote`, `code`, `hr`
- **리스트 렌더러**: `list`, `listitem`
- **테이블 렌더러**: `table`, `tablerow`, `tablecell`, `checkbox`

각 렌더러의 시그니처 패턴을 확인합니다:
```javascript
// 인라인: tokens를 받아 parseInline으로 처리
methodName({ tokens }) {
  return `마크업${this.parser.parseInline(tokens)}마크업`;
}

// 블록: tokens를 받아 parse로 처리
methodName({ tokens }) {
  return `{매크로}\n${this.parser.parse(tokens)}\n{매크로}\n\n`;
}
```

### 2. marked.js v15 토큰 타입 확인

요청된 요소(`$ARGUMENTS`)가 marked.js v15에서 지원하는 토큰 타입인지 확인합니다.
- 기본 지원 토큰: space, code, heading, table, hr, blockquote, list, list_item, paragraph, html, text, def, escape, link, image, strong, em, codespan, br, del
- 확장(Extension)이 필요한 경우: marked 확장 API(`marked.use({ extensions: [...] })`) 사용 방법을 안내합니다.

### 3. 렌더러 메서드 작성

기존 코드 스타일에 맞춰 렌더러를 작성합니다:
- 인라인 요소면 `// === 인라인 렌더러 ===` 섹션에 추가
- 블록 요소면 `// === 블록 렌더러 ===` 섹션에 추가
- Confluence 위키 마크업 문법에 맞는 출력 생성
- 해당 요소의 Confluence 마크업이 불확실하면 사용자에게 원하는 출력 형태를 질문

### 4. walkTokensFn / postProcess 수정 (필요 시)

- 중첩 구조나 사전 계산이 필요하면 `walkTokensFn` 함수에 로직 추가
- 후처리가 필요하면 `postProcess` 함수에 변환 규칙 추가

### 5. 번들 재생성

```bash
npm run build
```

### 6. 변환 결과 검증

간단한 테스트 입력으로 변환이 올바르게 동작하는지 확인합니다:

```bash
echo "<테스트 마크다운>" | node cli.js --stdout
```

일반 케이스와 엣지 케이스를 모두 테스트합니다.

### 7. 문서 업데이트

- `README.md`의 "지원 마크다운 요소" 관련 테이블이 있으면 새 요소를 추가합니다.
- `docs/USAGE.md` 파일이 있으면 해당 요소 사용법을 추가합니다.
- 관련 문서가 없으면 이 단계를 건너뜁니다.
