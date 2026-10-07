import React, { useState } from 'react';
import { QuizQuestion, UserAnswerRecord } from '../types/statistics';
import { 
  BookMarked, 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  BarChart3, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface ReviewNotebookProps {
  records: UserAnswerRecord[];
  reviewQuestions: QuizQuestion[];
  onRemoveFromReview: (questionId: string) => void;
  onClearAllReview: () => void;
  onSelectQuestionToSolve: (question: QuizQuestion) => void;
}

export const ReviewNotebook: React.FC<ReviewNotebookProps> = ({
  records,
  reviewQuestions,
  onRemoveFromReview,
  onClearAllReview,
  onSelectQuestionToSolve,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // Stats computation
  const totalAttempts = records.length;
  const correctAttempts = records.filter(r => r.isCorrect).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Filter questions by tag
  const filtered = reviewQuestions.filter(q => 
    selectedTag === 'ALL' ? true : q.conceptTag === selectedTag
  );

  return (
    <div className="space-y-6">
      {/* Top Learning Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-700" />
          나의 대푯값 학습 성취도 분석
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          지금까지 풀이한 퀴즈 기록을 바탕으로 취약 개념을 진단합니다.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">총 풀이 문항</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalAttempts}개</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">누적 정답률</span>
            <span className="text-xl font-bold font-mono text-sky-700">{overallAccuracy}%</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">복습할 오답</span>
            <span className="text-xl font-bold font-mono text-rose-600">{reviewQuestions.length}개</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">학습 상태</span>
            <span className="text-sm font-bold text-emerald-700 block mt-1">
              {reviewQuestions.length === 0 ? '완벽 마스터!' : '복습 필요'}
            </span>
          </div>
        </div>
      </div>

      {/* Review List Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-rose-600" />
              오답 복습 보관함 ({reviewQuestions.length}문항)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              틀렸거나 보관한 문제들을 완벽히 이해할 때까지 다시 풀어보세요.
            </p>
          </div>

          {reviewQuestions.length > 0 && (
            <button
              onClick={onClearAllReview}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              보관함 비우기
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {['ALL', '평균', '중앙값', '최빈값', '대푯값 선택', '이상치'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              {tag === 'ALL' ? '전체' : tag}
            </button>
          ))}
        </div>

        {/* Question cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-800">복습할 오답 문제가 없습니다!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              퀴즈에서 틀린 문제나 중요한 문제가 생기면 자동으로 여기에 등록됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-sky-800">{q.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>개념: {q.conceptTag}</span>
                    <span aria-hidden="true">·</span>
                    <span>난이도 {q.difficulty}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{q.prompt}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectQuestionToSolve(q)}
                    className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    다시 풀기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveFromReview(q.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title="이해 완료 (목록에서 제거)"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
