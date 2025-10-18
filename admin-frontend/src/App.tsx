import { useState } from "react";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col items-center justify-center transition-colors bg-gray-100 dark:bg-gray-900">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          TailwindCSS Setup Test 🎨
        </h1>

        {/* Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Primary Button
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Success Button
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Danger Button
          </button>
        </div>

        {/* Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md w-80 text-center">
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            TailwindCSS is working perfectly! 🚀
          </p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-2 rounded-md border border-gray-400 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Toggle {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>
    </div>
  );
}
