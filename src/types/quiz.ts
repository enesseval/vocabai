// src/types/quiz.ts

export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'fill_blank' | 'comprehension';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    word?: string; // For vocabulary questions
}

export interface QuizResult {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
}

export interface CompletedQuiz {
    id: string;
    storyId: string;
    questions: QuizQuestion[];
    results: QuizResult[];
    score: number;
    totalQuestions: number;
    completedAt: Date;
}
