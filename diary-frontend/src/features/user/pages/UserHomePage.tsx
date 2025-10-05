import Header from '@/features/layout/components/Header';
import { useTheme } from '@/features/system/context/ThemeContext';
import SummaryPage from '@/features/summary/pages/SummaryPage';
import clsx from 'clsx';

const UserHomePage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={clsx(
        'min-h-screen transition-colors duration-500 bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800',
        isDarkMode
          ? 'bg-gradient-to-b from-gray-900 to-gray-800'
          : 'bg-gradient-to-b from-blue-100 to-white'
      )}
    >
      <Header />

       <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white text-black rounded-lg shadow-lg p-8">
      <SummaryPage />
      </div>
    </main>
    </div>
  );
};

export default UserHomePage;
