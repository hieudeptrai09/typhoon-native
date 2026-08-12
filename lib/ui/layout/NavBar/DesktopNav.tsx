import { BookText, CloudLightning } from "lucide-react";
import NavLink from "./NavLink";

interface DesktopNavProps {
  currentPath: string;
}

const DesktopNav = ({ currentPath }: DesktopNavProps) => {
  return (
    <div className="hidden space-x-4 md:flex" role="navigation" aria-label="Desktop navigation">
      <NavLink
        href="/storms/all/name/"
        icon={CloudLightning}
        label="Storms"
        isActive={currentPath.startsWith("/storms")}
      />
      <NavLink
        href="/names/current/"
        icon={BookText}
        label="Names"
        isActive={currentPath.startsWith("/names")}
      />
    </div>
  );
};

export default DesktopNav;
