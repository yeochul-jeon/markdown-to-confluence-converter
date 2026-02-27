# /convert — 마크다운 파일을 Confluence 위키 마크업으로 변환

마크다운 파일을 Confluence 위키 마크업(.wiki)으로 변환합니다.

## 인자

사용자 입력: $ARGUMENTS

## 실행 절차

### 1. 번들 존재 여부 확인

`dist/md2confluence.js` 파일이 존재하는지 확인합니다.
- 존재하지 않으면 `npm run build`를 실행하여 번들을 먼저 생성합니다.
- `node_modules/`가 없으면 `npm install && npm run build`를 실행합니다.

### 2. 인자 파싱

`$ARGUMENTS`를 분석하여 아래 패턴을 처리합니다:

| 패턴 | 예시 | 동작 |
|---|---|---|
| 파일 경로 | `README.md` | 해당 파일 변환 |
| 여러 파일 | `docs/a.md docs/b.md` | 각 파일 변환 |
| `-o <dir> <files>` | `-o output/ docs/*.md` | 지정 디렉토리에 출력 |
| `-r <dir>` | `-r docs/` | 디렉토리 재귀 탐색 후 변환 |
| `-t <theme>` | `-t Midnight README.md` | 코드 블록 테마 지정 |
| 인자 없음 | (빈 값) | 현재 디렉토리 `.md` 파일 목록 표시 후 선택 요청 |

### 3. 인자가 없는 경우

현재 디렉토리에서 `.md` 파일을 찾아 목록을 표시합니다.
사용자에게 어떤 파일을 변환할지 질문합니다.

### 4. 변환 실행

`node dist/md2confluence.js` 명령으로 변환을 실행합니다.
파싱한 옵션들을 CLI 플래그로 전달합니다.

예:
```bash
node dist/md2confluence.js README.md
node dist/md2confluence.js -o output/ docs/*.md
node dist/md2confluence.js -r docs/
node dist/md2confluence.js -t Midnight README.md
```

### 5. 결과 미리보기

변환이 완료되면:
- 생성된 `.wiki` 파일의 처음 20줄을 읽어 미리보기를 표시합니다.
- 여러 파일 변환 시 각 파일의 생성 경로를 나열하고 총 변환 수를 보고합니다.
