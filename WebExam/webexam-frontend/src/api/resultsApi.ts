// src/api/resultsApi.ts
import axiosInstance from './axiosConfig';
import { Exam } from './examApi';

export interface ExamResult {
    id: number;
    examSessionId: number;
    examSession?: {
        id: number;
        examId: number;
        userId: number;
        startTime: string;
        endTime?: string;
        status: string;
    };
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    isPassed: boolean;
    calculatedAt: string;
    feedback?: string;
    exam?: Exam;
    examId?: number;
    attemptNumber?: number;
    passingScore?: number;
}

export interface UserExamResult {
    examId: number;
    examTitle: string;
    bestScore: number;
    maxScore: number;
    bestPercentage: number;
    hasPassed: boolean;
    attemptCount: number;
    lastAttemptDate: string;
}

export interface ExamStatistics {
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    passRate: number;
    scoreDistribution: ScoreDistribution[];
}

export interface ScoreDistribution {
    range: string;
    count: number;
}

export interface ExamAttempt {
    resultId: number;
    examSessionId: number;
    userId: number;
    userFullName: string;
    userEmail: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    isPassed: boolean;
    calculatedAt: string;
    feedback?: string;
    attemptNumber: number;
}

export const resultsApi = {
    getResultBySession: async (sessionId: number): Promise<ExamResult> => {
        try {
            const response = await axiosInstance.get(`/results/session/${sessionId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching result by session:', error);
            throw error;
        }
    },

    getResultDetails: async (resultId: number): Promise<ExamResult> => {
        try {
            const response = await axiosInstance.get(`/results/result/${resultId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching result details:', error);
            throw error;
        }
    },

    getUserResults: async (): Promise<UserExamResult[]> => {
        try {
            const response = await axiosInstance.get('/results/my-results');
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Error fetching user results:', error);
            return [];
        }
    },

    getExamStatistics: async (examId: number): Promise<ExamStatistics> => {
        try {
            const response = await axiosInstance.get(`/results/exam/${examId}/statistics`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching exam statistics:', error);
            throw error;
        }
    },

    getExamAttempts: async (examId: number): Promise<ExamAttempt[]> => {
        try {
            const response = await axiosInstance.get(`/results/exam/${examId}/attempts`);
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Error fetching exam attempts:', error);
            throw error;
        }
    },
};