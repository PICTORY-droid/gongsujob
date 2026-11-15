/**
 * 직종 분류 (단일 출처). 분야 6개 아래에 세부 직종을 둔다.
 * 세부 직종 이름은 DB(jobs.job_type, resumes.job_type)에 그대로 저장되므로 이름을 바꿀 때는 데이터도 함께 옮겨야 한다.
 * 한 직종은 한 분야에만 속한다(테스트로 보장).
 */

export type JobGroupKey = "site" | "skilled" | "logistics" | "moving" | "restaurant" | "factory";

export type JobGroup = {
  key: JobGroupKey;
  label: string;
  description: string;
  /** 건설업 일용직 여부 — 근로계약서 양식(건설일용) 선택에 쓴다 */
  construction: boolean;
  types: readonly string[];
};

export const JOB_GROUPS = [
  { key: "site", label: "현장 인력", description: "건설 현장 기능공·보통인부", construction: true, types: ["보통인부", "철근", "형틀", "조적", "미장", "도장", "타일", "방수", "신호수", "기타"] },
  { key: "skilled", label: "기술 인력", description: "전기·설비·용접 기술자", construction: true, types: ["전기", "배관", "용접", "설비", "중장비"] },
  { key: "logistics", label: "물류 인력", description: "상하차·분류·지게차", construction: false, types: ["상하차", "피킹·분류", "지게차"] },
  { key: "moving", label: "이사 인력", description: "포장이사·짐 운반", construction: false, types: ["포장이사", "운반"] },
  { key: "restaurant", label: "식당 파출", description: "홀서빙·주방보조", construction: false, types: ["홀서빙", "주방보조", "설거지"] },
  { key: "factory", label: "공장·농장", description: "생산·포장·농작업", construction: false, types: ["생산·조립", "포장", "농작업"] },
] as const satisfies readonly JobGroup[];

export const JOB_TYPES = JOB_GROUPS.flatMap((group) => group.types);
