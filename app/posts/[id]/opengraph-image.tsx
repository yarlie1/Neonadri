import { ImageResponse } from "next/og";
import { createClient } from "../../../lib/supabase/server";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type ImageProps = {
  params: {
    id: string;
  };
};

function SparkleMark() {
  return (
    <div
      style={{
        height: "64px",
        width: "64px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #ffffff 0%, #dce6ec 42%, #9aa6b1 100%)",
      }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
          fill="white"
        />
        <path
          d="M18.2 15.2L18.9 17.1L20.8 17.8L18.9 18.5L18.2 20.4L17.5 18.5L15.6 17.8L17.5 17.1L18.2 15.2Z"
          fill="white"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

export default async function PostOpenGraphImage({ params }: ImageProps) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, place_name, location, meeting_purpose, meeting_time, target_gender, target_age_group, status"
    )
    .eq("id", params.id)
    .maybeSingle();

  const post = data as
    | {
        id: number;
        place_name: string | null;
        location: string | null;
        meeting_purpose: string | null;
        meeting_time: string | null;
        target_gender: string | null;
        target_age_group: string | null;
        status: string | null;
      }
    | null;

  const purpose = post?.meeting_purpose?.trim() || "Meetup";
  const place = post?.place_name?.trim() || "Neonadri";
  const location = post?.location?.trim() || "Discover nearby plans";
  const audience = [post?.target_gender?.trim(), post?.target_age_group?.trim()]
    .filter(Boolean)
    .join(" / ");
  const statusLabel =
    String(post?.status || "open").toLowerCase() === "cancelled"
      ? "Cancelled"
      : "Open meetup";
  const meetingTime = post?.meeting_time
    ? new Date(post.meeting_time).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "View details in Neonadri";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #ffffff 0%, #eef3f6 46%, #d6dee5 100%)",
          color: "#22303a",
          padding: "56px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <SparkleMark />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                }}
              >
                Neonadri
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#66737c",
                }}
              >
                A calmer way to meet someone new.
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #c4d0d7",
              borderRadius: "999px",
              padding: "12px 18px",
              fontSize: "18px",
              color: "#2b3942",
              background: "rgba(255,255,255,0.78)",
            }}
          >
            {statusLabel}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "920px",
          }}
        >
          <div
            style={{
              fontSize: "62px",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            {purpose}
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#4f6069",
              lineHeight: 1.2,
            }}
          >
            {place}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#6b7881",
              lineHeight: 1.4,
            }}
          >
            {location}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                color: "#60707a",
              }}
            >
              {meetingTime}
            </div>
            {audience ? (
              <div
                style={{
                  fontSize: "18px",
                  color: "#60707a",
                }}
              >
                {audience}
              </div>
            ) : null}
          </div>

          <div
            style={{
              border: "1px solid #d0d9df",
              borderRadius: "999px",
              padding: "12px 18px",
              fontSize: "18px",
              color: "#33444d",
              background: "rgba(255,255,255,0.82)",
            }}
          >
            View details on Neonadri
          </div>
        </div>
      </div>
    ),
    size
  );
}
