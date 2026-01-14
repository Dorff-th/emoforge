import { Link } from "react-router-dom";

interface DesktopNavProps {
  menuItems: {
    path: string;
    label: string;
    icon: React.ElementType;
    external?: boolean;
  }[];
}

const DesktopNav = ({ menuItems }: DesktopNavProps) => {
  return (
    <nav className="diary-header__nav hidden sm:flex">
      {menuItems
        .filter((item) => !item.external)
        .map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className="nav-item">
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        ))}
    </nav>
  );
};

export default DesktopNav;
