import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Neonadri";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          color: "#111111",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #111111",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 54,
            left: 64,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 0,
          }}
        >
          Neonadri
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0,
            textAlign: "center",
          }}
        >
          Small Meetups
          <br />
          in Los Angeles
        </div>
        <div
          style={{
            width: 660,
            height: 2,
            background: "#111111",
            marginTop: 36,
            marginBottom: 22,
          }}
        />
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: "uppercase",
          }}
        >
          Coffee / Dinner / Books / Low Pressure
        </div>
      </div>
    ),
    size
  );
}