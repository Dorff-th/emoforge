import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import PublicHeader from "@/components/common/header/PublicHeader";
import Header from "@/components/common/header/Header";

const AboutLayout = () => {
  const { status } = useAppSelector((state) => state.auth);

  return (
    <>
      {status === "authenticated" ? <Header /> : <PublicHeader />}
      <Outlet />
    </>
  );
};

export default AboutLayout;
