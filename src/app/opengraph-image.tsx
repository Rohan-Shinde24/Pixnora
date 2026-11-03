import { ImageResponse } from "next/og";

export const alt = "Pixnora — AI image prompts and creative inspiration";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px",
          background: "#000",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #fff",
              borderRadius: "12px",
              fontSize: "27px",
            }}
          >
            P
          </div>
          <span style={{ fontSize: "26px", fontWeight: 600 }}>Pixnora</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "68px", fontWeight: 700, letterSpacing: "-3px" }}>
            AI image prompts
          </div>
          <div style={{ fontSize: "28px", color: "#bdbdbd" }}>
            Find inspiration. Make it yours.
          </div>
        </div>
        <div style={{ height: "1px", width: "100%", background: "#444" }} />
      </div>
    ),
    { ...size }
  );
}
