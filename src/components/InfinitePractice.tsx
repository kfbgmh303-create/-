import React, { useState } from 'react';
import { QuizQuestion, UserAnswerRecord } from '../types/statistics';
import { generateRandomPracticeQuestion } from '../utils/statisticsCalculator';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  BookOpen, 
  Flame,
  Lightbulb
} from 'lucide-react';

interface InfinitePracticeProps {
  onRecordAnswer: (record: UserAnswerRecord, question: QuizQuestion) => void;
}

export const InfinitePractice: React.FC<InfinitePracticeProps> = ({ onRecordAnswer }) => {
  const [difficulty, setDifficulty] = useState<'기초' | '기본' | '발전'>('기본');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>(() => 
    generateRandomPracticeQuestion('기본')
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [totalSolved, setTotalSolved] = useState<number>(0);
  const [correctTotal, setCorrectTotal] = useState<number>(0);

  const handleNextQuestion = () => {
    setCurrentQuestion(generateRandomPracticeQuestion(difficulty));
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleSelectDifficulty = (diff: '기초' | '기본' | '발전') => {
    setDifficulty(diff);
    setCurrentQuestion(generateRandomPracticeQuestion(diff));
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption.trim() === String(currentQuestion.correctAnswer).trim();
    
    setTotalSolved(prev => prev + 1);
    if (isCorrect) {
      setStreak(prev => prev + 1);
      setCorrectTotal(prev => prev + 1);
    } else {
      setStreak(0);
    }

    onRecordAnswer(
      {
        questionId: currentQuestion.id,
        userAnswer: selectedOption,
        isCorrect,
        timestamp: Date.now(),
      },
      currentQuestion
    );
  };

  const isCorrect = isSubmitted && selectedOption?.trim() === String(currentQuestion.correctAnswer).trim();

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            무한 랜덤 문제 생성기
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            수치와 조건을 무작위로 생성하여 대푯값 계산과 개념을 한계 없이 연습합니다.
          </p>
        </div>

        {/* Stats & Difficulty */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>연속 정답:</span>
            <span className="font-bold tabular-nums">{streak}연승</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['기초', '기본', '발전'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => handleSelectDifficulty(diff)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  difficulty === diff
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sky-800">{currentQuestion.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>난이도: {currentQuestion.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>주제: {currentQuestion.conceptTag}</span>
          </div>

          <div className="tabular-nums">
            누적 정답률: {totalSolved > 0 ? Math.round((correctTotal / totalSolved) * 100) : 0}% ({correctTotal}/{totalSolved})
          </div>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
            {currentQuestion.title}
          </h3>
          <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
            {currentQuestion.prompt}
          </div>
        </div>

        {/* Options */}
        {currentQuestion.options && (
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

              if (isSubmitted) {
                if (opt === currentQuestion.correctAnswer) {
                  optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-200';
                } else if (isSelected && opt !== currentQuestion.correctAnswer) {
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
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between text-xs sm:text-sm cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono bg-slate-100 text-slate-700">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && opt === currentQuestion.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && opt !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleNextQuestion}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            다른 무작위 문제 뽑기
          </button>

          <div>
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                정답 확인하기
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      정답! {streak}연승 달성!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      오답! 다시 도전해보세요.
                    </>
                  )}
                </span>
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  다음 생성 문제 &gt;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Explanation Card */}
        {isSubmitted && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <BookOpen className="w-4 h-4 text-sky-700" />
              <span>동적 생성 문제 단계별 해설</span>
            </div>

            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-950 text-xs sm:text-sm">
              <span className="font-semibold block mb-0.5">정답 요약:</span>
              {currentQuestion.explanation.summary}
            </div>

            <div className="space-y-3">
              {currentQuestion.explanation.steps.map((step, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs sm:text-sm">
                  <span className="font-semibold text-slate-900 block mb-1">
                    {step.title}
                  </span>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs sm:text-sm text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">핵심 팁</span>
                <p className="text-amber-800 leading-relaxed">
                  {currentQuestion.explanation.conceptTip}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
