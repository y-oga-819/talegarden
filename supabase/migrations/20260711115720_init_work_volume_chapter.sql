-- Phase 0 スキーマ: Work / Volume / Chapter 集約。
-- 集約同士は id 参照のみ。集約をまたぐ整合性は外部キーで担保し、所有権は RLS で
-- auth.users に紐づける。

create extension if not exists "pgcrypto";

-- 以下の全テーブルで共有する updated_at 更新処理。
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Work 集約ルート: 他の全集約がぶら下がるテナント境界。
create table public.works (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  synopsis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint works_title_not_blank check (length(btrim(title)) > 0)
);
create index works_owner_id_idx on public.works (owner_id);

create trigger works_set_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

-- Volume 集約ルート。
create table public.volumes (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  number integer not null,
  title text not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint volumes_number_positive check (number > 0),
  constraint volumes_number_unique_per_work unique (work_id, number)
);
create index volumes_work_id_idx on public.volumes (work_id);

create trigger volumes_set_updated_at
  before update on public.volumes
  for each row execute function public.set_updated_at();

-- Chapter は Volume 集約の子エンティティ。body に原稿を ProseMirror ドキュメントとして
-- 保持し、position で巻内の章順序を保つ。
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  volume_id uuid not null references public.volumes (id) on delete cascade,
  position integer not null,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chapters_position_positive check (position > 0),
  constraint chapters_word_count_non_negative check (word_count >= 0),
  constraint chapters_position_unique_per_volume unique (volume_id, position)
);
create index chapters_volume_id_idx on public.chapters (volume_id);

create trigger chapters_set_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

-- Row Level Security: 認証済みユーザーは自分の作品と、そこから辿れるものだけを
-- 参照できる。
alter table public.works enable row level security;
alter table public.volumes enable row level security;
alter table public.chapters enable row level security;

create policy works_owner_all on public.works
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy volumes_owner_all on public.volumes
  for all to authenticated
  using (
    exists (
      select 1 from public.works w
      where w.id = volumes.work_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.works w
      where w.id = volumes.work_id and w.owner_id = auth.uid()
    )
  );

create policy chapters_owner_all on public.chapters
  for all to authenticated
  using (
    exists (
      select 1
      from public.volumes v
      join public.works w on w.id = v.work_id
      where v.id = chapters.volume_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.volumes v
      join public.works w on w.id = v.work_id
      where v.id = chapters.volume_id and w.owner_id = auth.uid()
    )
  );
