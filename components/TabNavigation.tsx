'use client';

interface TabNavigationProps {
  activeTab: 'dictionary' | 'ai';
  onTabChange: (tab: 'dictionary' | 'ai') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <div className="max-w-[1400px] mx-auto px-12">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => onTabChange('dictionary')}
            className="px-6 py-4 text-[13px] font-medium transition-all relative"
            style={{
              color: activeTab === 'dictionary' ? '#2d3748' : '#a0aec0',
              background: activeTab === 'dictionary' ? '#ffffff' : 'transparent'
            }}
          >
            字典工具
            {activeTab === 'dictionary' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#2d3748' }} />
            )}
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className="px-6 py-4 text-[13px] font-medium transition-all relative"
            style={{
              color: activeTab === 'ai' ? '#2d3748' : '#a0aec0',
              background: activeTab === 'ai' ? '#ffffff' : 'transparent'
            }}
          >
            AI 輔助編輯
            {activeTab === 'ai' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#2d3748' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
