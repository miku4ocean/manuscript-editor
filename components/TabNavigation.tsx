'use client';

interface TabNavigationProps {
  activeTab: 'dictionary' | 'ai';
  onTabChange: (tab: 'dictionary' | 'ai') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b-2 border-gray-300 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-4">
          <button
            onClick={() => onTabChange('dictionary')}
            className={`px-6 py-3 font-medium transition-colors border-b-4 ${
              activeTab === 'dictionary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 字典工具
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`px-6 py-3 font-medium transition-colors border-b-4 ${
              activeTab === 'ai'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🤖 AI 輔助編輯
          </button>
        </div>
      </div>
    </div>
  );
}
