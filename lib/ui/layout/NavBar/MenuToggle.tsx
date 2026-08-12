import { Button } from "antd";
import { Menu, X } from "lucide-react";

interface MenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MenuToggle = ({ isOpen, onToggle }: MenuToggleProps) => {
  return (
    <Button
      type="text"
      onClick={onToggle}
      aria-label="Toggle menu"
      icon={isOpen ? <X size={24} /> : <Menu size={24} />}
      className="z-50! text-white! hover:bg-white/20! md:hidden!"
    />
  );
};

export default MenuToggle;
