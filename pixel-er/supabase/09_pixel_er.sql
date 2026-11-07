-- ============================================================================
--  نادي طب الطوارئ — PIXEL ER: حالة الأسبوع + لوحة الصدارة
--  شغّله مرة واحدة من SQL Editor بعد الملفات 01 → 08
--
--  هذا الملف يُضيف فقط: جدولين جديدين ودوال جديدة باسم pixel_*.
--  لا يحذف ولا يعدّل أي جدول موجود، ولا يمس بيانات الأعضاء.
--  يمكن تشغيله أكثر من مرة بأمان.
-- ============================================================================


-- ============================================================================
--  ١)  الحالات  (يكتبها Case Builder — والمحتوى نفسه في عمود data)
-- ============================================================================
create table if not exists public.pixel_cases (
  id           text primary key check (id ~ '^[a-z0-9][a-z0-9_-]*$'),
  title        text not null default '',
  status       text not null default 'draft'
               check (status in ('draft','ai_reviewed','faculty_review','faculty_approved','scheduled','published','archived')),
  publish_at   timestamptz,            -- يظهر للأعضاء من هذا الوقت
  close_at     timestamptz,            -- بعده: أرشيف (تدريب فقط، لا محاولات رسمية)
  data         jsonb not null,         -- الحالة كاملة بصيغة PIXEL ER
  approved_by  uuid references public.supervisors(id) on delete set null,   -- (قديم) غير مستخدم
  approved_by_member uuid references public.members(id) on delete set null,
  approved_at  timestamptz,
  updated_by   uuid references public.members(id) on delete set null,
  updated_at   timestamptz not null default now(),
  constraint pixel_cases_id_matches check (data ->> 'id' = id)
);
alter table public.pixel_cases add column if not exists approved_by_member uuid references public.members(id) on delete set null;


-- ============================================================================
--  ٢)  المحاولات  (تكتبها دالة الخادم pixel-er-submit فقط — بعد إعادة حساب الدرجة)
-- ============================================================================
create table if not exists public.pixel_attempts (
  id           uuid primary key default gen_random_uuid(),
  case_id      text not null references public.pixel_cases(id) on delete restrict,
  member_id    uuid not null references public.members(id) on delete cascade,
  official     boolean not null default false,     -- أول محاولة مكتملة أثناء فترة الحالة
  score        int  not null check (score between 0 and 100),
  xp           int  not null default 0,
  sim_minutes  int  not null default 0,            -- الوقت داخل الحالة (لكسر التعادل)
  ending       text default '',
  breakdown    jsonb,
  history      jsonb not null,                     -- تسلسل قرارات اللاعب (لإعادة الحساب والمراجعة)
  created_at   timestamptz not null default now()
);
-- محاولة رسمية واحدة فقط لكل عضو في كل حالة
create unique index if not exists pixel_attempts_one_official
  on public.pixel_attempts (case_id, member_id) where official;
create index if not exists pixel_attempts_board
  on public.pixel_attempts (case_id, official, score desc, sim_minutes, created_at);


-- ============================================================================
--  ٣)  سير الاعتماد
--      - الاعتماد والنشر: رئيس النادي أو نائبه فقط  (is_admin)
--      - اسم من اعتمد وتاريخ الاعتماد يُسجَّلان تلقائيًا من الخادم (لا يُكتبان يدويًا)
--      - أي تعديل على محتوى حالة معتمدة يُسجَّل كاعتماد جديد باسم من عدّل
-- ============================================================================
create or replace function public.pixel_guard_case()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  approved      constant text[] := array['faculty_approved','scheduled','published','archived'];
  old_status    text := case when tg_op = 'UPDATE' then old.status else null end;
  newly         boolean;
  content_moved boolean;
  who           text;
