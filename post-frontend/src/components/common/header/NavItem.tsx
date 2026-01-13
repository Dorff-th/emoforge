import { NavLink as RouterNavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  return (
    <RouterNavLink
      to={to}
      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
    >
      <Icon size={14} />
      {label}
    </RouterNavLink>
  );
};

export default NavItem;
