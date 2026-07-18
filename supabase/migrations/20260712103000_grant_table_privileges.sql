-- RLS ポリシーだけでは行の絞り込みしか行えず、テーブルへの DML 権限が無いと
-- authenticated ロールは "permission denied for table ..." で弾かれる。初期
-- マイグレーションで GRANT を入れ忘れていたため、ここで補う。
--
-- anon には付与しない。TaleGarden の全アクセスはログイン利用者前提で、RLS は
-- `owner_id = auth.uid()` を条件にしている。anon に SELECT を許しても行は返らない
-- が、そもそも権限を与えない方が意図が明確で、多層防御にもなるから。
grant select, insert, update, delete on table public.works to authenticated;
grant select, insert, update, delete on table public.volumes to authenticated;
grant select, insert, update, delete on table public.chapters to authenticated;
