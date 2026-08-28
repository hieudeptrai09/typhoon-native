import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { TITLE_COMMON } from "@/lib/constants";
import { getPositionDetails } from "@/lib/db/api/getPositionDetails";
import type { RetiredName, Storm, TyphoonName } from "@/lib/types";
import { getNameStatusColor, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { fetchImageAsDataUri, flagDataUri } from "@/lib/utils/og";
import { getPositionFromSlug, getPositionTitle } from "@/lib/utils/position";
import { calculateAverage, getIntensityFromNumber } from "@/lib/utils/storms";
import { ImageResponse } from "next/og";

export const alt = `Naming position details | ${TITLE_COMMON}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OgImageProps {
  params: Promise<{ position: string }>;
}

// Four names is the widest any slot has ever grown to; beyond that the last
// circle collapses into a "+N" counter so the row keeps its rhythm.
const MAX_ITEMS = 4;
const NEUTRAL_COLOR = "#475569";

// Soft fills for the circles that have no picture, keyed by the name-status color.
const TINT: Record<string, string> = {
  "#059669": "#d1fae5",
  "#dc2626": "#fee2e2",
  "#d97706": "#fef3c7",
  [NEUTRAL_COLOR]: "#f1f5f9",
};

interface TimelineItem {
  label: string;
  color: string;
  era: string;
  image?: string;
  // Drawn inside the circle in place of the initial; used by the overflow counter.
  glyph?: string;
}

const yearsOf = (storms: Storm[]) => storms.map((s) => s.year);

// Mirrors the page's timeline copy: a closed range for names that are done, an
// open one for names still in rotation.
function eraLabel(name: TyphoonName | RetiredName, storms: Storm[]): string {
  const years = yearsOf(storms);
  const firstYear = years.length > 0 ? Math.min(...years) : undefined;
  const lastStormYear = years.length > 0 ? Math.max(...years) : undefined;
  const retiredYear = "lastYear" in name && name.lastYear ? name.lastYear : lastStormYear;
  const isSucceeded = name.isRetired || !!("replacementName" in name && name.replacementName);

  if (firstYear === undefined) return isSucceeded ? "Never used" : "Awaiting first storm";
  if (!isSucceeded) return `${firstYear} – present`;
  return firstYear === retiredYear ? `${firstYear}` : `${firstYear} – ${retiredYear}`;
}

// Positions 141–143 hold no names of their own, only storms that wandered in
// from other basins, so their timeline is built from the storm names instead.
function itemsFromStorms(storms: Storm[]): TimelineItem[] {
  const byName = new Map<string, number[]>();
  storms.forEach((storm) => {
    const years = byName.get(storm.name) ?? [];
    years.push(storm.year);
    byName.set(storm.name, years);
  });

  return [...byName.entries()]
    .map(([label, years]) => ({
      label,
      color: NEUTRAL_COLOR,
      era:
        Math.min(...years) === Math.max(...years)
          ? `${Math.min(...years)}`
          : `${Math.min(...years)} – ${Math.max(...years)}`,
      first: Math.min(...years),
    }))
    .sort((a, b) => a.first - b.first);
}

function itemsFromNames(names: TyphoonName[], storms: Storm[]): TimelineItem[] {
  const stormsByName = new Map<string, Storm[]>();
  storms.forEach((storm) => {
    const group = stormsByName.get(storm.name) ?? [];
    group.push(storm);
    stormsByName.set(storm.name, group);
  });

  const sortKey = (name: TyphoonName | RetiredName) => {
    const years = yearsOf(stormsByName.get(name.name) ?? []);
    if (years.length > 0) return Math.min(...years);
    if ("lastYear" in name && name.lastYear) return name.lastYear;
    return Infinity;
  };

  return [...names]
    .sort((a, b) => sortKey(a) - sortKey(b))
    .map((name) => ({
      label: name.name,
      color: getNameStatusColor(name),
      era: eraLabel(name, stormsByName.get(name.name) ?? []),
      image: name.image,
    }));
}

// The rail runs the full width and shifts hue at each circle's centre, so the
// row reads as one continuous timeline rather than four separate portraits.
function railGradient(colors: string[]): string {
  if (colors.length === 0) return `linear-gradient(to right, #e2e8f0, #e2e8f0)`;
  if (colors.length === 1) return `linear-gradient(to right, ${colors[0]}, ${colors[0]})`;
  const stops = colors.map(
    (color, i) => `${color} ${Math.round(((i + 0.5) / colors.length) * 100)}%`,
  );
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

export default async function OpengraphImage({ params }: OgImageProps) {
  const { position } = await params;
  const parsed = getPositionFromSlug(position);
  // The page notFound()s anything outside the grid; don't spend a query on it here either.
  const positionNum =
    parsed !== null && Number.isInteger(parsed) && parsed >= 1 && parsed <= 143 ? parsed : null;

  const [regular, bold, logo, result] = await Promise.all([
    readFile(join(process.cwd(), "src", "lib", "fonts", "OpenSans-Regular.ttf")),
    readFile(join(process.cwd(), "src", "lib", "fonts", "OpenSans-Bold.ttf")),
    readFile(join(process.cwd(), "public", "web-app-manifest-512x512.png")),
    positionNum === null ? null : getPositionDetails(positionNum).catch(() => null),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const detail = result?.data ?? null;
  const names = detail?.names ?? [];
  const storms = detail?.storms ?? [];
  const country = detail?.country;

  const positionTitle =
    positionNum === null ? position.toUpperCase() : getPositionTitle(positionNum);
  const isInPosition = positionNum !== null && positionNum <= 140;
  const titleColor =
    storms.length > 0
      ? TEXT_COLOR_WHITE_BACKGROUND[getIntensityFromNumber(calculateAverage(storms))]
      : "#64748b";

  const allItems = names.length > 0 ? itemsFromNames(names, storms) : itemsFromStorms(storms);
  const overflow = allItems.length - MAX_ITEMS;
  const items =
    overflow > 0
      ? [
          ...allItems.slice(0, MAX_ITEMS - 1),
          {
            label: `${overflow + 1} more`,
            glyph: `+${overflow + 1}`,
            color: NEUTRAL_COLOR,
            era: "",
          },
        ]
      : allItems;

  const pictures = await Promise.all(
    items.map((item) => (item.image ? fetchImageAsDataUri(item.image) : Promise.resolve(null))),
  );

  const flagSrc = isInPosition && country ? flagDataUri(country) : null;
  const circle = items.length >= 4 ? 168 : items.length === 3 ? 186 : 200;
  const photo = circle - 12; // the circle minus its white ring

  const nameCountLabel = isInPosition
    ? `${names.length} ${names.length === 1 ? "name" : "names"}`
    : "External basin";
  const stormCountLabel = storms.length === 1 ? "1 storm" : `${storms.length} storms`;

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

      {/* Position title, flag and country */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 20 }}>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: titleColor }}>
          {positionTitle}
        </div>
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
        {isInPosition && country && (
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#334155" }}>
            {country}
          </div>
        )}
        <div style={{ display: "flex", fontSize: 26, color: "#64748b" }}>
          {nameCountLabel} · {stormCountLabel}
        </div>
      </div>

      {/* Name timeline */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        {items.length === 0 ? (
          <div style={{ display: "flex", fontSize: 32, color: "#94a3b8" }}>
            No names recorded at this position yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              position: "relative",
              width: "100%",
              alignItems: "flex-start",
              justifyContent: "space-around",
            }}
          >
            {/* Continuous rail behind the circles */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: 0,
                right: 0,
                top: circle / 2 - 3,
                height: 6,
                borderRadius: 9999,
                backgroundImage: railGradient(items.map((item) => item.color)),
              }}
            />

            {items.map((item, index) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: circle + 56,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: circle,
                    height: circle,
                    borderRadius: 9999,
                    border: "6px solid #ffffff",
                    background: TINT[item.color] ?? "#f1f5f9",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.18)",
                    overflow: "hidden",
                  }}
                >
                  {pictures[index] ? (
                    // Satori won't clip an image against the parent's radius, so the
                    // circle has to be cut on the image itself.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pictures[index]}
                      alt=""
                      width={photo}
                      height={photo}
                      style={{
                        width: photo,
                        height: photo,
                        borderRadius: 9999,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        fontSize: Math.round(circle * (item.glyph ? 0.34 : 0.44)),
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {item.glyph ?? item.label.charAt(0)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    width: 16,
                    height: 16,
                    borderRadius: 9999,
                    background: item.color,
                    marginTop: 20,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    fontSize: 32,
                    fontWeight: 700,
                    color: item.color,
                    marginTop: 12,
                  }}
                >
                  {item.label}
                </div>
                {item.era && (
                  <div style={{ display: "flex", fontSize: 22, color: "#64748b", marginTop: 4 }}>
                    {item.era}
                  </div>
                )}
              </div>
            ))}
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
