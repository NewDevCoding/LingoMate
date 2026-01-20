'use client';

export default function StatsPanel() {
  const timeData = [
    { day: 'Mon', minutes: 15 },
    { day: 'Tue', minutes: 20 },
    { day: 'Wed', minutes: 25 },
    { day: 'Thu', minutes: 45 },
    { day: 'Fri', minutes: 30 },
    { day: 'Sat', minutes: 20 },
    { day: 'Sun', minutes: 10 },
  ];

  const maxMinutes = Math.max(...timeData.map(d => d.minutes));

  return (
    <div className="w-80 bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">Your Stats</h3>
      
      {/* Time Spent Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white">Time Spent</h4>
          <select className="bg-gray-700 text-white text-sm px-3 py-1 rounded-lg border border-gray-600">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
        
        <div className="flex items-end justify-between gap-2 h-40">
          {timeData.map((data, index) => (
            <div key={data.day} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t ${
                    index === 3 ? 'bg-blue-500' : 'bg-gray-700'
                  } transition-all hover:opacity-80`}
                  style={{
                    height: `${(data.minutes / maxMinutes) * 100}%`,
                    minHeight: '8px',
                  }}
                  title={`${data.minutes} minutes`}
                ></div>
              </div>
              <span className="text-xs text-gray-400 mt-2">{data.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

