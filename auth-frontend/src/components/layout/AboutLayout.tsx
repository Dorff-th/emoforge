import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import PublicHeader from "@/components/common/PublicHeader";
import Header from "@/components/common/Header";

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
