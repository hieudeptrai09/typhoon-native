import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SORTING_RANK, TITLE_COMMON } from "@/lib/constants";
import { getTyphoonNameByName } from "@/lib/db/api/getTyphoonNameByName";
import type { IntensityType, RetiredName, Storm, TyphoonName } from "@/lib/types";
import { BACKGROUND_BADGE, TEXT_COLOR_BADGE } from "@/lib/utils/colors";
import { fetchImageAsDataUri, flagDataUri } from "@/lib/utils/og";
import { isExternalPosition } from "@/lib/utils/position";
import { ImageResponse } from "next/og";

export const alt = `Typhoon name details | ${TITLE_COMMON}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{ name: string }>;
}

const STATUS_STYLE = {
  external: { color: "#475569", background: "#f1f5f9" },
  misspelling: { color: "#d97706", background: "#fef3c7" },
  retired: { color: "#dc2626", background: "#fee2e2" },
  active: { color: "#059669", background: "#d1fae5" },
};

const INTENSITY_SHORT: Record<IntensityType, string> = {
  5: "Cat 5",
  4: "Cat 4",
  3: "Cat 3",
  2: "Cat 2",
  1: "Cat 1",
  STS: "STS",
  TS: "TS",
  TD: "TD",
  NT: "Not tracked",
};

// Strongest storm by intensity; among equals the most recent one.
const pickStrongestStorm = (storms: Storm[]): Storm | null =>
  storms.reduce<Storm | null>((best, storm) => {
    if (!storm.map) return best;
    if (!best) return storm;
    const diff = SORTING_RANK[storm.intensity] - SORTING_RANK[best.intensity];
    if (diff > 0 || (diff === 0 && storm.year > best.year)) return storm;
    return best;
  }, null);

export default async function OpengraphImage({ params }: OgImageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const [regular, bold, logo, result] = await Promise.all([
    readFile(join(process.cwd(), "src", "lib", "fonts", "OpenSans-Regular.ttf")),
    readFile(join(process.cwd(), "src", "lib", "fonts", "OpenSans-Bold.ttf")),
    readFile(join(process.cwd(), "public", "web-app-manifest-512x512.png")),
    getTyphoonNameByName(decodedName).catch(() => null),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const nameData = result?.data.name ?? null;
  const storms = result?.data.storms ?? [];

  const isRetiredName = (n: TyphoonName | RetiredName): n is RetiredName => "lastYear" in n;
  const retiredData = nameData && isRetiredName(nameData) ? nameData : null;

  const displayName = nameData?.name ?? storms[0]?.name ?? decodedName;
  const isInPosition = nameData ? !isExternalPosition(nameData.position) : false;
  const isRetired = nameData?.isRetired ?? false;
  const country = nameData?.country ?? storms[0]?.country;

  const statusKey = !isInPosition
    ? "external"
    : nameData?.retirementReason === "misspell"
      ? "misspelling"
      : isRetired
        ? "retired"
        : "active";
  const status = STATUS_STYLE[statusKey];
  const statusLabel = !isInPosition
    ? "External name"
    : nameData?.retirementReason === "misspell"
      ? "Misspelling"
      : isRetired
        ? retiredData?.lastYear
          ? `Retired ${retiredData.lastYear}`
          : "Retired"
        : "Active";

  const strongest = pickStrongestStorm(storms);
  const mapSrc = strongest ? await fetchImageAsDataUri(strongest.map) : null;
  const flagSrc = country ? flagDataUri(country) : null;

  const stormCountLabel =
    storms.length === 0
      ? "No storms yet"
      : storms.length === 1
        ? "1 storm"
        : `${storms.length} storms`;
  const replacedLabel =
    isRetired && nameData?.isReplaced && retiredData?.replacementName
      ? `replaced by ${retiredData.replacementName}`
      : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        padding: "48px 56px",
        fontFamily: "Open Sans",
      }}
    >
      {/* Brand header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={44} height={44} />
        <div style={{ display: "flex", fontSize: 28, color: "#64748b" }}>{TITLE_COMMON}</div>
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 48, marginTop: 8 }}>
        {/* Text column */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              fontSize: displayName.length > 9 ? 84 : 104,
              fontWeight: 700,
              color: status.color,
              lineHeight: 1.1,
            }}
          >
            {displayName}
          </div>

          {nameData?.meaning && (
            <div
              style={{
                display: "flex",
                fontSize: 38,
                color: "#334155",
                marginTop: 12,
                lineHeight: 1.25,
              }}
            >
              “{nameData.meaning}”
            </div>
          )}
          {nameData?.language && (
            <div style={{ display: "flex", fontSize: 26, color: "#64748b", marginTop: 8 }}>
              {nameData.language}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 36,
              flexWrap: "wrap",
            }}
          >
            {country && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {flagSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={flagSrc}
                    alt=""
                    width={54}
                    height={36}
                    style={{ borderRadius: 6, border: "1px solid #cbd5e1" }}
                  />
                )}
                <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#334155" }}>
                  {country}
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: status.color,
                background: status.background,
                borderRadius: 9999,
                padding: "8px 24px",
              }}
            >
              {statusLabel}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 28, color: "#475569", marginTop: 24 }}>
            {replacedLabel ? `${stormCountLabel} · ${replacedLabel}` : stormCountLabel}
          </div>
        </div>

        {/* Strongest-storm track map */}
        {mapSrc && strongest && (
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 430,
              height: 430,
              borderRadius: 20,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mapSrc}
              alt=""
              width={430}
              height={430}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 16,
                left: 16,
                alignItems: "center",
                gap: 10,
                background: "rgba(255, 255, 255, 0.92)",
                borderRadius: 12,
                padding: "6px 14px 6px 6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 700,
                  color: TEXT_COLOR_BADGE[strongest.intensity],
                  background: BACKGROUND_BADGE[strongest.intensity],
                  borderRadius: 8,
                  padding: "4px 12px",
                }}
              >
                {INTENSITY_SHORT[strongest.intensity]}
              </div>
              <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#334155" }}>
                {strongest.year}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Open Sans", data: regular, weight: 400, style: "normal" },
        { name: "Open Sans", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
