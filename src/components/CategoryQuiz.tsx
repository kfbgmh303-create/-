import React, { useState } from 'react';
import { QuizQuestion, QuizCategory, UserAnswerRecord } from '../types/statistics';
import { CURATED_QUESTIONS } from '../data/quizDatabase';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  BookOpen, 
  Lightbulb, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface CategoryQuizProps {
  onRecordAnswer: (record: UserAnswerRecord, question: QuizQuestion) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (questionId: string) => void;
}

export const CategoryQuiz: React.FC<CategoryQuizProps> = ({
  onRecordAnswer,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | 'ALL'>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const filteredQuestions = CURATED_QUESTIONS.filter(q => 
    selectedCategory === 'ALL' ? true : q.category === selectedCategory
  );

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];
  const isBookmarked = bookmarkedIds.has(currentQ?.id);

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isSubmitted) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption.trim() === String(currentQ.correctAnswer).trim();
    onRecordAnswer(
      {
        questionId: currentQ.id,
        userAnswer: selectedOption,
        isCorrect,
        timestamp: Date.now(),
      },
      currentQ
    );
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const handleCategoryChange = (cat: QuizCategory | 'ALL') => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const isCorrect = isSubmitted && selectedOption?.trim() === String(currentQ?.correctAnswer).trim();

  return (
    <div className="space-y-6">
      {/* Category Segmented Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => handleCategoryChange('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            전체 보기 ({CURATED_QUESTIONS.length})
          </button>
          <button
            onClick={() => handleCategoryChange('CALCULATION')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'CALCULATION'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            기본 계산 마스터
          </button>
          <button
            onClick={() => handleCategoryChange('REPRESENTATIVE_CHOICE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'REPRESENTATIVE_CHOICE'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            상황별 대푯값 선택
          </button>
          <button
            onClick={() => handleCategoryChange('UNKNOWN_VARIABLE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'UNKNOWN_VARIABLE'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            미지수 x 추론
          </button>
          <button
            onClick={() => handleCategoryChange('DATA_REPRESENTATION')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedCategory === 'DATA_REPRESENTATION'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            도수표 & 점도표 해석
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Header Metadata Bar: No pill enclosures, clean typographic separators */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-sky-800">{currentQ.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>난이도 {currentQ.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>핵심: {currentQ.conceptTag}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{currentIndex + 1} / {filteredQuestions.length}번</span>
            </div>

            <button
              onClick={() => onToggleBookmark(currentQ.id)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                isBookmarked
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
              title="북마크"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              <span>{isBookmarked ? '보관됨' : '북마크'}</span>
            </button>
          </div>

          {/* Question Title & Prompt */}
          <div className="py-5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
              {currentQ.title}
            </h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
              {currentQ.prompt}
            </div>

            {/* Optional Table Data Display */}
            {currentQ.tableData && (
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-center">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      {currentQ.tableData.map((col, i) => (
                        <th key={i} className="py-2 px-3 font-semibold border-r border-slate-200 last:border-r-0">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="divide-x divide-slate-200 bg-white">
                      {currentQ.tableData.map((col, i) => (
                        <td key={i} className="py-2.5 px-3 font-mono font-medium text-slate-900">
                          {col.count}명
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Multiple-Choice Options */}
          {currentQ.options && (
            <div className="space-y-2.5 my-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

                if (isSubmitted) {
                  if (opt === currentQ.correctAnswer) {
                    optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-200';
                  } else if (isSelected && opt !== currentQ.correctAnswer) {
                    optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                  } else {
                    optionStyle = 'border-slate-200 opacity-60 bg-slate-50 text-slate-500';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-sky-600 bg-sky-50/60 text-sky-950 ring-2 ring-sky-200';
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between text-sm cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono bg-slate-100 text-slate-700">
                        {idx + 1}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSubmitted && opt === currentQ.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && opt !== currentQ.correctAnswer && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Bar (Submit / Next / Result) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                이전 문제
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
              >
                다음 문제
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  정답 확인하기
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        정답입니다! 참 잘했어요.
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        아쉬워요! 아래 해설을 확인하세요.
                      </>
                    )}
                  </span>
                  {currentIndex < filteredQuestions.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      다음 문제 풀기
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Deep Explanation Section (Revealed after submission) */}
          {isSubmitted && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-sky-700" />
                <span>단계별 상세 풀이 해설</span>
              </div>

              {/* Summary Banner */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-950 text-xs sm:text-sm">
                <span className="font-semibold block mb-0.5">정답 요약:</span>
                {currentQ.explanation.summary}
              </div>

              {/* Step By Step Breakdown */}
              <div className="space-y-3">
                {currentQ.explanation.steps.map((step, sIdx) => (
                  <div key={sIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs sm:text-sm">
                    <span className="font-semibold text-slate-900 block mb-1">
                      {step.title}
                    </span>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Key Concept Tip */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs sm:text-sm text-amber-900">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">중1 통계 필수 핵심 포인트</span>
                  <p className="text-amber-800 leading-relaxed">
                    {currentQ.explanation.conceptTip}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
