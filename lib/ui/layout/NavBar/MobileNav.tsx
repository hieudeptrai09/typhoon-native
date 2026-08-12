import { BookText, CloudLightning } from "lucide-react";
import NavLink from "./NavLink";

interface MobileNavProps {
  currentPath: string;
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav = ({ currentPath, isOpen, onClose }: MobileNavProps) => {
  return (
    <div
      role="navigation"
      aria-label="Mobile navigation"
      className={`absolute top-full right-0 left-0 z-40 overflow-hidden bg-blue-600 shadow-lg transition-all duration-300 ease-in-out md:hidden ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="space-y-2 px-4 py-2">
        <NavLink
          href="/storms/all/name/"
          icon={CloudLightning}
          label="Storms"
          isActive={currentPath.startsWith("/storms")}
          onClick={onClose}
        />
        <NavLink
          href="/names/current/"
          icon={BookText}
          label="Names"
          isActive={currentPath.startsWith("/names")}
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default MobileNav;
