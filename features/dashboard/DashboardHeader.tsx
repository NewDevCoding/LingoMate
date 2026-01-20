'use client';

export default function DashboardHeader() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-gray-900 border-b border-gray-800">
      {/* Logo */}
      <div className="text-2xl font-bold text-primary">LingoMate</div>

      {/* Welcome Message */}
      <div className="flex-1 flex flex-col items-center">
        <div className="text-lg font-medium">
          Welcome back, Alex! 👋
        </div>
        <div className="text-sm text-gray-400">
          You're on a 12-day streak! Keep it up.
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition">
          <span className="text-xl">🇪🇸</span>
          <span className="text-sm font-medium">ES</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Points */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="text-sm font-medium">450</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span className="text-sm font-medium">12</span>
        </div>

        {/* Profile Picture */}
        <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600"></div>
      </div>
    </header>
  );
}

