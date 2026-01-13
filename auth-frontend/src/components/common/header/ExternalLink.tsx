import type { LucideIcon } from "lucide-react";

interface ExternalLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const ExternalLink = ({ href, icon: Icon, label }: ExternalLinkProps) => {
  return (
    <a
      href={href}
      className="
        flex items-center gap-1.5
        px-3 py-2
        rounded-md border border-gray-200
        text-sm text-gray-600
        transition-all
        hover:-translate-y-0.5
        hover:border-gray-300
        hover:bg-white
        hover:shadow-sm
      "
    >
      <Icon size={16} className="text-gray-400" />
      {label}
    </a>
  );
};

export default ExternalLink;
