"use client";

import { Button, ConfigProvider } from "antd";
import Link from "next/link";

interface MenuProps {
  href: string;
  label: string;
  bgColor: string;
  hoverBgColor: string;
}

const Menu = ({ href, label, bgColor, hoverBgColor }: MenuProps) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: bgColor,
          colorPrimaryHover: hoverBgColor,
          colorPrimaryActive: hoverBgColor,
        },
        components: {
          Button: {
            primaryShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          },
        },
      }}
    >
      <Link href={href} className="block">
        <Button
          block
          type="primary"
          size="large"
          shape="round"
          className="h-12! text-xl! font-bold!"
        >
          {label}
        </Button>
      </Link>
    </ConfigProvider>
  );
};

export default Menu;
