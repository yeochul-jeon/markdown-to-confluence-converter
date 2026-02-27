# /build-and-verify — 번들 재빌드 및 소스/번들 일치 검증

코드 수정 후 커밋 전에, 번들을 재빌드하고 소스와 번들의 변환 결과가 일치하는지 확인합니다.

## 인자

이 skill은 인자를 받지 않습니다: $ARGUMENTS

## 실행 절차

### 1. 변경 파일 확인

```bash
git diff --name-only
git diff --cached --name-only
```

변경된 파일 목록을 사용자에게 보여줍니다.
`js/converter.js`, `js/templates.js`, `cli.js`, `package.json` 등 핵심 파일의 변경 여부를 확인합니다.

### 2. 이전 번들 크기 기록

```bash
wc -c dist/md2confluence.js
```

빌드 전 번들 크기를 기록합니다. 파일이 없으면 "신규 생성"으로 표시합니다.

### 3. 빌드 실행

```bash
npm run build
```

`node_modules/`가 없으면 먼저 `npm install`을 실행합니다.
빌드 실패 시 에러 메시지를 분석하고 원인을 안내합니다.

### 4. 소스/번들 변환 결과 비교

동일한 테스트 마크다운을 소스(`cli.js`)와 번들(`dist/md2confluence.js`) 양쪽으로 변환하여 결과가 일치하는지 확인합니다:

```bash
# 테스트 마크다운 (주요 요소 포함)
TEST_MD="# 제목\n\n**굵게** _기울임_ ~~취소~~\n\n- 항목 1\n- 항목 2\n\n\`\`\`js\nconsole.log('hello');\n\`\`\`\n\n| 헤더1 | 헤더2 |\n|-------|-------|\n| 셀1 | 셀2 |"

# 소스 실행
echo -e "$TEST_MD" | node cli.js --stdout > /tmp/source_result.wiki

# 번들 실행
echo -e "$TEST_MD" | node dist/md2confluence.js --stdout > /tmp/bundle_result.wiki

# 비교
diff /tmp/source_result.wiki /tmp/bundle_result.wiki
```

### 5. 번들 크기 비교

```bash
wc -c dist/md2confluence.js
```

이전 크기와 비교하여 변화량을 보고합니다.

### 6. 결과 요약

아래 형식으로 결과를 보고합니다:

```
빌드 검증 결과
━━━━━━━━━━━━━━━━━━━━━━━
빌드:        성공/실패
소스-번들 일치: 일치/불일치
번들 크기:    XX KB (이전 대비 +/- YY bytes)
변경 파일:    file1.js, file2.js, ...
━━━━━━━━━━━━━━━━━━━━━━━
```

불일치가 발생하면 diff 결과를 함께 보여주고 원인을 분석합니다.
