"use client";

import { App, ConfigProvider } from "antd";
import type { ReactNode } from "react";

const BRAND = {
  primary: "#0369a1", // sky-700 — the brand color for resting states
  primaryDark: "#075985", // sky-800 — hover / highlight (extreme states) only
  headerHover: "#155e75", // cyan-800 — table header hover;
  text: "#374151", // gray-700 (matches --foreground)
  textDisabled: "#9ca3af", // gray-400 (matches --text-disabled)
  segmentedTrack: "#d1d5db", // gray-300
} as const;

const AntdProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "var(--font-open-sans)",
          colorPrimary: BRAND.primary,
          colorLink: BRAND.primary,
          colorText: BRAND.text,
          colorTextDisabled: BRAND.textDisabled,
        },
        components: {
          Table: {
            headerBg: BRAND.primary,
            headerColor: "#ffffff",
            headerSortActiveBg: BRAND.primaryDark,
            headerSortHoverBg: BRAND.headerHover,
            fixedHeaderSortActiveBg: BRAND.headerHover,
          },
          Segmented: {
            trackBg: BRAND.segmentedTrack,
          },
        },
      }}
    >
      <App component={false}>{children}</App>
    </ConfigProvider>
  );
};

export default AntdProvider;
