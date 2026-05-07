import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

const AVATAR_BUCKET = "profile-avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose a profile photo first." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Profile photo must be a JPG, PNG, WebP, or GIF image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Profile photo must be 2 MB or smaller after resizing." },
        { status: 400 }
      );
    }

    const extension = extensionForType(file.type);
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const adminSupabase = createAdminClient();
    const bytes = await file.arrayBuffer();
    const { error } = await adminSupabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, bytes, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Profile avatar upload failed", {
        message: error.message,
        name: error.name,
      });
      return NextResponse.json(
        { error: "Could not upload profile photo." },
        { status: 500 }
      );
    }

    const { data } = adminSupabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({ avatarUrl: data.publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Profile avatar route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
