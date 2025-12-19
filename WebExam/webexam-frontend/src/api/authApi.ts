import axiosInstance from './axiosConfig';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: number;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: number;
    createdAt: string;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await axiosInstance.post('/auth/login', data);
            return response.data.data;
        } catch (error) {
            console.error('Error during authorization:', error);
            throw error;
        }
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await axiosInstance.post('/auth/register', data);
            return response.data.data;
        } catch (error) {
            console.error('Error during registration', error);
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await axiosInstance.get('/auth/me');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching current user', error);
            throw error;
        }
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        try {
            const response = await axiosInstance.post('/auth/change-password', data);
            return response.data.data;
        } catch (error) {
            console.error('Error when changing the password', error);
            throw error;
        }
    },
};