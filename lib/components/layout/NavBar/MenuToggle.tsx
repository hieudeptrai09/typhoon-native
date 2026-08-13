import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "antd";

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
      icon={<Ionicons name={isOpen ? "close" : "menu"} size={24} color="#ffffff" />}
      className="z-50! text-white! hover:bg-white/20! md:hidden!"
    />
  );
};

export default MenuToggle;
