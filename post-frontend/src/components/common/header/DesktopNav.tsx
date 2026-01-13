import { useState } from "react";
import {
  FileText,
  BookOpen,
  Layers,
  Info,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { SERVICE_URLS } from "@/config/constants";
import NavItem from "./NavItem";
import ExternalLink from "./ExternalLink";

interface DesktopNavProps {
  isAuthenticated: boolean;
}

const DesktopNav = ({ isAuthenticated }: DesktopNavProps) => {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <nav className="hidden md:flex items-center gap-3 text-sm text-gray-600">
      <div
        className="relative"
        onMouseEnter={() => setAboutOpen(true)}
        onMouseLeave={() => setAboutOpen(false)}
      >
        <a
          href={`${SERVICE_URLS.AUTH}/about/emoforge`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-200  hover:bg-gray-100"
        >
          <Layers size={16} />
          About
          <ChevronDown size={14} />
        </a>

        {aboutOpen && (
          <>
            <div className="absolute left-0 top-full -mt-1 h-3 w-full" />
            <div className="absolute left-0 top-full w-48 rounded-md border bg-white shadow-lg z-20">
              <NavItem
                to={`${SERVICE_URLS.AUTH}/about/emoforge`}
                icon={Layers}
                label="Emoforge"
              />
              <NavItem
                to={`${SERVICE_URLS.AUTH}/about/intro`}
                icon={Info}
                label="Intro"
              />
              <NavItem
                to={`${SERVICE_URLS.AUTH}/about/analysis`}
                icon={TrendingUp}
                label="Analysis"
              />
            </div>
          </>
        )}
      </div>

      <ExternalLink href="/" icon={FileText} label="Posts" />
      {/* Diary – 로그인 상태에서만 */}
      {isAuthenticated && (
        <ExternalLink
          href={`${SERVICE_URLS.DIARY}/user/home`}
          icon={BookOpen}
          label="Diary"
        />
      )}
    </nav>
  );
};

export default DesktopNav;
