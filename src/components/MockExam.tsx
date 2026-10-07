import React, { useState, useEffect } from 'react';
import { QuizQuestion, UserAnswerRecord } from '../types/statistics';
import { CURATED_QUESTIONS } from '../data/quizDatabase';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

interface MockExamProps {
  onRecordAnswer: (record: UserAnswerRecord, question: QuizQuestion) => void;
  onGoToReview: () => void;
}

export const MockExam: React.FC<MockExamProps> = ({ onRecordAnswer, onGoToReview }) => {
  // Select 10 representative questions for the mock exam
  const [examQuestions] = useState<QuizQuestion[]>(() => {
    const list = [...CURATED_QUESTIONS];
    // Take balanced sample of 10
    return list.slice(0, 10);
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Timer
  useEffect(() => {
    if (!isTimerRunning || isCompleted) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  const currentQ = examQuestions[currentIndex];

  const handleSelectAnswer = (option: string) => {
    if (isCompleted) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleFinishExam = () => {
    setIsCompleted(true);
    setIsTimerRunning(false);

    // Record all answers
    examQuestions.forEach(q => {
      const userAns = answers[q.id];
      const isCorrect = userAns ? userAns.trim() === String(q.correctAnswer).trim() : false;
      onRecordAnswer(
        {
          questionId: q.id,
          userAnswer: userAns || '미응답',
          isCorrect,
          timestamp: Date.now(),
        },
        q
      );
    });
  };

  const handleRestartExam = () => {
    setAnswers({});
    setIsCompleted(false);
    setCurrentIndex(0);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Score computation
  const correctCount = examQuestions.filter(
    q => answers[q.id]?.trim() === String(q.correctAnswer).trim()
  ).length;
  const score = correctCount * 10;

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            중학교 1학년 대푯값 실전 모의고사 (10문항)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            평균, 중앙값, 최빈값, 이상치 활용 문제를 실제 시험 형식으로 평가합니다.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>경과 시간:</span>
            <span className="font-bold tabular-nums">{formatTime(secondsElapsed)}</span>
          </div>

          <div className="text-slate-600">
            마킹 완료: <span className="font-bold text-sky-700">{Object.keys(answers).length}</span> / 10
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Display (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-sky-800">
                문제 {currentIndex + 1}번 / 10
              </span>
              <span>단원: {currentQ.categoryLabel}</span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                {currentQ.title}
              </h3>
              <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
                {currentQ.prompt}
              </div>

              {currentQ.tableData && (
                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-center">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        {currentQ.tableData.map((col, i) => (
                          <th key={i} className="py-1.5 px-3 border-r border-slate-200 last:border-r-0">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        {currentQ.tableData.map((col, i) => (
                          <td key={i} className="py-2 px-3 border-r border-slate-200 last:border-r-0 font-mono font-medium">
                            {col.count}명
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            {currentQ.options && (
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(opt)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50 text-sky-950 font-semibold ring-2 ring-sky-200'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono bg-slate-100 text-slate-700">
                        {idx + 1}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                이전 문항
              </button>

              {currentIndex < examQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  다음 문항
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishExam}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  답안 제출 및 채점하기
                </button>
              )}
            </div>
          </div>

          {/* OMR Card (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
              OMR 답안 마킹표
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {examQuestions.map((q, idx) => {
                const hasAnswered = !!answers[q.id];
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-200 font-bold'
                        : hasAnswered
                        ? 'border-slate-300 bg-slate-100 text-slate-800 font-medium'
                        : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{idx + 1}번</span>
                      <span className="text-[10px] font-mono">
                        {hasAnswered ? '● 완료' : '○ 미입력'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleFinishExam}
                className="w-full py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                모의고사 종료 및 채점
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Exam Results Report & Review */
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center py-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block mb-1">
              모의평가 성적 결과표
            </span>
            <div className="text-4xl font-extrabold text-slate-900 font-mono">
              {score}점
              <span className="text-base text-slate-500 font-normal ml-2">/ 100점</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              총 10문제 중 <strong className="text-emerald-700">{correctCount}문제 정답</strong>, 소요 시간 {formatTime(secondsElapsed)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestartExam}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              다시 시험 보기
            </button>
            <button
              onClick={onGoToReview}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              오답노트 확인하기
            </button>
          </div>

          {/* Question by Question Review List */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900">문항별 상세 채점 결과</h4>
            {examQuestions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns?.trim() === String(q.correctAnswer).trim();
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border text-xs sm:text-sm ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-slate-900">
                      {idx + 1}번. {q.title}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {isCorrect ? '정답 (+10점)' : '오답 (0점)'}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs mb-3">{q.prompt}</p>

                  <div className="text-xs space-y-1 bg-white/80 p-2.5 rounded border border-slate-200/60 mb-2">
                    <div>
                      내가 선택한 답:{' '}
                      <strong className={isCorrect ? 'text-emerald-800' : 'text-rose-700'}>
                        {userAns || '(미입력)'}
                      </strong>
                    </div>
                    <div>
                      정답:{' '}
                      <strong className="text-slate-900">{q.correctAnswer}</strong>
                    </div>
                  </div>

                  {/* Summary Explanation */}
                  <div className="text-xs text-slate-700 pt-2 border-t border-slate-200/50">
                    <span className="font-semibold text-slate-900">해설: </span>
                    {q.explanation.summary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
