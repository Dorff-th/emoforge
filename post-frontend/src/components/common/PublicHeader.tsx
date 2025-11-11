import { SERVICE_URLS } from "@/config/constants";
import { useAppDispatch } from "@/store/hooks";
import { addToast } from "@/store/slices/toastSlice";

export default function PublicHeader() {

  //다른 서비스에서 로그아웃 후 리다이렉트 되었을 때 토스트 메시지 표시
  const dispatch = useAppDispatch();
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") === "logout_success") {
    dispatch(addToast({ type: "info", text: "로그아웃 되었습니다."}));
  }

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <a href={SERVICE_URLS.AUTH} className="text-xl font-bold text-blue-600">
          EmoForge
        </a>

        {/* Navigation */}
        <nav className="flex gap-6">
          <a
            href={`${SERVICE_URLS.POST}`}
            className="text-gray-700 hover:text-blue-600"
          >
            게시글
          </a>
          
          <a href={`${SERVICE_URLS.AUTH}/login`} className="text-xl font-bold text-blue-600">로그인</a>
          
        </nav>
      </div>
    </header>
  );
}
