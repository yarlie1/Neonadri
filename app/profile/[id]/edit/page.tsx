import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import ProfileEditForm from "../ProfileEditForm";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../../designSystem";

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
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className={`relative overflow-hidden rounded-[38px] p-6 sm:p-7 ${APP_SURFACE_CARD_CLASS}`}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#d6e0e6]/35 blur-2xl" />
          <div className="relative">
            <Link
              href={`/profile/${userId}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Profile
            </Link>

            <div className={`mt-5 ${APP_EYEBROW_CLASS}`}>Edit profile</div>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c] sm:text-[2.2rem]">
              Update your profile
            </h1>
            <p className={`mt-3 max-w-xl text-sm leading-6 sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
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
