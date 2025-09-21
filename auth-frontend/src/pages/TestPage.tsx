import type { MouseEvent } from 'react';

export default function TestPage() {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log('Button clicked!');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50">
      <h1 className="text-3xl font-semibold text-slate-900">Auth-Service Test Page</h1>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-lg bg-indigo-600 px-6 py-2 text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Click Me
      </button>
    </div>
  );
}

