import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import ProfileEditForm from "../ProfileEditForm";

type PageProps = {
  params: {
    id: string;
  };
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  about_me: string | null;
  gender: string | null;
  age_group: string | null;
  preferred_area: string | null;
  languages: string[] | null;
  meeting_style: string | null;
  interests: string[] | null;
  response_time_note: string | null;
  is_public: boolean | null;
};

export default async function EditProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const userId = params.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id !== userId) {
    redirect(`/profile/${user.id}`);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        display_name,
        bio,
        about_me,
        gender,
        age_group,
        preferred_area,
        languages,
        meeting_style,
        interests,
        response_time_note,
        is_public
      `
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="relative overflow-hidden rounded-[38px] border border-[#ecdccf] bg-[radial-gradient(circle_at_top_left,#fffaf5_0%,#f5e3d6_42%,#ead1c1_100%)] p-6 shadow-[0_22px_50px_rgba(120,76,52,0.12)] sm:p-7">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#9d6c56]/8 blur-2xl" />
          <div className="relative">
            <Link
              href={`/profile/${userId}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-[#5a5149] shadow-sm backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Profile
            </Link>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#2b1f1a] sm:text-[2.2rem]">
              Update your profile
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
              Edit your profile on a full page so it is easier to review details
              and save changes without a popup getting in the way.
            </p>
          </div>
        </div>

        <ProfileEditForm profile={profile as ProfileRow} />
      </div>
    </main>
  );
}
