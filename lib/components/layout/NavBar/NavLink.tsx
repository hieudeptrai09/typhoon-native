import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "antd";
import Link from "next/link";

interface NavLinkProps {
  href: string;
  icon: IconName;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink = ({ href, icon, label, isActive, onClick }: NavLinkProps) => {
  return (
    <Link href={href} onClick={onClick}>
      <Button
        type="text"
        icon={<Ionicons name={icon} size={20} color="#ffffff" />}
        className={`text-white! hover:bg-white/30! hover:text-white! ${isActive ? "font-bold!" : ""}`}
      >
        {label}
      </Button>
    </Link>
  );
};

export default NavLink;
