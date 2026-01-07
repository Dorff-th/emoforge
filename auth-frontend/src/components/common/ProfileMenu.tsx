// src/components/common/ProfileMenu.tsx
import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import Avatar from "@/components/common/Avatar";

interface ProfileMenuProps {
  user: {
    nickname?: string;
    profileImageUrl?: string | null;
  } | null;
  onLogout: () => void;
}

export default function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={user?.nickname}
      >
        <Avatar src={user?.profileImageUrl} alt={user?.nickname} size={32} />
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-white" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-md text-sm text-gray-700">
          <MenuItem icon={<User size={14} />} label="Profile" />
          <MenuItem icon={<Settings size={14} />} label="Settings" />

          <div className="my-1 border-t" />

          <MenuItem
            icon={<LogOut size={14} />}
            label="Sign out"
            danger
            onClick={onLogout}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex w-full items-center gap-2 px-3 py-2
        hover:bg-gray-100 transition
        ${danger ? "text-red-600 hover:bg-red-50" : ""}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
