import React, { useState, useMemo } from 'react';
import { computeStatistics } from '../utils/statisticsCalculator';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface PresetOption {
  label: string;
  data: number[];
  description: string;
}

const PRESETS: PresetOption[] = [
  {
    label: '기본 분포',
    data: [12, 16, 18, 18, 22, 24, 30],
    description: '홀수 개 자료(7개)로 중앙값 18, 최빈값 18, 평균 20인 전형적인 분포입니다.',
  },
  {
    label: '이상치(극단값) 폭탄',
    data: [10, 12, 12, 14, 15, 95],
    description: '극단값 95로 인해 평균은 26.3으로 급상승하지만, 중앙값은 13으로 안정적입니다.',
  },
  {
    label: '최빈값 2개 (양봉)',
    data: [5, 8, 8, 11, 14, 14, 18],
    description: '8과 14가 각각 2회로 공동 최대 도수를 가져 최빈값이 2개(8, 14)입니다.',
  },
  {
    label: '최빈값 없음',
    data: [10, 20, 30, 40, 50, 60],
    description: '모든 자료의 출현 횟수가 1회로 같아 최빈값이 존재하지 않습니다.',
  },
  {
    label: '짝수 개 중앙값',
    data: [4, 7, 10, 14, 18, 21],
    description: '자료 6개 중 3번째(10)와 4번째(14)의 평균인 12가 중앙값이 됩니다.',
  },
];

