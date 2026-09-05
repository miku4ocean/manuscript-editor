'use client';

interface TabNavigationProps {
  activeTab: 'dictionary' | 'ai';
  onTabChange: (tab: 'dictionary' | 'ai') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="sticky top-0 z-10" style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 py-3">
          <div className="tab-group">
            <button
              onClick={() => onTabChange('dictionary')}
              className={`tab ${activeTab === 'dictionary' ? 'active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span>📚</span>
                字典工具
              </span>
            </button>
            <button
              onClick={() => onTabChange('ai')}
              className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span>🤖</span>
                AI 輔助編輯
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: 'var(--brand-100)',
                    color: 'var(--brand-600)'
                  }}>
                  PRO
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
