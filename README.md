# 🏗️ 공수잡 GongsuJob

건설 현장 일용직 구인구직 웹 프로젝트입니다.

구인자는 현장 공고를 등록하고 인재에게 포지션을 제안할 수 있으며, 구직자는 공고 확인, 이력서 등록, 포지션 제안 수락·거절·질문을 할 수 있습니다.

## 라이브 데모

https://gongsujob-phgb.vercel.app

## 왜 만들었나

건설 현장에서 일용직 인력을 구하는 과정은 여전히 전화, 문자, 카카오톡에 많이 의존합니다.

공고를 올리는 구인자와 일을 찾는 구직자가 한곳에서 현장 정보를 확인하고 연결될 수 있는 구조를 만들고자 했습니다.

단순히 연락처를 바로 노출하는 방식이 아니라, 구인자가 포지션을 제안하고 구직자가 수락한 경우에만 연락처가 공개되는 구조로 설계했습니다.

## 주요 기능

### 회원 기능

- 이메일 회원가입 및 로그인
- Google 소셜 로그인
- Kakao 소셜 로그인
- Supabase Auth 기반 사용자 인증
- 구인자, 구직자 유형별 화면 분기

### 구인자 기능

- 구인 공고 등록
- 공고 목록 조회
- 직종별 공고 필터
- 키워드 검색
- 등록된 인재 조회
- 인재 상세 확인
- 포지션 제안 보내기
- 보낸 포지션 제안 관리
- 구직자 질문에 답변
- 구직자가 제안을 수락한 경우에만 연락처 확인

### 구직자 기능

- 이력서 등록 및 수정
- 공개 이력서 설정
- 공고 목록 조회
- 공고 상세 확인
- 공고 지원
- 받은 포지션 제안 확인
- 포지션 제안 수락, 거절
- 구인자에게 질문하기
- 수락 전 연락처 비공개 유지

### 개인정보 보호 구조

- 구직자 연락처는 기본적으로 마스킹 처리
- 구인자가 포지션 제안을 보내도 연락처는 바로 공개되지 않음
- 구직자가 제안을 수락한 경우에만 해당 구인자에게 연락처 공개
- 수락된 포지션 제안 이후 연락처 열람 이력 저장 구조 반영

### 공고 상세 기능

- 현장 위치 정보 표시
- 카카오맵 기반 현장 위치 연결
- 현장 날씨 정보 확인
- 실수령액 계산기 제공
- 모바일 전용 하단 메뉴 및 지원 버튼 제공

### 실수령액 계산기

건설 일용직 근로자의 일당 기준 예상 실수령액을 계산할 수 있습니다.

- 고용보험 기본 공제
- 일용근로소득세 계산 반영
- 지방소득세 계산 반영
- 국민연금·건강보험 조건부 적용 체크
- 장기요양보험 계산 반영
- 산재보험은 사업주 부담 항목으로 안내
- 실제 공제액은 개인과 현장 조건에 따라 달라질 수 있음을 안내

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프론트엔드 | Next.js, TypeScript |
| 인증 | Supabase Auth |
| 데이터베이스 | Supabase PostgreSQL |
| 배포 | Vercel |
| 지도 | Kakao Map |
| 스타일 | Inline Style 기반 반응형 UI |

## 구현하면서 경험한 것

- Next.js App Router 기반 페이지 구성
- TypeScript를 사용한 프론트엔드 개발
- Supabase Auth 로그인 연동
- Google OAuth 로그인 연결
- Kakao OAuth 로그인 연결
- Supabase PostgreSQL을 이용한 데이터 저장 및 조회
- 구인자, 구직자 역할 기반 화면 분기
- 포지션 제안, 수락, 거절, 질문, 답변 상태 관리
- 개인정보 보호를 고려한 연락처 마스킹 처리
- 모바일과 웹 화면을 구분한 반응형 UI 구현
- Vercel 배포 및 GitHub 저장소 관리
- 건설 일용직 실수령액 계산 로직 구현
- 반복 UI를 공통 컴포넌트로 분리
- 공고 카드, 인재 카드, 실수령액 계산기 컴포넌트화

## 프로젝트 구조

~~~text
app
├─ api
│  ├─ geocode
│  ├─ staticmap
│  └─ weather
├─ auth
│  └─ callback
├─ contact
├─ jobs
│  ├─ [id]
│  └─ write
├─ login
├─ mypage
├─ onboarding
├─ resume
│  └─ write
├─ resumes
├─ globals.css
├─ layout.tsx
└─ page.tsx

components
├─ AppFooter.tsx
├─ AppHeader.tsx
├─ JobCard.tsx
├─ MobileBottomNav.tsx
├─ NetPayCalculator.tsx
└─ ResumeCard.tsx

lib
└─ supabase.ts
~~~

## 시작하는 방법

~~~bash
npm install
~~~

`.env.local` 파일을 생성한 뒤 아래 값을 입력합니다.

~~~env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KAKAO_REST_API_KEY=your_kakao_rest_api_key
WEATHER_API_KEY=your_weather_api_key
~~~

개발 서버를 실행합니다.

~~~bash
npm run dev
~~~

배포용 빌드를 확인합니다.

~~~bash
npm run build
~~~

## 참고 사항

이 프로젝트는 포트폴리오 목적으로 제작한 개인 프로젝트입니다.

Google, Kakao 로그인은 Supabase Auth를 통해 구현했습니다.

현재 인증 화면에서 Supabase 기본 인증 도메인이 표시될 수 있습니다.

실수령액 계산기는 참고용 예상 계산입니다.

실제 공제액은 근무 기간, 월 근무일수, 사업장 신고 기준, 개인 조건에 따라 달라질 수 있습니다.

## 라이선스

MIT License
