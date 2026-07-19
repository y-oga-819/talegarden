import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getWork } from "@/lib/db/works";
import { listVolumes } from "@/lib/db/volumes";
import { listCharacters } from "@/lib/db/characters";
import { createClient } from "@/lib/supabase/server";
import { DeleteVolumeButton } from "./delete-volume-button";
import { DeleteCharacterButton } from "./delete-character-button";
import { WorksHeader } from "../works-header";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const work = await getWork(id);
  if (!work) {
    notFound();
  }

  const volumes = await listVolumes(id);
  const characters = await listCharacters(id);

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/works"
          className="text-sm text-black/50 hover:underline dark:text-white/50"
        >
          ← 作品一覧
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{work.title}</h1>
            {work.synopsis ? (
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {work.synopsis}
              </p>
            ) : null}
          </div>
          <Link
            href={`/works/${work.id}/edit`}
            className="shrink-0 rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
          >
            作品を編集
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">巻</h2>
          <Link
            href={`/works/${work.id}/volumes/new`}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            巻を追加
          </Link>
        </div>

        {volumes.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/20">
            <p className="text-sm text-black/60 dark:text-white/60">
              まだ巻がありません。最初の一巻から庭を広げましょう。
            </p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {volumes.map((volume) => (
              <li
                key={volume.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="min-w-0">
                  <Link
                    href={`/works/${work.id}/volumes/${volume.id}`}
                    className="font-medium hover:underline"
                  >
                    <span className="text-black/50 dark:text-white/50">
                      第{volume.number}巻
                    </span>{" "}
                    {volume.title}
                  </Link>
                  {volume.summary ? (
                    <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                      {volume.summary}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/works/${work.id}/volumes/${volume.id}/edit`}
                    className="rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
                  >
                    編集
                  </Link>
                  <DeleteVolumeButton
                    workId={work.id}
                    volumeId={volume.id}
                    title={volume.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-lg font-semibold">登場人物</h2>
          <Link
            href={`/works/${work.id}/characters/new`}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            登場人物を追加
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/20">
            <p className="text-sm text-black/60 dark:text-white/60">
              まだ登場人物がいません。物語の住人を迎え入れましょう。
            </p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {characters.map((character) => (
              <li
                key={character.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{character.name}</span>
                    {character.role ? (
                      <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60 dark:bg-white/10 dark:text-white/60">
                        {character.role}
                      </span>
                    ) : null}
                  </div>
                  {character.profile ? (
                    <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                      {character.profile}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/works/${work.id}/characters/${character.id}/edit`}
                    className="rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
                  >
                    編集
                  </Link>
                  <DeleteCharacterButton
                    workId={work.id}
                    characterId={character.id}
                    name={character.name}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
