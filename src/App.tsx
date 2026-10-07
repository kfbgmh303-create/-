import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ConceptLab } from './components/ConceptLab';
import { CategoryQuiz } from './components/CategoryQuiz';
import { MockExam } from './components/MockExam';
import { InfinitePractice } from './components/InfinitePractice';
import { ReviewNotebook } from './components/ReviewNotebook';
import { QuizQuestion, UserAnswerRecord } from './types/statistics';
import { CURATED_QUESTIONS } from './data/quizDatabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lab');
  const [records, setRecords] = useState<UserAnswerRecord[]>(() => {
    try {
      const saved = localStorage.getItem('stat_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reviewQuestions, setReviewQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('stat_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('stat_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stat_records', JSON.stringify(records));
      localStorage.setItem('stat_reviews', JSON.stringify(reviewQuestions));
      localStorage.setItem('stat_bookmarks', JSON.stringify(Array.from(bookmarkedIds)));
    } catch (e) {
      console.error(e);
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
        // Also add to review list
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

  const handleResetProgress = () => {
    if (window.confirm('모든 학습 기록과 오답노트를 초기화하시겠습니까?')) {
      setRecords([]);
      setReviewQuestions([]);
      setBookmarkedIds(new Set());
      try {
        localStorage.removeItem('stat_records');
        localStorage.removeItem('stat_reviews');
        localStorage.removeItem('stat_bookmarks');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSelectQuestionToSolve = (question: QuizQuestion) => {
    setActiveTab('categories');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Strict 3-zone Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reviewCount={reviewQuestions.length}
        onResetProgress={handleResetProgress}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'lab' && <ConceptLab />}

        {activeTab === 'categories' && (
          <CategoryQuiz
            onRecordAnswer={handleRecordAnswer}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
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
  );
}
