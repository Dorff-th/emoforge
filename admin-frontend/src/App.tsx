import AppRouter from './router/AppRouter';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { ToastProvider } from '@/providers/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <AppRouter />
      <LoadingOverlay />
    </ToastProvider>
  );
}

export default App
