-- Character 集約ルート: Work 直下にぶら下がる登場人物。集約同士は id 参照のみで、
-- 所有権は works を辿って auth.users に紐づく（相関図など後続機能はこの id を参照する）。
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  name text not null,
  role text,
  profile text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint characters_name_not_blank check (length(btrim(name)) > 0)
);
create index characters_work_id_idx on public.characters (work_id);

create trigger characters_set_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();

-- Row Level Security: 作品所有者だけが自分の作品配下のキャラを操作できる。
-- volumes_owner_all と同じく works を経由して owner を判定する。
alter table public.characters enable row level security;

create policy characters_owner_all on public.characters
  for all to authenticated
  using (
    exists (
      select 1 from public.works w
      where w.id = characters.work_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.works w
      where w.id = characters.work_id and w.owner_id = auth.uid()
    )
  );

-- RLS は行の絞り込みしか行わない。authenticated ロールにテーブルの DML 権限が無いと
-- "permission denied for table characters" で弾かれるため、ここで付与する。
grant select, insert, update, delete on table public.characters to authenticated;
