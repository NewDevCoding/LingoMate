'use client';

export default function CurrentLesson() {
  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
              CURRENT LESSON
            </span>
            <span className="text-gray-400 text-sm">Spanish Foundations 2</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Unit 4: Ordering Food</h2>
          <p className="text-gray-400 mb-4">
            Learn to order your favorite dishes and ask for the bill politely.
          </p>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm font-medium text-white">70%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
          
          <button className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Continue Lesson
          </button>
        </div>
        
        {/* Lesson Image */}
        <div className="ml-6 hidden md:block">
          <div className="w-48 h-48 rounded-lg bg-gray-700 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

