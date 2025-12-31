'use client';

interface TabNavigationProps {
  activeTab: 'dictionary' | 'ai';
  onTabChange: (tab: 'dictionary' | 'ai') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-[73px] sm:top-[85px] z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => onTabChange('dictionary')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 border-b-2 flex items-center gap-2 rounded-t-xl ${
              activeTab === 'dictionary'
                ? 'border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50/50 to-transparent shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">字典工具</span>
            <span className="sm:hidden">字典</span>
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 border-b-2 flex items-center gap-2 rounded-t-xl ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50/50 to-transparent shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden sm:inline">AI 輔助編輯</span>
            <span className="sm:hidden">AI 編輯</span>
          </button>
        </div>
      </div>
    </div>
  );
}
