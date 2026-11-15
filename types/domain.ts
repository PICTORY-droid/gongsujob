/**
 * 도메인 타입 정의
 * Supabase 테이블 행(Row)과 화면에서 쓰는 값 객체를 한곳에 모은다.
 * 컬럼 구성은 기존 코드에서 실제로 읽고 쓰는 필드만 반영했다.
 */

export type UserType = "구인자" | "구직자";

export type Profile = {
  id: string;
  user_type: UserType | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  region: string | null;
  avatar_url: string | null;
};

export type ProfileCompletionFields = Pick<Profile, "user_type" | "name" | "phone" | "address">;

export type PayType = "일당" | "월급" | "협의";

export type Job = {
  id: string;
  user_id: string;
  title: string;
  company: string | null;
  region: string;
  detail_address: string | null;
  job_type: string;
  pay: number;
  pay_type: string;
  headcount: number | null;
  start_date: string;
  end_date: string | null;
  completion_date: string | null;
  description: string | null;
  is_urgent: boolean;
  is_active: boolean;
  source: string | null;
  created_at: string;
};

export type NewJob = Omit<Job, "id" | "created_at">;

/** 목록·카드에 노출해도 되는 이력서 필드 (연락처 제외) */
export type PublicResume = {
  id: string;
  user_id: string;
  name: string | null;
  photo_url: string | null;
  job_type: string | null;
  career_years: number | null;
  address: string | null;
  skills: string | null;
  certifications: string | null;
  experience: string | null;
  has_safety_cert: boolean | null;
  is_public: boolean;
  created_at: string;
};

/** 본인 이력서 편집 시에만 다루는 전체 필드 */
export type Resume = PublicResume & {
  birth: string | null;
  phone: string | null;
  email: string | null;
  education: string | null;
  updated_at: string | null;
};

/** 저장(insert/update)용 이력서 레코드 */
export type ResumeUpsert = Omit<Resume, "id" | "created_at">;

export type ResumeContact = {
  phone: string | null;
  email: string | null;
};

export type ApplicationWithJob = {
  id: string;
  status: string;
  created_at: string;
  jobs: Pick<Job, "title" | "region" | "pay" | "pay_type"> | null;
};

export type OfferStatus = "pending" | "question" | "answered" | "accepted" | "rejected" | "cancelled";

export type PositionOffer = {
  id: string;
  employer_user_id: string;
  seeker_user_id: string;
  resume_id: string;
  job_id: string | null;
  title: string;
  job_type: string;
  location: string;
  start_date: string;
  pay: number;
  work_conditions: string | null;
  message: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string | null;
};

export type PositionOfferWithRelations = PositionOffer & {
  /** 연락처는 포함하지 않는다. 수락된 제안에 한해 별도 조회 */
  resumes: Pick<Resume, "name" | "job_type" | "address"> | null;
  jobs: Pick<Job, "title" | "region" | "pay" | "pay_type"> | null;
};

export type NewPositionOffer = Omit<PositionOffer, "id" | "created_at" | "updated_at">;

export type OfferMessage = {
  id: string;
  offer_id: string;
  sender_user_id: string;
  message: string;
  created_at: string;
};

export type NotificationType =
  | "position_offer"
  | "position_offer_accepted"
  | "position_offer_rejected"
  | "position_offer_question"
  | "position_offer_answer";

export type NewNotification = {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link_url: string;
};

export type GeoPoint = {
  lat: string;
  lng: string;
};

export type WeatherSummary = {
  location: string;
  nx: number;
  ny: number;
  weather: string;
  icon: string;
  workable: boolean;
  temperature: string | null;
  tempMin: string | null;
  tempMax: string | null;
  rainProb: string | null;
};

/** 서비스 계층 공통 결과 타입: 실패 시 사용자에게 보여줄 메시지를 함께 돌려준다. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
