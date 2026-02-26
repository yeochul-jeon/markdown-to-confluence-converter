# CLI 단일 파일 번들링 전략

## 현재 방식

esbuild로 `cli.js` + 의존성(`marked`)을 하나의 파일로 번들링하여 `dist/md2confluence.js`를 생성한다.

```bash
esbuild cli.js --bundle --platform=node --outfile=dist/md2confluence.js --banner:js='#!/usr/bin/env node'
```

이 파일은 Node.js만 있으면 `node_modules` 없이 독립 실행된다.

## 이 방식은 대중적인가?

**대중적이고, 실용적인 패턴이다.** 다만 모든 경우에 최선은 아니며 프로젝트 성격에 따라 판단해야 한다.

## 단일 파일 번들이 적합한 경우

- 의존성이 적고 순수 JS (Native addon 없음)
- 팀 내부 도구 / 간단한 유틸리티
- 배포 경로가 단순함 (파일 복사, 슬랙 공유 등)

이런 경우에는 단일 파일 번들이 **배포 마찰을 크게 줄여주므로** 실용적인 선택이다.

## 동일 패턴을 사용하는 유명 도구들

| 도구 | 번들러 | 설명 |
|---|---|---|
| **esbuild** 자신 | Go 단일 바이너리 | 동일한 철학 |
| **ncc** (Vercel) | webpack 기반 | `@vercel/ncc` — Node.js CLI를 단일 파일로 컴파일하는 전용 도구 |
| **pkg** (Vercel) | V8 snapshot | Node.js 자체를 포함한 실행 바이너리 생성 |
| **tsup** | esbuild 기반 | 라이브러리/CLI 번들링에 널리 사용 |
| **bun build --compile** | Bun | 단일 실행 파일 생성 |

GitHub Actions의 공식 action들도 `@vercel/ncc`로 단일 파일 번들링하여 `dist/index.js`로 커밋하는 것이 **공식 권장 패턴**이다.

## npm 공개 배포라면 다른 방식이 표준

`npm install -g md2confluence`로 공개 배포하는 경우, 번들링 없이 `package.json`의 `dependencies`에 의존하는 것이 **npm 생태계의 표준**이다.

```bash
npm install -g md2confluence   # npm이 node_modules를 알아서 관리
md2confluence README.md
```

사용자가 `npm install`을 실행하면 의존성이 자동 해결되므로 단일 파일 번들링이 불필요하다.

## 배포 방식별 권장 접근

| 배포 방식 | 권장 접근 | 비고 |
|---|---|---|
| 팀 내부 파일 전달 | 단일 파일 번들 (현재 방식) | 가장 간단 |
| npm 공개 배포 | `package.json` + `dependencies` | npm 표준 |
| 실행 파일로 배포 | `pkg` / `bun build --compile` | Node.js 설치 불필요 |

## 결론

현재 프로젝트 규모와 용도(팀 내부 유틸리티)에는 **esbuild 단일 번들이 가장 실용적인 선택**이다. 의존성이 `marked` 하나뿐이라 번들 크기도 작고, Node.js만 있으면 즉시 실행 가능하다.
