export type QuizCategory = 
  | 'CALCULATION'
  | 'REPRESENTATIVE_CHOICE'
  | 'UNKNOWN_VARIABLE'
  | 'DATA_REPRESENTATION';

export type ConceptTag = '평균' | '중앙값' | '최빈값' | '대푯값 선택' | '이상치';

export type QuestionDifficulty = '기초' | '기본' | '발전' | '심화';

export interface ExplanationStep {
  title: string;
  detail: string;
  visualHighlight?: string;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  categoryLabel: string;
  title: string;
  prompt: string;
  dataSet?: number[];
  categoricalData?: string[];
  tableData?: { label: string | number; count: number }[];
  questionType: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  unit?: string;
  difficulty: QuestionDifficulty;
  conceptTag: ConceptTag;
  explanation: {
    summary: string;
    steps: ExplanationStep[];
    sortedData?: number[];
    conceptTip: string;
  };
}

export interface UserAnswerRecord {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timestamp: number;
}

export interface ReviewItem {
  question: QuizQuestion;
  lastUserAnswer: string | number;
  incorrectCount: number;
  solvedCorrectlyAfter: boolean;
}

export interface LabCalculationResult {
  data: number[];
  sortedData: number[];
  count: number;
  sum: number;
  mean: number;
  median: number;
  medianType: 'odd' | 'even';
  medianIndices: number[];
  modes: number[];
  modeFrequency: number;
  frequencies: { value: number; count: number }[];
  outliers: number[];
  min: number;
  max: number;
  range: number;
}
