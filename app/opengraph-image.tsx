import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { TITLE_COMMON } from "@/lib/constants";
import { ImageResponse } from "next/og";

export const alt = TITLE_COMMON;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "web-app-manifest-512x512.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fefefe",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} alt="" width={512} height={512} />
    </div>,
    size,
  );
}
