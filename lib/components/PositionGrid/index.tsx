"use client";

import type { ReactNode } from "react";
import CountryFlag, { COUNTRY_NAMES } from "../CountryFlag";
import ScrollEndFade from "../ScrollEndFade";

const ROWS = 10;
const COLS = 14;

interface PositionGridProps {
  renderCell: (position: number, row: number, col: number) => ReactNode;
  positionOffset?: number;
  showHeader?: boolean;
}

const PositionGrid = ({ renderCell, positionOffset = 1, showHeader = true }: PositionGridProps) => {
  const columnWidth = `${100 / COLS}%`;

  return (
    <div>
      <p className="mb-2 text-xs text-foreground hidden">Swipe right to see full table →</p>
      <ScrollEndFade>
        <div className="overflow-x-auto" data-scroll-container>
          <table
            className="min-w-full border-collapse"
            aria-label="Typhoon name positions by country"
          >
            <colgroup>
              {[...Array(COLS)].map((_, idx) => (
                <col key={idx} style={{ width: columnWidth }} />
              ))}
            </colgroup>
            {showHeader && (
              <thead>
                <tr>
                  {COUNTRY_NAMES.map((countryName, index) => (
                    <th
                      key={index}
                      className="border border-sky-300 bg-sky-700 p-2"
                      title={countryName}
                    >
                      <div className="flex items-center justify-center">
                        <CountryFlag country={countryName} className="h-7 w-10 border-white/30" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {[...Array(ROWS)].map((_, row) => (
                <tr key={row}>
                  {[...Array(COLS)].map((_, col) => {
                    const position = row * COLS + col + positionOffset;
                    return renderCell(position, row, col);
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollEndFade>
    </div>
  );
};

export default PositionGrid;
