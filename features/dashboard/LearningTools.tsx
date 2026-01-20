'use client';

interface Tool {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function LearningTools() {
  const tools: Tool[] = [
    {
      name: 'Review Words',
      description: '25 words due for review',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      name: 'Grammar Guide',
      description: '',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Speak Up',
      description: 'Practice pronunciation',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Listening',
      description: 'Short stories for B1',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">Learning Tools</h3>
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="bg-gray-800 rounded-xl p-5 cursor-pointer hover:bg-gray-700 transition"
          >
            <div className={`${tool.bgColor} ${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              {tool.icon}
            </div>
            <h4 className="font-semibold text-white mb-1">{tool.name}</h4>
            {tool.description && (
              <p className="text-sm text-gray-400">{tool.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

