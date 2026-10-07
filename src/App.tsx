import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ConceptLab } from './components/ConceptLab';
import { CategoryQuiz } from './components/CategoryQuiz';
import { MockExam } from './components/MockExam';
import { InfinitePractice } from './components/InfinitePractice';
import { ReviewNotebook } from './components/ReviewNotebook';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QuizQuestion, UserAnswerRecord } from './types/statistics';
import { CURATED_QUESTIONS } from './data/quizDatabase';
import { safeStorage } from './utils/safeStorage';
import { AlertCircle, X, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lab');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [targetQuestionId, setTargetQuestionId] = useState<string | null>(null);

  const [records, setRecords] = useState<UserAnswerRecord[]>(() => {
    try {
      const saved = safeStorage.getItem('stat_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviewQuestions, setReviewQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = safeStorage.getItem('stat_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = safeStorage.getItem('stat_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save to safeStorage
  useEffect(() => {
    try {
      safeStorage.setItem('stat_records', JSON.stringify(records));
      safeStorage.setItem('stat_reviews', JSON.stringify(reviewQuestions));
      safeStorage.setItem('stat_bookmarks', JSON.stringify(Array.from(bookmarkedIds)));
    } catch {
      // safeStorage handles errors internally
    }
  }, [records, reviewQuestions, bookmarkedIds]);

  const handleRecordAnswer = (record: UserAnswerRecord, question: QuizQuestion) => {
    setRecords(prev => [record, ...prev]);

    if (!record.isCorrect) {
      setReviewQuestions(prev => {
        if (prev.some(q => q.id === question.id)) return prev;
        return [question, ...prev];
      });
    }
  };

  const handleToggleBookmark = (questionId: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
        const q = CURATED_QUESTIONS.find(item => item.id === questionId);
        if (q && !reviewQuestions.some(item => item.id === questionId)) {
          setReviewQuestions(r => [q, ...r]);
        }
      }
      return next;
    });
  };

  const handleRemoveFromReview = (questionId: string) => {
    setReviewQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleClearAllReview = () => {
    setReviewQuestions([]);
  };

  const handleConfirmReset = () => {
    setRecords([]);
    setReviewQuestions([]);
    setBookmarkedIds(new Set());
    safeStorage.removeItem('stat_records');
    safeStorage.removeItem('stat_reviews');
    safeStorage.removeItem('stat_bookmarks');
    setShowResetConfirm(false);
  };

  const handleSelectQuestionToSolve = (question: QuizQuestion) => {
    setTargetQuestionId(question.id);
    setActiveTab('categories');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
        {/* Strict 3-zone Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reviewCount={reviewQuestions.length}
          onResetProgress={() => setShowResetConfirm(true)}
        />

        {/* In-app Reset Confirmation Modal (Replaces window.confirm) */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">학습 기록 초기화</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                지금까지 푼 모든 문제 풀이 기록과 오답노트가 초기화됩니다. 계속 진행하시겠습니까?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                >
                  기록 초기화
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'lab' && <ConceptLab />}

          {activeTab === 'categories' && (
            <CategoryQuiz
              onRecordAnswer={handleRecordAnswer}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              targetQuestionId={targetQuestionId}
              onClearTargetQuestion={() => setTargetQuestionId(null)}
            />
          )}

          {activeTab === 'mock' && (
            <MockExam
              onRecordAnswer={handleRecordAnswer}
              onGoToReview={() => setActiveTab('review')}
            />
          )}

          {activeTab === 'infinite' && (
            <InfinitePractice onRecordAnswer={handleRecordAnswer} />
          )}

          {activeTab === 'review' && (
            <ReviewNotebook
              records={records}
              reviewQuestions={reviewQuestions}
              onRemoveFromReview={handleRemoveFromReview}
              onClearAllReview={handleClearAllReview}
              onSelectQuestionToSolve={handleSelectQuestionToSolve}
            />
          )}
        </main>

        {/* Clean quiet footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span>대푯값 마스터</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span>중학교 1학년 수학 교육과정 (평균 · 중앙값 · 최빈값)</span>
            </div>
            <div>
              <span>스마트 통계 학습 도구</span>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
