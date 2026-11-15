-- =====================================================================
-- 현장공수잡 초기 스키마
-- 코드(services/, types/domain.ts)가 실제로 읽고 쓰는 컬럼 기준으로 작성
-- Supabase 대시보드 > SQL Editor 에 전체 붙여넣고 Run (여러 번 실행해도 안전)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. 테이블
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  user_type   text check (user_type in ('구인자', '구직자')),
  name        text,
  phone       text,
  address     text,
  region      text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  title            text not null,
  company          text,
  region           text not null,
  detail_address   text,
  job_type         text not null,
  pay              integer not null check (pay >= 0),
  pay_type         text not null,
  headcount        integer check (headcount is null or headcount > 0),
  start_date       date not null,
  end_date         date,
  completion_date  date,
  description      text,
  is_urgent        boolean not null default false,
  is_active        boolean not null default true,
  source           text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists jobs_active_created_idx on public.jobs (is_active, created_at desc);
create index if not exists jobs_user_idx on public.jobs (user_id);

create table if not exists public.resumes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users (id) on delete cascade,
  name             text,
  birth            text,
  phone            text,
  email            text,
  photo_url        text,
  job_type         text,
  career_years     integer check (career_years is null or career_years >= 0),
  address          text,
  skills           text,
  certifications   text,
  experience       text,
  education        text,
  has_safety_cert  boolean default false,
  is_public        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz
);
create index if not exists resumes_public_created_idx on public.resumes (is_public, created_at desc);

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references public.jobs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default '지원완료',
  created_at  timestamptz not null default now(),
  unique (job_id, user_id)
);
create index if not exists applications_user_idx on public.applications (user_id, created_at desc);

create table if not exists public.position_offers (
  id                uuid primary key default gen_random_uuid(),
  employer_user_id  uuid not null references auth.users (id) on delete cascade,
  seeker_user_id    uuid not null references auth.users (id) on delete cascade,
  resume_id         uuid not null references public.resumes (id) on delete cascade,
  job_id            uuid references public.jobs (id) on delete set null,
  title             text not null,
  job_type          text not null,
  location          text not null,
  start_date        date not null,
  pay               integer not null check (pay >= 0),
  work_conditions   text,
  message           text not null,
  status            text not null default 'pending'
                    check (status in ('pending', 'question', 'answered', 'accepted', 'rejected', 'cancelled')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz
);
create index if not exists offers_employer_idx on public.position_offers (employer_user_id, created_at desc);
create index if not exists offers_seeker_idx on public.position_offers (seeker_user_id, created_at desc);
create index if not exists offers_resume_idx on public.position_offers (resume_id);

create table if not exists public.position_offer_messages (
  id              uuid primary key default gen_random_uuid(),
  offer_id        uuid not null references public.position_offers (id) on delete cascade,
  sender_user_id  uuid not null references auth.users (id) on delete cascade,
  message         text not null,
  created_at      timestamptz not null default now()
);
create index if not exists offer_messages_offer_idx on public.position_offer_messages (offer_id, created_at);

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text not null,
  link_url    text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

create table if not exists public.resume_contact_views (
  id                uuid primary key default gen_random_uuid(),
  employer_user_id  uuid not null references auth.users (id) on delete cascade,
  resume_id         uuid not null references public.resumes (id) on delete cascade,
  created_at        timestamptz not null default now()
);

-- 진행 중인 공고만 보여주는 뷰 (호출자 권한으로 실행 → jobs RLS 그대로 적용)
create or replace view public.active_jobs
with (security_invoker = true) as
  select *
  from public.jobs
  where is_active = true
    and (end_date is null or end_date >= current_date);

-- ---------------------------------------------------------------------
-- 2. 행 수준 보안(RLS)
-- ---------------------------------------------------------------------

alter table public.profiles                enable row level security;
alter table public.jobs                    enable row level security;
alter table public.resumes                 enable row level security;
alter table public.applications            enable row level security;
alter table public.position_offers         enable row level security;
alter table public.position_offer_messages enable row level security;
alter table public.notifications           enable row level security;
alter table public.resume_contact_views    enable row level security;

-- profiles: 본인만
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- jobs: 누구나 조회(비로그인 메인 미리보기), 작성·수정·삭제는 본인
drop policy if exists "jobs_select_all" on public.jobs;
create policy "jobs_select_all" on public.jobs
  for select to anon, authenticated using (true);
drop policy if exists "jobs_insert_own" on public.jobs;
create policy "jobs_insert_own" on public.jobs
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "jobs_update_own" on public.jobs;
create policy "jobs_update_own" on public.jobs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "jobs_delete_own" on public.jobs;
create policy "jobs_delete_own" on public.jobs
  for delete to authenticated using (user_id = auth.uid());

-- resumes: 공개 이력서는 누구나 조회, 본인 이력서는 전체 권한
drop policy if exists "resumes_select_public_or_own" on public.resumes;
create policy "resumes_select_public_or_own" on public.resumes
  for select to anon, authenticated using (is_public = true or user_id = auth.uid());
drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own" on public.resumes
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own" on public.resumes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- applications: 지원자 본인 + 해당 공고 작성자 조회, 지원은 본인 명의로만
drop policy if exists "applications_select" on public.applications;
create policy "applications_select" on public.applications
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.jobs j where j.id = job_id and j.user_id = auth.uid())
  );
drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own" on public.applications
  for insert to authenticated with check (user_id = auth.uid());

-- position_offers: 당사자만 조회·상태 변경, 생성은 구인자 본인 명의로만
drop policy if exists "offers_select_party" on public.position_offers;
create policy "offers_select_party" on public.position_offers
  for select to authenticated using (auth.uid() in (employer_user_id, seeker_user_id));
drop policy if exists "offers_insert_employer" on public.position_offers;
create policy "offers_insert_employer" on public.position_offers
  for insert to authenticated with check (employer_user_id = auth.uid());
drop policy if exists "offers_update_party" on public.position_offers;
create policy "offers_update_party" on public.position_offers
  for update to authenticated
  using (auth.uid() in (employer_user_id, seeker_user_id))
  with check (auth.uid() in (employer_user_id, seeker_user_id));

-- position_offer_messages: 해당 제안의 당사자만
drop policy if exists "offer_messages_select_party" on public.position_offer_messages;
create policy "offer_messages_select_party" on public.position_offer_messages
  for select to authenticated using (
    exists (select 1 from public.position_offers o
            where o.id = offer_id and auth.uid() in (o.employer_user_id, o.seeker_user_id))
  );
drop policy if exists "offer_messages_insert_party" on public.position_offer_messages;
create policy "offer_messages_insert_party" on public.position_offer_messages
  for insert to authenticated with check (
    sender_user_id = auth.uid()
    and exists (select 1 from public.position_offers o
                where o.id = offer_id and auth.uid() in (o.employer_user_id, o.seeker_user_id))
  );

-- notifications: 받는 사람만 조회·읽음 처리, 발송은 로그인 사용자(상대방 알림 생성)
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "notifications_insert_auth" on public.notifications;
create policy "notifications_insert_auth" on public.notifications
  for insert to authenticated with check (auth.uid() is not null);

-- resume_contact_views: 구인자 본인 기록만
drop policy if exists "contact_views_select_own" on public.resume_contact_views;
create policy "contact_views_select_own" on public.resume_contact_views
  for select to authenticated using (employer_user_id = auth.uid());
drop policy if exists "contact_views_insert_own" on public.resume_contact_views;
create policy "contact_views_insert_own" on public.resume_contact_views
  for insert to authenticated with check (employer_user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 3. 스토리지: 증명사진 버킷 (공개 읽기, 본인 폴더에만 업로드)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "avatars_insert_own_folder" on storage.objects;
create policy "avatars_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
