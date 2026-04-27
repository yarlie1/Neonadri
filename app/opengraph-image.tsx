import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function SparkleMark() {
  return (
    <div
      style={{
        height: "72px",
        width: "72px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #ffffff 0%, #dce6ec 42%, #9aa6b1 100%)",
      }}
    >
      <svg
        width="34"
        height="34"
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

export default function OpenGraphImage() {
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
            "radial-gradient(circle at top left, #ffffff 0%, #eef3f6 36%, #d4dde4 100%)",
          color: "#22303a",
          padding: "56px",
          fontFamily: "Arial, sans-serif",
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
              gap: "6px",
            }}
          >
            <div
              style={{
                fontSize: "54px",
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              Neonadri
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#62707a",
              }}
            >
              Soft social layer
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "860px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            A calmer way to meet someone new.
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#5d6a74",
              lineHeight: 1.4,
            }}
          >
            Discover nearby meetups, see who is hosting, and browse at a calmer
            pace.
          </div>
        </div>
      </div>
    ),
    size
  );
}
