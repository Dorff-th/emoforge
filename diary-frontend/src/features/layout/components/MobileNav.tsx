import { Link } from "react-router-dom";
import { X } from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  menuItems: {
    path: string;
    label: string;
    icon: React.ElementType;
    external?: boolean;
  }[];
}

const MobileNav = ({ open, onClose, menuItems }: MobileNavProps) => {
  if (!open) return null;

  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 sm:hidden"
        onClick={onClose}
      />

      {/* drawer */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 z-50 sm:hidden shadow-lg">
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <span className="font-semibold text-blue-600">EmoForge</span>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-2">
          {menuItems
            .filter((item) => !item.external)
            .map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
        </nav>
      </aside>
    </>
  );
};

export default MobileNav;
