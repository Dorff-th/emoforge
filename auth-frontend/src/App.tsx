import AppRouter from './router/AppRouter';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ToastContainer from "@/components/common/ToastContainer";

function App() {
  return (
    <>
      <AppRouter />
        <LoadingOverlay />
      <ToastContainer /> {/* ✅ 전역 UI는 여기서 */}
    </>
  );
}

export default App
