import React from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

export type ActiveTab = 'lab' | 'categories' | 'mock' | 'infinite' | 'review';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  reviewCount: number;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  reviewCount,
  onResetProgress,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('lab')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
            대푯값 마스터
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs text-slate-600 font-normal">
            중1 수학 통계 탐구
          </span>
        </button>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onTabChange('lab')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'lab'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            개념 실험실
          </button>

          <button
            onClick={() => onTabChange('categories')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            유형별 퀴즈
          </button>

          <button
            onClick={() => onTabChange('mock')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'mock'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            실전 모의평가
          </button>

          <button
            onClick={() => onTabChange('infinite')}
            className={`px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'infinite'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            무한 랜덤연습
          </button>

          <button
            onClick={() => onTabChange('review')}
            className={`relative px-2.5 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'review'
                ? 'text-sky-700 font-semibold border-b-2 border-sky-600'
                : 'hover:text-slate-900'
            }`}
          >
            오답노트
            {reviewCount > 0 && (
              <span className="ml-1.5 text-xs text-rose-600 font-semibold tabular-nums">
                ({reviewCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetProgress}
            title="기록 초기화"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
