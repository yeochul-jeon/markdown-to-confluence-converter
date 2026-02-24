/**
 * 마크다운 템플릿 정의
 */
const Templates = (() => {
  'use strict';

  const list = [
    {
      id: 'basic-doc',
      icon: '&#128196;',
      name: '기본 문서',
      desc: '제목, 단락, 리스트, 코드 블록이 포함된 기본 문서 구조',
      content: `# 문서 제목

## 개요

이 문서는 프로젝트의 **주요 기능**과 _설계 원칙_을 설명합니다.

## 주요 기능

- 실시간 데이터 처리
- 자동 알림 시스템
- 사용자 권한 관리

## 설치 방법

1. 저장소를 클론합니다
2. 의존성을 설치합니다
3. 설정 파일을 수정합니다

\`\`\`bash
git clone https://github.com/example/project.git
cd project
npm install
\`\`\`

## 참고

> 자세한 내용은 [공식 문서](https://example.com)를 참조하세요.

---

*마지막 업데이트: 2024-01-15*`
    },
    {
      id: 'table-doc',
      icon: '&#128202;',
      name: '테이블 문서',
      desc: '테이블을 활용한 데이터 정리 문서',
      content: `# API 상태 코드 정리

## HTTP 상태 코드

| 코드 | 상태 | 설명 |
|------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 완료 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 접근 권한 없음 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 500 | Internal Server Error | 서버 내부 오류 |

## 에러 응답 형식

\`\`\`json
{
  "error": {
    "code": 400,
    "message": "잘못된 요청입니다",
    "details": []
  }
}
\`\`\``
    },
    {
      id: 'api-doc',
      icon: '&#128640;',
      name: 'API 문서',
      desc: 'REST API 엔드포인트 문서 템플릿',
      content: `# User API

## 엔드포인트 목록

### GET /api/users

사용자 목록을 조회합니다.

**파라미터:**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| page | int | N | 페이지 번호 (기본값: 1) |
| size | int | N | 페이지 크기 (기본값: 20) |
| sort | string | N | 정렬 기준 |

**응답 예시:**

\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "홍길동",
      "email": "hong@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150
  }
}
\`\`\`

### POST /api/users

새 사용자를 생성합니다.

**요청 본문:**

\`\`\`json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "role": "USER"
}
\`\`\`

> **주의:** \`email\` 필드는 고유해야 합니다.`
    },
    {
      id: 'meeting-note',
      icon: '&#128221;',
      name: '회의록',
      desc: '회의 내용, 결정 사항, 액션 아이템 기록용',
      content: `# 주간 개발 회의록

**일시:** 2024-01-15 14:00 ~ 15:00
**참석자:** 김개발, 이기획, 박디자인, 최테스트

---

## 안건

### 1. Sprint 리뷰

- 이번 스프린트 목표 달성율: **85%**
- 미완료 항목:
  - 알림 시스템 연동
  - ~~성능 테스트~~ (다음 스프린트로 이월)

### 2. 기술 이슈

배포 파이프라인에서 간헐적 타임아웃이 발생하고 있습니다.

\`\`\`
Error: Connection timed out after 30000ms
\`\`\`

> 인프라팀에 확인 요청 예정

## 결정 사항

1. 다음 스프린트 기간: 2주
2. 코드 리뷰 최소 2명 승인으로 변경
3. 테스트 커버리지 목표: 80% 이상

## Action Items

- [ ] 알림 시스템 연동 완료 - 김개발
- [ ] 배포 파이프라인 타임아웃 조사 - 이기획
- [x] 디자인 시스템 문서 업데이트 - 박디자인
- [ ] E2E 테스트 시나리오 작성 - 최테스트`
    }
  ];

  function getAll() {
    return list;
  }

  function getById(id) {
    return list.find(t => t.id === id);
  }

  return { getAll, getById };
})();
