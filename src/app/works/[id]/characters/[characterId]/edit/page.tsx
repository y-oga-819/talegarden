import { notFound, redirect } from "next/navigation";

import { getCharacter } from "@/lib/db/characters";
import { createClient } from "@/lib/supabase/server";
import { updateCharacterAction } from "@/lib/characters/actions";
import { CharacterForm } from "../../../character-form";
import { WorksHeader } from "../../../../works-header";

export default async function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { id, characterId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const character = await getCharacter(characterId);
  // 他人のキャラ・存在しないキャラ、URL の作品 id と一致しないキャラはいずれも 404 扱い。
  if (!character || character.workId !== id) {
    notFound();
  }

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">
          登場人物を編集
          <span className="ml-2 text-base font-normal text-black/50 dark:text-white/50">
            {character.name}
          </span>
        </h1>
        <CharacterForm
          action={updateCharacterAction}
          submitLabel="保存"
          workId={id}
          characterId={character.id}
          defaultValues={{
            name: character.name,
            role: character.role ?? "",
            profile: character.profile ?? "",
          }}
        />
      </main>
    </>
  );
}
