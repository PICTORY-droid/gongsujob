import { describe, expect, it } from "vitest";
import { isErrorMessage, validateCredentials, validateJobForm, validateOfferForm, validateOnboarding, validateResumeForm, type JobFormValues } from "@/domain/validation";
import { filterJobs, filterResumes } from "@/domain/search";
import { toNewJob } from "@/domain/job";
import { toResumeForm, toResumeRecord } from "@/domain/resume";
import { emptyOfferForm, fillOfferFromJob } from "@/domain/offer-form";
import type { Job, Resume } from "@/types/domain";

const jobForm: JobFormValues = {
  title: "철근공 모집",
  company: "",
  region: "세종",
  detail_address: "어진동",
  job_type: "철근",
  pay: "250,000",
  pay_type: "일당",
  headcount: "3",
  start_date: "2026-12-01",
  end_date: "",
  completion_date: "",
  description: "",
  is_urgent: true,
};

describe("폼 검증", () => {
  it("공고: 필수 항목 누락 시 안내 문구", () => {
    expect(validateJobForm(jobForm)).toBeNull();
    expect(validateJobForm({ ...jobForm, pay: "" })).toBe("필수 항목을 모두 입력해주세요.");
  });

  it("이력서: 이름·직종 필수", () => {
    expect(validateResumeForm({ name: "", job_type: "철근" } as never)).toBe("이름과 직종은 필수입니다.");
  });

  it("온보딩: 순서대로 첫 번째 오류만 알려준다", () => {
    const ok = { userType: "구직자", name: "홍길동", phone: "010-1234-5678", address: "서울", region: "서울" };
    expect(validateOnboarding(ok)).toBeNull();
    expect(validateOnboarding({ ...ok, userType: "" })).toBe("구인자 또는 구직자를 선택해주세요.");
    expect(validateOnboarding({ ...ok, phone: "010-12" })).toBe("휴대전화번호를 올바르게 입력해주세요.");
    expect(validateOnboarding({ ...ok, region: "" })).toBe("활동 지역을 선택해주세요.");
  });

  it("제안·로그인 검증", () => {
    expect(validateOfferForm({ ...emptyOfferForm(), title: "x" })).toBe("필수 항목을 입력해주세요.");
    expect(validateCredentials(" ", "pw")).toBe("이메일과 비밀번호를 입력해주세요.");
  });

  it("오류성 문구 판별", () => {
    expect(isErrorMessage("제안 발송 실패: x")).toBe(true);
    expect(isErrorMessage("제안을 수락했습니다.")).toBe(false);
  });
});

describe("검색 필터", () => {
  it("공고는 제목·지역으로", () => {
    const jobs = [{ title: "철근공", region: "세종" }, { title: "도장공", region: "서울" }];
    expect(filterJobs(jobs, "서울")).toHaveLength(1);
    expect(filterJobs(jobs, "")).toHaveLength(2);
  });

  it("인재는 이름·직종·지역·기술로", () => {
    const resumes = [
      { name: "김철수", job_type: "철근", address: "부산", skills: "배근" },
      { name: "이영희", job_type: "도장", address: null, skills: null },
    ];
    expect(filterResumes(resumes, "배근").map((r) => r.name)).toEqual(["김철수"]);
  });
});

describe("레코드 변환", () => {
  it("공고 폼 → 저장 레코드 (금액 쉼표 제거, 빈 날짜는 null)", () => {
    const record = toNewJob(jobForm, "user-1");
    expect(record).toMatchObject({ user_id: "user-1", pay: 250000, headcount: 3, end_date: null, is_active: true, source: "직접등록" });
  });

  it("이력서 레코드 ↔ 폼 왕복", () => {
    const resume = { name: "홍길동", career_years: 7, is_public: false, job_type: "형틀" } as Resume;
    const form = toResumeForm(resume);
    expect(form.career_years).toBe("7");
    const record = toResumeRecord(form, { userId: "u", photoUrl: "p", hasSafetyCert: true, now: new Date("2026-11-15T00:00:00Z") });
    expect(record).toMatchObject({ user_id: "u", career_years: 7, is_public: false, has_safety_cert: true, updated_at: "2026-11-15T00:00:00.000Z" });
  });

  it("제안 양식에 내 공고 정보 채우기", () => {
    const job = { id: "j1", title: "현장", job_type: "철근", detail_address: null, region: "세종", start_date: "2026-12-01", pay: 200000, description: "점심 제공" } as Job;
    const filled = fillOfferFromJob(emptyOfferForm(), job);
    expect(filled).toMatchObject({ job_id: "j1", location: "세종", pay: "200000", work_conditions: "점심 제공" });
    expect(fillOfferFromJob(filled, undefined).job_id).toBe("");
  });
});