begin
  -- العمودان title و status يتبعان محتوى الحالة دائمًا
  new.title  := coalesce(new.data ->> 'title', new.title, '');
  new.status := coalesce(new.data ->> 'status', 'draft');

  if new.status = any(approved) then
    newly := old_status is null or not (old_status = any(approved));
    content_moved := tg_op = 'UPDATE' and (new.data - 'schedule' - 'status' - 'review') is distinct from (old.data - 'schedule' - 'status' - 'review');
    if newly or content_moved then
      if not public.is_admin() then
        raise exception 'Only the club president or vice-president can approve or publish a case.';
      end if;
      select m.full_name into who from public.members m where m.id = public.me_id();
      new.data := jsonb_set(new.data, '{review}',
        coalesce(new.data -> 'review', '{}'::jsonb)
        || jsonb_build_object('facultyReviewer', coalesce(who, ''),
                              'lastReviewed', to_char(now() at time zone 'Asia/Riyadh', 'YYYY-MM-DD')));
      new.approved_by_member := public.me_id();
      new.approved_at := now();
    else
      -- تغيير الموعد أو الحالة فقط: يبقى اسم المعتمِد وتاريخه كما هما
      new.data := jsonb_set(new.data, '{review}', coalesce(old.data -> 'review', '{}'::jsonb));
      new.approved_by_member := old.approved_by_member;
      new.approved_at := old.approved_at;
    end if;
  else
    new.approved_by := null;
    new.approved_by_member := null;
    new.approved_at := null;
  end if;

  new.updated_at := now();
  new.updated_by := public.me_id();
  return new;
end $$;

drop trigger if exists pixel_cases_guard on public.pixel_cases;
create trigger pixel_cases_guard
  before insert or update on public.pixel_cases
  for each row execute function public.pixel_guard_case();


-- ============================================================================
--  ٤)  الصلاحيات
-- ============================================================================
alter table public.pixel_cases    enable row level security;
alter table public.pixel_attempts enable row level security;

grant select, insert, update, delete on public.pixel_cases to authenticated;
grant select, delete on public.pixel_attempts to authenticated;   -- لا إضافة ولا تعديل من المتصفح أبدًا

drop policy if exists pixel_read_cases  on public.pixel_cases;
drop policy if exists pixel_add_cases   on public.pixel_cases;
drop policy if exists pixel_edit_cases  on public.pixel_cases;
drop policy if exists pixel_del_cases   on public.pixel_cases;
drop policy if exists pixel_read_att    on public.pixel_attempts;
drop policy if exists pixel_del_att     on public.pixel_attempts;

-- الأعضاء: الحالات المنشورة التي حان وقتها + الأرشيف.  الإدارة والمشرفون: كل شيء (المشرفون قراءة فقط).
create policy pixel_read_cases on public.pixel_cases for select to authenticated
  using (
    public.is_admin() or public.is_supervisor()
    or (public.is_club_member()
        and status in ('published','scheduled','archived')
        and (publish_at is null or publish_at <= now()))
  );
create policy pixel_add_cases  on public.pixel_cases for insert to authenticated
  with check (public.is_admin());
create policy pixel_edit_cases on public.pixel_cases for update to authenticated
  using (public.is_admin());
create policy pixel_del_cases  on public.pixel_cases for delete to authenticated
  using (public.is_admin());

-- العضو يرى محاولاته فقط.  الإدارة والمشرفون يرون الجميع.
create policy pixel_read_att on public.pixel_attempts for select to authenticated
  using (member_id = public.me_id() or public.is_admin() or public.is_supervisor());
create policy pixel_del_att  on public.pixel_attempts for delete to authenticated
  using (public.is_admin());


-- ============================================================================
--  ٥)  الاسم في لوحة الصدارة: الاسم الأول + الأخير
--      «سارة محمد عبدالله العتيبي» ← «سارة العتيبي»
--      «عبد الله فهد آل سعود»      ← «عبد الله آل سعود»
-- ============================================================================
create or replace function public.pixel_short_name(full_name text)
returns text language plpgsql immutable as $$
declare
  w     text[] := regexp_split_to_array(btrim(regexp_replace(coalesce(full_name,''), '\s+', ' ', 'g')), ' ');
  n     int := cardinality(w);
  first text;
  last  text;
  fi    int := 1;
begin
  if n = 0 or w[1] = '' then return ''; end if;
  if n = 1 then return w[1]; end if;
  first := w[1];
  if w[1] in ('عبد','عبدال') and n >= 3 then first := w[1] || ' ' || w[2]; fi := 2; end if;
  last := w[n];
  if n - 1 > fi and w[n-1] in ('آل','ال','بن','ابن','بنت','أبو','ابو','al','Al','bin','Bin','bint') then
    last := w[n-1] || ' ' || w[n];
  end if;
  if n = fi then return first; end if;
  return first || ' ' || last;
