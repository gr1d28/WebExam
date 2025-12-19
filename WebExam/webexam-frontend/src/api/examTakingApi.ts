import axiosInstance from './axiosConfig';
import { Question, Exam } from './examApi';

export interface ExamSession {
    id: number;
    examId: number;
    examTitle: string;
    startTime: string;
    endTime?: string;
    status: number;
    currentQuestionIndex: number;
    totalQuestions: number;
    timeRemainingSeconds: number;
    currentQuestion?: Question;
}

export interface ExamResult {
    id: number;
    examSessionId: number;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    isPassed: boolean;
    calculatedAt: string;
    feedback: string;
    exam: Exam;
}

export interface StartExamRequest {
    examId: number;
}

export interface SubmitAnswerRequest {
    questionId: number;
    selectedOptionIds: number[];
    answerText: string;
}

export const examTakingApi = {
    // Управление сессиями
    startExam: async (data: StartExamRequest): Promise<ExamSession> => {
        try {
            const response = await axiosInstance.post('/examtaking/start', data);
            return response.data.data;
        } catch (error) {
            console.error('Error starting exam', error);
            throw error;
        }
    },

    getActiveSession: async (examId: number): Promise<ExamSession> => {
        try {
            const response = await axiosInstance.get(`/examtaking/active/${examId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching active session', error);
            throw error;
        }
    },

    getSessionStatus: async (sessionId: number): Promise<ExamSession> => {
        try {
            const response = await axiosInstance.get(`/examtaking/session/${sessionId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching session status', error);
            throw error;
        }
    },

    getUserSessions: async (examId?: number): Promise<ExamSession[]> => {
        try {
            const response = await axiosInstance.get(`/examtaking/sessions${examId ? `?examId=${examId}` : ''}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user sessions', error);
            throw error;
        }
    },

    // Работа с вопросами
    getNextQuestion: async (sessionId: number): Promise<Question> => {
        try {
            const response = await axiosInstance.get(`/examtaking/session/${sessionId}/next-question`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching next question', error);
            throw error;
        }
    },

    getQuestion: async (sessionId: number, questionId: number): Promise<Question> => {
        try {
            const response = await axiosInstance.get(`/examtaking/session/${sessionId}/question/${questionId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching question', error);
            throw error;
        }
    },

    submitAnswer: async (sessionId: number, data: SubmitAnswerRequest): Promise<void> => {
        try {
            const response = await axiosInstance.post(`/examtaking/session/${sessionId}/answer`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error sending response', error);
            throw error;
        }
    },

    submitExam: async (sessionId: number): Promise<ExamResult> => {
        try {
            const response = await axiosInstance.post(`/examtaking/session/${sessionId}/submit`);
            return response.data.data;
        } catch (error) {
            console.error('Error sending exam', error);
            throw error;
        }
    },

    // Валидация
    canStartExam: async (examId: number): Promise<{ canStart: boolean }> => {
        try {
            const response = await axiosInstance.get(`/examtaking/exam/${examId}/can-start`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching start exam', error);
            throw error;
        }
    },

    getRemainingAttempts: async (examId: number): Promise<{ remainingAttempts: number }> => {
        try {
            const response = await axiosInstance.get(`/examtaking/exam/${examId}/remaining-attempts`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching remaining attempts', error);
            throw error;
        }
    },
};