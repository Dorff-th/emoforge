import { useState } from "react";
import { Layers, ChevronDown, X, Menu, Info, TrendingUp } from "lucide-react";
import { SERVICE_URLS } from "@/config/constants";
import MobileLink from "./MobileLink";
import MobileExternalLink from "./MobileExternalLink";

interface MobileNavProps {
  isAuthenticated: boolean;
  open: boolean;
  onClose: () => void;
}

const MobileNav = ({ isAuthenticated, open, onClose }: MobileNavProps) => {
  const [aboutOpen, setAboutOpen] = useState(false);

  if (!open) return null;

  return (
    <div className="md:hidden border-t bg-white shadow-md">
      <nav className="flex flex-col px-4 py-3 text-sm space-y-2">
        <button
          onClick={() => setAboutOpen((v) => !v)}
          className="flex items-center justify-between px-3 py-2 rounded-md  bg-gray-50 text-gray-600 hover:bg-gray-100"
        >
          <span className="flex items-center gap-2">
            <Layers size={16} />
            About
          </span>
          <ChevronDown
            size={14}
            className={`transition ${aboutOpen ? "rotate-180" : ""}`}
          />
        </button>

        {aboutOpen && (
          <div className="ml-6 border-l pl-3 text-gray-600">
            <MobileLink to="/about/emoforge" onClick={onClose}>
              <Layers size={13} />
              Emoforge
            </MobileLink>
            <MobileLink to="/about/intro" onClick={onClose}>
              <Info size={13} />
              Intro
            </MobileLink>
            <MobileLink to="/about/analysis" onClick={onClose}>
              <TrendingUp size={13} />
              Analysis
            </MobileLink>
          </div>
        )}

        <MobileExternalLink href={SERVICE_URLS.POST} onClick={onClose}>
          Posts
        </MobileExternalLink>
        {isAuthenticated && (
          <MobileExternalLink
            href={`${SERVICE_URLS.DIARY}/user/home`}
            onClick={onClose}
          >
            Diary
          </MobileExternalLink>
        )}
      </nav>
    </div>
  );
};

export default MobileNav;

MobileNav.Toggle = ({ open, onToggle }: any) => (
  <button
    className="md:hidden p-2 rounded-md hover:bg-gray-100"
    onClick={onToggle}
  >
    {open ? (
      <X size={20} className="text-gray-800" />
    ) : (
      <Menu size={20} className="text-gray-800" />
    )}
  </button>
);
