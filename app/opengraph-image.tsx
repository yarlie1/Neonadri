import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

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
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
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
              color: "#ffffff",
              fontSize: "34px",
              fontWeight: 800,
            }}
          >
            N
          </div>
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
              AI-softened social discovery
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
            Discover low-pressure meetups nearby.
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#5d6a74",
              lineHeight: 1.4,
            }}
          >
            Join existing plans or host your own with a calmer, safer social
            flow.
          </div>
        </div>
      </div>
    ),
    size
  );
}
