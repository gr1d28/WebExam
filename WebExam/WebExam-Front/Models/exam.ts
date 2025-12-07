export interface Exam {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    maxAttempts: number;
    isPublished: boolean;
    questionCount: number;
}