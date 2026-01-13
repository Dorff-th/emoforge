import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface MobileLinkProps {
  to: string;
  children: ReactNode;
  onClick?: () => void;
}

const MobileLink = ({ to, children, onClick }: MobileLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="
         flex items-center gap-2     // ⭐ 핵심
        px-3 py-2
        text-sm text-gray-700
        rounded-md
        hover:bg-gray-100
      "
    >
      {children}
    </Link>
  );
};

export default MobileLink;
