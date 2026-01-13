import type { ReactNode } from "react";

interface MobileExternalLinkProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}

const MobileExternalLink = ({
  href,
  children,
  onClick,
}: MobileExternalLinkProps) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className="
        block
        px-3 py-2
        text-sm text-gray-700
        rounded-md
        hover:bg-gray-100
      "
    >
      {children}
    </a>
  );
};

export default MobileExternalLink;
