# 보안 메모

## 1. 애플리케이션 계층에서 처리한 것

| 항목 | 처리 위치 |
| --- | --- |
| 공개 목록에서 연락처·생년월일 컬럼 제외 | `services/resume.service.ts` (`PUBLIC_RESUME_COLUMNS`), `services/offer.service.ts` |
| 수락된 제안에서만 연락처 단건 조회 | `features/resumes/useTalentSearch.ts`, `features/mypage/useMyPage.ts` |
| 서버 측 로그인·온보딩 검사 | `proxy.ts` |
| 오픈 리다이렉트 차단 | `domain/redirect.ts` |
| API 입력 검증·내부 오류 은닉 | `lib/http/*` |
| 외부 API 키 서버 전용화 | `lib/adapters/*` (`server-only`), `lib/config/env.ts` |
| 공고 삭제 소유자 조건 | `services/job.service.ts` |
| 업로드 형식·용량 제한 | `services/resume.service.ts` |

## 2. 데이터베이스(RLS)에서 반드시 보장해야 하는 것

브라우저에서 anon 키로 Supabase를 직접 호출하는 구조이므로, **최종 권한 판단은 RLS 정책이 담당**해야 합니다.
애플리케이션 코드에서 컬럼을 덜 요청하는 것은 노출면을 줄이는 조치일 뿐, 악의적 요청을 막는 장치는 아닙니다.

아래는 권장 정책 방향입니다. 실제 스키마(컬럼명·외래키)를 확인한 뒤 적용하세요.

| 테이블 | 권장 정책 |
| --- | --- |
| `resumes` | 본인 행: 모든 컬럼 읽기·쓰기. 타인: `is_public = true`인 행만, 그리고 **연락처 컬럼은 `accepted` 상태의 제안을 보낸 구인자에게만** 노출 (연락처를 별도 테이블 또는 보안 뷰로 분리 권장) |
| `position_offers` | 읽기: `employer_user_id` 또는 `seeker_user_id`가 본인. 생성: `employer_user_id = auth.uid()`. 상태 변경: 수락/거절은 구직자만 |
| `position_offer_messages` | 읽기·쓰기: 해당 제안의 당사자만 |
| `jobs` | 읽기: 전체(활성 공고). 생성·수정·삭제: `user_id = auth.uid()` |
| `applications` | 읽기·생성: `user_id = auth.uid()` |
| `notifications` | 읽기: `user_id = auth.uid()` |
| `resume_contact_views` | 생성: `employer_user_id = auth.uid()` |
| Storage `avatars` | 업로드 경로 첫 폴더가 `auth.uid()`인 경우만 쓰기 허용 |

## 3. 키 관리

- 과거 커밋 기록에 카카오 REST/JavaScript 키가 포함된 적이 있습니다. **카카오 개발자 콘솔에서 키를 재발급**하고 새 키는 Vercel 환경변수에만 등록하세요.
- `.env*` 파일은 커밋하지 않습니다(`.env.example`만 예외).
- `service_role` 키는 클라이언트 코드·`NEXT_PUBLIC_*` 변수에 절대 넣지 않습니다.
