import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "999px",
          background:
            "radial-gradient(circle at 31% 20%, #ffffff 0%, #edf3f7 31%, #cbd5dd 62%, #85929d 100%)",
          border: "2px solid rgba(255,255,255,0.92)",
          boxShadow:
            "inset 0 2px 2px rgba(255,255,255,0.98), inset 0 -10px 18px rgba(70,84,96,0.18)",
          color: "#1f2c36",
          fontFamily: "Arial, sans-serif",
          fontSize: "34px",
          fontWeight: 900,
          letterSpacing: "-0.08em",
          lineHeight: 1,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "5px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.58)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.56) 0%, rgba(255,255,255,0.12) 42%, rgba(73,88,101,0.14) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "19px",
            top: "11px",
            width: "22px",
            height: "12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.68)",
          }}
        />
        <div
          style={{
            position: "relative",
            transform: "translateY(1px)",
            textShadow: "0 2px 0 rgba(255,255,255,0.62)",
          }}
        >
          N
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
