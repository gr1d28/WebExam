export interface Question {
    id: number;
    text: string;
    type: QuestionType;
    points: number;
    order: number;
    answerOptions: AnswerOption[];
}

export type QuestionType = 'SingleChoice' | 'MultipleChoice' | 'TextAnswer' | 'CodeAnswer';

export interface AnswerOption {
    id: number;
    text: string;
    isCorrect: boolean;
    order?: number;
}