end $$;


-- ============================================================================
--  ٦)  لوحة الصدارة وإحصاءات المشاركة  (للأعضاء والمشرفين فقط)
--      الترتيب: الدرجة ↓ ثم الوقت داخل الحالة ↑ ثم وقت التسليم ↑
-- ============================================================================
create or replace function public.pixel_leaderboard(p_case text)
returns table (rank bigint, name text, study_level text, score int, sim_minutes int, is_me boolean)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by a.score desc, a.sim_minutes asc, a.created_at asc) as rank,
         public.pixel_short_name(m.full_name),
         coalesce(m.study_level, ''),
         a.score, a.sim_minutes,
         a.member_id = public.me_id()
  from public.pixel_attempts a
  join public.members m on m.id = a.member_id
  where a.case_id = p_case and a.official
    and (public.is_club_member() or public.is_supervisor())
  order by 1;
$$;

-- مجموع نقاط XP من كل المحاولات الرسمية
create or replace function public.pixel_leaderboard_overall()
returns table (rank bigint, name text, study_level text, total_xp bigint, cases_played bigint, is_me boolean)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by sum(a.xp) desc, count(*) desc, min(a.created_at) asc),
         public.pixel_short_name(m.full_name),
         coalesce(m.study_level, ''),
         sum(a.xp), count(*),
         a.member_id = public.me_id()
  from public.pixel_attempts a
  join public.members m on m.id = a.member_id
  where a.official and (public.is_club_member() or public.is_supervisor())
  group by a.member_id, m.full_name, m.study_level
  order by 1;
$$;

-- أكثر السنوات مشاركة  (p_case فارغ = كل الحالات)
create or replace function public.pixel_participation(p_case text default null)
returns table (study_level text, participants bigint, entries bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(m.study_level, ''), 'غير محدد'),
         count(distinct a.member_id), count(*)
  from public.pixel_attempts a
  join public.members m on m.id = a.member_id
  where a.official and (p_case is null or a.case_id = p_case)
    and (public.is_club_member() or public.is_supervisor())
  group by 1
  order by 2 desc, 3 desc, 1;
$$;

-- النتائج الكاملة: للإدارة والمشرفين فقط
create or replace function public.pixel_results(p_case text)
returns table (attempt_id uuid, full_name text, study_level text, committee text, official boolean,
               score int, xp int, sim_minutes int, ending text, breakdown jsonb, history jsonb, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select a.id, m.full_name, coalesce(m.study_level,''), coalesce(c.name_ar,''), a.official,
         a.score, a.xp, a.sim_minutes, a.ending, a.breakdown, a.history, a.created_at
  from public.pixel_attempts a
  join public.members m on m.id = a.member_id
  left join public.committees c on c.id = m.committee_id
  where a.case_id = p_case and (public.is_admin() or public.is_supervisor())
  order by a.official desc, a.score desc, a.sim_minutes, a.created_at;
$$;

-- من أنا في PIXEL ER؟ (الاسم، السنة، والصلاحيات) — للمتصفح
create or replace function public.pixel_whoami()
returns table (member_id uuid, full_name text, study_level text, is_admin boolean, is_supervisor boolean, supervisor_name text)
language sql stable security definer set search_path = public as $$
  select public.me_id(),
         (select m.full_name from public.members m where m.id = public.me_id()),
         (select coalesce(m.study_level,'') from public.members m where m.id = public.me_id()),
         public.is_admin(), public.is_supervisor(),
         (select btrim(coalesce(s.title,'') || ' ' || s.name) from public.supervisors s where s.id = public.me_sup_id());
$$;

revoke execute on function public.pixel_leaderboard(text), public.pixel_leaderboard_overall(),
  public.pixel_participation(text), public.pixel_results(text), public.pixel_whoami() from anon, public;
grant execute on function public.pixel_leaderboard(text), public.pixel_leaderboard_overall(),
  public.pixel_participation(text), public.pixel_results(text), public.pixel_whoami() to authenticated;
