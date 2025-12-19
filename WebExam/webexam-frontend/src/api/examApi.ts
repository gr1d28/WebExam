import axiosInstance from './axiosConfig';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface CreateQuestionRequest {
    text: string;
    type: number;
    points: number;
    order: number;
    answerOptions: CreateAnswerOptionRequest[];
}

export interface CreateAnswerOptionRequest {
    text: string;
    isCorrect: boolean;
    order?: number;
}

export interface Exam {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    maxAttempts: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string;
    questionCount: number;
    createdBy: User;
}

export interface ExamById {
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    maxAttempts: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string;
    questionCount: number;
    createdBy: User;
    questions: Question[];
}

export interface CreateExamRequest {
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    maxAttempts: number;
    isPublished: boolean;
    questions: CreateQuestionRequest[];
}

export interface Question {
    id: number;
    text: string;
    type: number;
    points: number;
    order: number;
    answerOptions: AnswerOption[];
}

export interface AnswerOption {
    id: number;
    text: string;
    order?: number;
    isCorrect?: boolean;
}

//export type QuestionType = 'SingleChoice' | 'MultipleChoice' | 'TextAnswer' | 'CodeAnswer';

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

//export type ExamSessionStatus = 'InProgress' | 'Submitted' | 'Expired' | 'Terminated';

export const examApi = {
    // Получение экзаменов
    getExams: async (publishedOnly: boolean = true): Promise<Exam[]> => {
        try {
            const response = await axiosInstance.get(`/exams?publishedOnly=${publishedOnly}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching exams list', error);
            throw error;
        }
    },

    getExamById: async (id: number): Promise<ExamById> => {
        try {
            const response = await axiosInstance.get(`/exams/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching exam by id', error);
            throw error;
        }
    },

    getExamForTaking: async (id: number): Promise<Exam> => {
        try {
            const response = await axiosInstance.get(`/exams/${id}/take`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching exam by id for taking', error);
            throw error;
        }
    },

    // Создание/редактирование экзаменов
    createExam: async (data: CreateExamRequest): Promise<Exam> => {
        try {
            const response = await axiosInstance.post('/exams', data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating exam', error);
            throw error;
        }
    },

    updateExam: async (id: number, data: Partial<CreateExamRequest>): Promise<Exam> => {
        try {
            const response = await axiosInstance.put(`/exams/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error update exam', error);
            throw error;
        }
    },

    deleteExam: async (id: number): Promise<void> => {
        try {
            const response = await axiosInstance.delete(`/exams/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error delete exam', error);
            throw error;
        }
    },

    publishExam: async (id: number): Promise<void> => {
        try {
            const response = await axiosInstance.post(`/exams/${id}/publish`);
            return response.data.data;
        } catch (error) {
            console.error('Error publish exam', error);
            throw error;
        }
    },

    unpublishExam: async (id: number): Promise<void> => {
        try {
            const response = await axiosInstance.post(`/exams/${id}/unpublish`);
            return response.data.data;
        } catch (error) {
            console.error('Error unpublish exam', error);
            throw error;
        }
    },
};