export const ConceptLab: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<number[]>([12, 16, 18, 18, 22, 24, 30]);
  const [newInput, setNewInput] = useState<string>('');
  const [activeConceptTab, setActiveConceptTab] = useState<'all' | 'mean' | 'median' | 'mode'>('all');

  const stats = useMemo(() => computeStatistics(dataPoints), [dataPoints]);

  const handleAddNumber = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(newInput.trim());
    if (!isNaN(val)) {
      if (dataPoints.length >= 16) {
        return;
      }
      setDataPoints([...dataPoints, val]);
      setNewInput('');
    }
  };

  const handleRemoveIndex = (idx: number) => {
    if (dataPoints.length <= 1) return;
    setDataPoints(dataPoints.filter((_, i) => i !== idx));
  };

  const handleLoadPreset = (preset: PresetOption) => {
    setDataPoints([...preset.data]);
  };

  const handleAddOutlier = () => {
    if (dataPoints.length >= 16) return;
    const maxVal = Math.max(...dataPoints, 0);
    setDataPoints([...dataPoints, maxVal + 60]);
  };

  // Seesaw tilt physics representation:
  // If we calculate deviations relative to median vs relative to mean:
  // Relative to mean, net torque is mathematically 0!
  const minVal = Math.min(...(stats.sortedData.length ? stats.sortedData : [0]), 0);
  const maxVal = Math.max(...(stats.sortedData.length ? stats.sortedData : [100]), 100);
  const rangeSpan = Math.max(maxVal - minVal, 1);

  return (
    <div className="space-y-8">
      {/* Hero Banner with Generated Image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-sm">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_statistics_math_1791352760115.jpg"
            alt="대푯값 수학 통계 개념 일러스트"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 tracking-wide uppercase mb-2">
            <span>중학교 1학년 수학</span>
            <span>·</span>
            <span>통계: 자료의 정리와 해석</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            대푯값 인터랙티브 실험실
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            평균(Mean), 중앙값(Median), 최빈값(Mode)은 자료를 대표하는 세 가지 핵심 수치입니다.
            숫자를 직접 넣거나 극단적인 이상치를 추가해보며 세 대푯값이 어떻게 변화하는지 눈으로 직접 확인해보세요.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">대표적인 상황별 프리셋 체험</h2>
            <p className="text-xs text-slate-500 mt-0.5">자주 출제되는 대푯값의 특수한 경우들을 원클릭으로 불러옵니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddOutlier}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              극단값(+60) 강제 추가
            </button>
            <button
              onClick={() => setDataPoints([12, 16, 18, 18, 22, 24, 30])}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadPreset(p)}
              className="p-3 text-left border border-slate-200 rounded-lg hover:border-sky-500 hover:bg-sky-50/50 transition-all text-xs cursor-pointer group"
            >
              <span className="font-semibold text-slate-800 group-hover:text-sky-700 block mb-1">
                {p.label}
              </span>
              <span className="text-slate-500 line-clamp-2 leading-relaxed">
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Interactive Visual Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Dot Plot & Value Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  수직선 위의 분포와 대푯값 위치
                </h3>
                <p className="text-xs text-slate-500">
                  평균(파랑)과 중앙값(초록)의 위치를 비교해보세요.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-sky-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> 평균 ({stats.mean})
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> 중앙값 ({stats.median})
                </span>
              </div>
            </div>

            {/* Interactive Axis Stage */}
            <div className="py-6 px-2">
              <div className="relative h-28 border-b-2 border-slate-300">
                {/* Visual Data Points (Circles) */}
                {stats.sortedData.map((val, idx) => {
                  const percent = Math.min(Math.max(((val - minVal) / rangeSpan) * 100, 2), 98);
                  const isMedianNode = stats.medianIndices.includes(idx);
                  const isModeNode = stats.modes.includes(val);

                  return (
                    <div
                      key={`point-${idx}-${val}`}
                      style={{ left: `${percent}%` }}
                      className="absolute bottom-2 -translate-x-1/2 flex flex-col items-center group transition-all duration-300"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono bg-slate-900 text-white px-1.5 py-0.5 rounded -mb-6 pointer-events-none z-20">
                        {val}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold shadow-xs transition-transform group-hover:scale-125 ${
                          isMedianNode && isModeNode
                            ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                            : isMedianNode
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                            : isModeNode
                            ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {val}
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono mt-1">
                        #{idx + 1}
                      </span>
                    </div>
                  );
                })}

                {/* Mean Indicator Needle */}
                {stats.count > 0 && (
                  <div
                    style={{ left: `${Math.min(Math.max(((stats.mean - minVal) / rangeSpan) * 100, 2), 98)}%` }}
                    className="absolute -top-3 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 transition-all duration-500"
                  >
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-100 border border-sky-300 px-1.5 py-0.5 rounded shadow-xs mb-1">
                      평균 {stats.mean}
                    </span>
                    <div className="w-0.5 h-full bg-sky-600 border-l border-dashed border-sky-600" />
                  </div>
                )}

                {/* Median Indicator Needle */}
                {stats.count > 0 && (
                  <div
                    style={{ left: `${Math.min(Math.max(((stats.median - minVal) / rangeSpan) * 100, 2), 98)}%` }}
                    className="absolute -top-8 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 transition-all duration-500"
                  >
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded shadow-xs mb-1">
                      중앙값 {stats.median}
                    </span>
                    <div className="w-0.5 h-full bg-emerald-600 border-l border-dashed border-emerald-600" />
                  </div>
                )}
              </div>

              {/* Number Line Ticks */}
              <div className="flex justify-between text-xs text-slate-600 font-mono mt-2">
                <span>최솟값: {stats.min}</span>
                <span>범위: {stats.range}</span>
                <span>최댓값: {stats.max}</span>
              </div>
            </div>

            {/* Sorted Array Interactive Strip */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  크기 순서대로 정렬된 자료 ({stats.count}개)
                </span>
                <span className="text-xs text-slate-500">
                  {stats.medianType === 'odd' ? '홀수 개 (가운데 1개 선택)' : '짝수 개 (가운데 2개 평균)'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {stats.sortedData.map((num, i) => {
                  const isMedian = stats.medianIndices.includes(i);
                  const isMode = stats.modes.includes(num);
                  return (
                    <div
                      key={i}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${
                        isMedian
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-200'
                          : isMode
                          ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {num}
                      {isMedian && (
                        <span className="ml-1 text-[10px] text-emerald-600 font-sans block text-center">
                          중앙
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Seesaw / Balance Metaphor (Why Mean is the Center of Mass) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                양팔 저울 원리 : 왜 '평균'이 균형점일까?
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              평균은 자료들의 무게중심(받침점)과 같습니다. 평균을 기준으로 각 자료까지의 거리(편차)의 총합은 항상 <strong>0</strong>이 되어 시소가 정확히 수평을 이룹니다.
            </p>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              {/* Balance Beam */}
              <div className="relative h-12 flex items-center justify-center">
                <div className="w-full h-2 bg-slate-300 rounded-full relative">
                  {/* Fulcrum (Mean) */}
                  <div
                    style={{ left: `${Math.min(Math.max(((stats.mean - minVal) / rangeSpan) * 100, 5), 95)}%` }}
                    className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
                  >
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-sky-700" />
                    <span className="text-[10px] font-bold text-sky-800 mt-1 whitespace-nowrap">
                      받침점(평균 {stats.mean})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-slate-500 mt-2">
                자료 개수: <span className="font-semibold text-slate-800">{stats.count}개</span> · 
                총합: <span className="font-semibold text-slate-800 font-mono">{stats.sum}</span> · 
                평균: <span className="font-semibold text-sky-700 font-mono">{stats.mean}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone: Control Deck & Concept Deep Dive (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Data Editor Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              자료 편집기 ({dataPoints.length}/16개)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              새로운 숫자를 추가하거나 기존 숫자를 삭제해보세요.
            </p>

            {/* Input Form */}
            <form onSubmit={handleAddNumber} className="flex gap-2 mb-4">
              <input
                type="number"
                step="any"
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                placeholder="숫자 입력 (예: 25)"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                추가
              </button>
            </form>

            {/* Current Values Chip-free Tag List with Delete */}
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {dataPoints.map((val, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-mono text-slate-800 border border-slate-200 transition-colors"
                >
                  <span>{val}</span>
                  <button
                    onClick={() => handleRemoveIndex(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Three Representative Values Summary & Explanations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              세 대푯값 실시간 계산 결과
            </h3>

            {/* 1. Mean (평균) */}
            <div className="p-3.5 rounded-lg border border-sky-100 bg-sky-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-sky-900 uppercase">
                    01. 평균 (Mean)
                  </span>
                  <div className="text-xl font-bold font-mono text-sky-800 mt-0.5">
                    {stats.mean}
                  </div>
                </div>
                <span className="text-xs text-sky-700 font-mono">
                  {stats.sum} ÷ {stats.count}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p>• <strong>계산법:</strong> 자료의 총합({stats.sum}) ÷ 개수({stats.count})</p>
                <p>• <strong>특징:</strong> 모든 변량을 고르게 반영하지만, 극단적인 이상치에 매우 취약합니다.</p>
              </div>
            </div>

            {/* 2. Median (중앙값) */}
            <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-900 uppercase">
                    02. 중앙값 (Median)
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
                    {stats.median}
                  </div>
                </div>
                <span className="text-xs text-emerald-700">
                  {stats.medianType === 'odd' ? '홀수 위치' : '짝수 평균'}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                {stats.medianType === 'odd' ? (
                  <p>• <strong>계산법:</strong> 자료가 홀수({stats.count}개)이므로 ({stats.count} + 1) ÷ 2 = {Math.floor(stats.count / 2) + 1}번째 값인 {stats.median}</p>
                ) : (
                  <p>• <strong>계산법:</strong> 자료가 짝수({stats.count}개)이므로 가운데 두 값({stats.sortedData[stats.count / 2 - 1]}, {stats.sortedData[stats.count / 2]})의 평균</p>
                )}
                <p>• <strong>특징:</strong> 극단적인 값(이상치)의 영향을 전혀 받지 않아 소득, 자산 등의 대푯값으로 적절합니다.</p>
              </div>
            </div>

            {/* 3. Mode (최빈값) */}
            <div className="p-3.5 rounded-lg border border-purple-100 bg-purple-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-900 uppercase">
                    03. 최빈값 (Mode)
                  </span>
                  <div className="text-xl font-bold font-mono text-purple-800 mt-0.5">
                    {stats.modes.length === 0 ? '최빈값 없음' : stats.modes.join(', ')}
                  </div>
                </div>
                {stats.modes.length > 0 && (
                  <span className="text-xs text-purple-700 font-mono">
                    최대 도수 {stats.modeFrequency}회
                  </span>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p>
                  • <strong>도수 현황:</strong>{' '}
                  {stats.frequencies.map(f => `${f.value}(${f.count}회)`).join(', ')}
                </p>
                <p>• <strong>특징:</strong> 2개 이상일 수도 있고 없을 수도 있으며, 신발 치수나 인기투표(질적 자료)에 유일하게 쓰입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
