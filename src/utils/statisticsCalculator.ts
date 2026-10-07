import { LabCalculationResult, QuizQuestion } from '../types/statistics';

export function computeStatistics(numbers: number[]): LabCalculationResult {
  if (!numbers || numbers.length === 0) {
    return {
      data: [],
      sortedData: [],
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      medianType: 'odd',
      medianIndices: [],
      modes: [],
      modeFrequency: 0,
      frequencies: [],
      outliers: [],
      min: 0,
      max: 0,
      range: 0,
    };
  }

  const sortedData = [...numbers].sort((a, b) => a - b);
  const count = sortedData.length;
  const sum = sortedData.reduce((acc, curr) => acc + curr, 0);
  const mean = Math.round((sum / count) * 10) / 10;

  // Median calculation
  let median = 0;
  let medianType: 'odd' | 'even' = 'odd';
  let medianIndices: number[] = [];

  if (count % 2 === 1) {
    const midIndex = Math.floor(count / 2);
    median = sortedData[midIndex];
    medianType = 'odd';
    medianIndices = [midIndex];
  } else {
    const mid1 = count / 2 - 1;
    const mid2 = count / 2;
    median = Math.round(((sortedData[mid1] + sortedData[mid2]) / 2) * 10) / 10;
    medianType = 'even';
    medianIndices = [mid1, mid2];
  }

  // Frequency calculation
  const freqMap = new Map<number, number>();
  for (const n of sortedData) {
    freqMap.set(n, (freqMap.get(n) || 0) + 1);
  }

  const frequencies = Array.from(freqMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value - b.value);

  const maxFreq = Math.max(...frequencies.map(f => f.count));
  // 중1 교육과정 원칙:
  // 모든 변량의 도수가 같으면 최빈값은 없다.
  // 최대 도수를 갖는 값이 여러 개이면 그 값들 모두가 최빈값이다.
  let modes: number[] = [];
  const allFreqsEqual = frequencies.every(f => f.count === maxFreq);

  if (!allFreqsEqual && maxFreq > 1) {
    modes = frequencies.filter(f => f.count === maxFreq).map(f => f.value);
  }

  // Outlier detection using IQR
  const q1Index = Math.floor(count * 0.25);
  const q3Index = Math.floor(count * 0.75);
  const q1 = sortedData[q1Index];
  const q3 = sortedData[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = sortedData.filter(v => (v < lowerBound || v > upperBound) && iqr > 0);

  return {
    data: numbers,
    sortedData,
    count,
    sum,
    mean,
    median,
    medianType,
    medianIndices,
    modes,
    modeFrequency: modes.length > 0 ? maxFreq : 0,
    frequencies,
    outliers,
    min: sortedData[0],
    max: sortedData[count - 1],
    range: sortedData[count - 1] - sortedData[0],
  };
}

// Random helper
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Dynamic question generator for infinite mode
export function generateRandomPracticeQuestion(difficulty: '기초' | '기본' | '발전'): QuizQuestion {
  const seed = Math.random();

  if (seed < 0.25) {
    // 중앙값 (홀수/짝수)
    const isOdd = Math.random() > 0.5;
    const len = isOdd ? (difficulty === '기초' ? 5 : 7) : (difficulty === '기초' ? 4 : 6);
    const data: number[] = [];
    for (let i = 0; i < len; i++) {
      data.push(getRandomInt(10, 50));
    }
    const stats = computeStatistics(data);
    const options = Array.from(new Set([
      stats.median,
      stats.mean,
      stats.median + (stats.median % 1 === 0 ? 1 : 0.5),
      Math.max(1, stats.median - (stats.median % 1 === 0 ? 1 : 0.5)),
    ])).slice(0, 4).sort((a, b) => a - b);

    // If options length < 4, pad with plausible answers
    while (options.length < 4) {
      options.push(Math.round((options[0] + options.length * 2) * 10) / 10);
    }

    const steps = [
      {
        title: '1단계: 자료를 작은 값부터 순서대로 나열하기',
        detail: `주어진 자료를 오름차순으로 정렬하면 다음과 같습니다.\n[ ${stats.sortedData.join(', ')} ]`,
      },
      {
        title: `2단계: 자료의 개수(${len}개) 확인 및 가운데 위치 찾기`,
        detail: isOdd
          ? `자료의 개수가 홀수(${len}개)이므로, 한가운데 위치는 (${len} + 1) ÷ 2 = ${Math.floor(len / 2) + 1}번째 값입니다.`
          : `자료의 개수가 짝수(${len}개)이므로, 한가운데 두 값(${len / 2}번째, ${len / 2 + 1}번째)의 평균을 구합니다.`,
      },
      {
        title: '3단계: 중앙값 확정하기',
        detail: isOdd
          ? `따라서 중앙값은 ${Math.floor(len / 2) + 1}번째 값인 ${stats.median}입니다.`
          : `가운데 두 값은 ${stats.sortedData[len / 2 - 1]}와 ${stats.sortedData[len / 2]}이므로, 중앙값은 (${stats.sortedData[len / 2 - 1]} + ${stats.sortedData[len / 2]}) ÷ 2 = ${stats.median}입니다.`,
      },
    ];

    return {
      id: `dynamic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: 'CALCULATION',
      categoryLabel: '기본 계산 마스터',
      title: `자료의 중앙값 구하기 (${isOdd ? '자료 개수 홀수' : '자료 개수 짝수'})`,
      prompt: `다음 주어진 자료의 중앙값을 구하시오.\n자료: [ ${data.join(', ')} ]`,
      dataSet: data,
      questionType: 'multiple-choice',
      options: options.map(o => `${o}`),
      correctAnswer: `${stats.median}`,
      difficulty,
      conceptTag: '중앙값',
      explanation: {
        summary: `주어진 자료의 중앙값은 ${stats.median}입니다.`,
        steps,
        sortedData: stats.sortedData,
        conceptTip: isOdd
          ? '자료 개수가 홀수일 때는 정확히 정가운데 1개의 값이 중앙값이 됩니다.'
          : '자료 개수가 짝수일 때는 가운데 위치한 2개 값의 평균을 중앙값으로 합니다.',
      },
    };
  } else if (seed < 0.5) {
    // 최빈값 문제
    const type = Math.random() < 0.33 ? 'one' : Math.random() < 0.66 ? 'two' : 'none';
    let data: number[] = [];
    if (type === 'one') {
      const modeVal = getRandomInt(10, 30);
      data = [modeVal, modeVal, getRandomInt(31, 40), getRandomInt(41, 50), getRandomInt(51, 60)];
      // shuffle
      data.sort(() => Math.random() - 0.5);
    } else if (type === 'two') {
      const mode1 = getRandomInt(10, 25);
      const mode2 = getRandomInt(26, 40);
      data = [mode1, mode1, mode2, mode2, getRandomInt(41, 50), getRandomInt(51, 60)];
      data.sort(() => Math.random() - 0.5);
    } else {
      data = [getRandomInt(10, 15), getRandomInt(16, 20), getRandomInt(21, 25), getRandomInt(26, 30), getRandomInt(31, 35)];
    }

    const stats = computeStatistics(data);
    const correctText = stats.modes.length === 0 ? '없다' : stats.modes.join(', ');

    const options = [
      correctText,
      stats.modes.length === 0 ? `${data[0]}` : '없다',
      `${data[1]}`,
      `${stats.mean}`,
    ];
    const uniqueOptions = Array.from(new Set(options)).slice(0, 4);
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`${getRandomInt(10, 50)}`);
    }

    return {
      id: `dynamic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: 'CALCULATION',
      categoryLabel: '기본 계산 마스터',
      title: '자료의 최빈값 찾기',
      prompt: `다음 주어진 자료의 최빈값을 구하시오. (없으면 '없다' 선택)\n자료: [ ${data.join(', ')} ]`,
      dataSet: data,
      questionType: 'multiple-choice',
      options: uniqueOptions.sort(),
      correctAnswer: correctText,
      difficulty,
      conceptTag: '최빈값',
      explanation: {
        summary: stats.modes.length === 0 
          ? '모든 자료의 도수가 1회로 같으므로 최빈값은 없습니다.' 
          : `가장 많이 나타난 값은 ${stats.modes.join(', ')} (도수 ${stats.modeFrequency}회)입니다.`,
        steps: [
          {
            title: '1단계: 각 값의 출현 빈도(도수) 조사',
            detail: stats.frequencies.map(f => `값 ${f.value} : ${f.count}회`).join('\n'),
          },
          {
            title: '2단계: 가장 큰 도수 확인 및 최빈값 결정',
            detail: stats.modes.length === 0
              ? '각 값의 도수가 모두 같으면 최빈값은 없다고 합니다.'
              : `가장 큰 도수는 ${stats.modeFrequency}회이며, 해당 값은 ${stats.modes.join(', ')}입니다.`,
          },
        ],
        conceptTip: '최빈값은 1개일 수도 있고, 가장 많이 나타난 도수가 같은 값이 여러 개이면 2개 이상일 수도 있으며, 모두 한 번씩만 나타나면 없을 수도 있습니다.',
      },
    };
  } else if (seed < 0.75) {
    // 미지수 x가 포함된 평균 문제
    const targetMean = getRandomInt(70, 90);
    const n = 4;
    const knowns = [getRandomInt(60, 95), getRandomInt(60, 95), getRandomInt(60, 95)];
    const knownSum = knowns.reduce((a, b) => a + b, 0);
    const x = targetMean * n - knownSum;

    const dataDisplay = [...knowns, 'x'];
    const options = [
      `${x}`,
      `${x + 4}`,
      `${x - 4}`,
      `${targetMean}`,
    ].filter((v, i, a) => a.indexOf(v) === i);
    while (options.length < 4) {
      options.push(`${x + options.length * 3}`);
    }

    return {
      id: `dynamic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: 'UNKNOWN_VARIABLE',
      categoryLabel: '미지수 x 추론',
      title: '평균을 이용하여 미지수 x 구하기',
      prompt: `4개의 변량 ${knowns.join(', ')}, x 의 평균이 ${targetMean}점일 때, x의 값을 구하시오.`,
      questionType: 'multiple-choice',
      options: options.sort((a, b) => Number(a) - Number(b)),
      correctAnswer: `${x}`,
      difficulty,
      conceptTag: '평균',
      unit: '점',
      explanation: {
        summary: `x의 값은 ${x}입니다.`,
        steps: [
          {
            title: '1단계: 평균 공식 세우기',
            detail: `평균 = (변량의 총합) ÷ (변량의 개수)\n${targetMean} = (${knowns.join(' + ')} + x) ÷ 4`,
          },
          {
            title: '2단계: 양변에 4 곱하기',
            detail: `${knownSum} + x = ${targetMean} × 4 = ${targetMean * 4}`,
          },
          {
            title: '3단계: 일차방정식 풀기',
            detail: `x = ${targetMean * 4} - ${knownSum} = ${x}`,
          },
        ],
        conceptTip: '평균이 주어졌을 때 총합은 (평균 × 변량의 개수)로 항상 일정하다는 성질을 이용합니다.',
      },
    };
  } else {
    // 이상치와 대푯값의 선택 문제
    return {
      id: `dynamic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: 'REPRESENTATIVE_CHOICE',
      categoryLabel: '상황별 대푯값 선택',
      title: '극단적인 값이 있는 자료의 대푯값',
      prompt: '어떤 소규모 벤처기업 직원 5명의 월급이 각각 250만 원, 260만 원, 270만 원, 280만 원이고 대표이사의 월급이 2,500만 원이라고 합니다. 이 회사 직원들의 일반적인 월급 수준을 나타내기에 가장 적절한 대푯값과 그 이유는 무엇일까요?',
      questionType: 'multiple-choice',
      options: [
        '중앙값 - 2,500만 원과 같은 극단적인 값의 영향을 받지 않기 때문',
        '평균 - 모든 사람의 월급을 골고루 반영할 수 있기 때문',
        '최빈값 - 모든 사람의 월급이 서로 다르기 때문',
        '평균 - 중앙값보다 항상 더 크고 정확하기 때문',
      ],
      correctAnswer: '중앙값 - 2,500만 원과 같은 극단적인 값의 영향을 받지 않기 때문',
      difficulty: '기본',
      conceptTag: '이상치',
      explanation: {
        summary: '극단적인 이상치(대표이사 월급 2,500만 원)가 포함되어 있으므로 중앙값이 가장 적절합니다.',
        steps: [
          {
            title: '1단계: 평균 계산해보기',
            detail: '평균 = (250 + 260 + 270 + 280 + 2500) ÷ 5 = 712만 원\n직원 대부분은 200만 원대인데 평균은 712만 원으로 대다수를 대표하지 못합니다.',
          },
          {
            title: '2단계: 중앙값 확인하기',
            detail: '크기순 정렬: 250, 260, [270], 280, 2500\n중앙값은 270만 원으로 직원들의 실제 월급 수준을 매우 잘 반영합니다.',
          },
          {
            title: '3단계: 결론 도출',
            detail: '매우 크거나 작은 극단적인 값(이상치)이 있는 자료에서는 평균보다 중앙값이 대푯값으로 적절합니다.',
          },
        ],
        conceptTip: '평균은 모든 변량을 반영하지만 극단적인 값에 매우 민감합니다. 이때 중앙값은 순서만 따지므로 극단값의 영향을 받지 않습니다.',
      },
    };
  }
}
