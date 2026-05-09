# 🏗️ 공수잡 (GongsuJob)

건설 일용직 구인구직 웹 프로젝트 — 현장 구인 공고를 등록하고 조회할 수 있습니다

## 라이브 데모

https://gongsujob-phgb.vercel.app

## 왜 만들었나

건설 현장에서 일용직 인력을 구하는 과정은 전화와 카카오톡에 의존하는 경우가 많습니다. 직종별로 구인 공고를 확인하고, 필요한 인력을 모집할 수 있는 간단한 웹 프로젝트를 만들고자 했습니다.

## 주요 기능

- 직종별 구인 검색 (철근, 형틀, 방수, 도장, 미장, 전기, 배관, 용접, 타일, 조적 등)
- 이메일 회원가입 / 로그인
- Google 소셜 로그인
- Kakao 소셜 로그인
- Supabase Auth 기반 사용자 인증
- 구인 공고 등록 및 조회
- 카테고리 필터 및 키워드 검색

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js, TypeScript, Tailwind CSS |
| 인증/DB | Supabase Auth, Supabase PostgreSQL |
| 배포 | Vercel |

## 구현하면서 경험한 것

- Next.js 기반 화면 구성
- TypeScript를 사용한 프론트엔드 개발
- Supabase Auth 로그인 연동
- Google OAuth 로그인 연결
- Kakao OAuth 로그인 연결
- Supabase DB를 이용한 구인 공고 등록 및 조회
- GitHub 저장소 관리 및 Vercel 배포

## 시작하는 방법

npm install

.env.local 파일 생성 후 아래 내용 입력

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run dev

## 참고 사항

이 프로젝트는 포트폴리오 목적으로 제작한 개인 프로젝트입니다.

Google, Kakao 로그인은 Supabase Auth를 통해 구현했습니다. 현재는 프로젝트 기본 인증 도메인이 표시될 수 있습니다.

## 라이선스

MIT License
