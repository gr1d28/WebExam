import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExamListPage } from './pages/ExamListPage';
import { ExamTakingPage } from './pages/ExamTakingPage';
import { ResultsPage } from './pages/ResultsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { CreateExamPage } from './pages/CreatePage';
import { ExamResultsPage } from './pages/ExamResultsPage';
import { EditExamPage } from './pages/EditExamPage';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const RoleBasedDashboard: React.FC = () => {
    const { user } = useAuth();

    // role 1 = Student, 2 = Teacher, 3 = Admin
    if (user?.role === 1) {
        return <StudentDashboardPage />;
    } else {
        return <TeacherDashboardPage />;
    }
};

const DashboardWrapper: React.FC = () => {
    return <RoleBasedDashboard />;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<Layout />}>
                                <Route path="/" element={<DashboardWrapper />} />
                                <Route path="/exams" element={<ExamListPage />} />
                                <Route path="/exam/:examId/start" element={<ExamTakingPage />} />
                                <Route path="/results/:sessionId" element={<ResultsPage />} />

                                {/* Teacher/Admin routes */}
                                <Route element={<ProtectedRoute roles={[2, 3]} />}>
                                    <Route path="/exam/:examId/edit" element={<EditExamPage />} />
                                    <Route path="/exam/:examId/results" element={<ExamResultsPage />} />
                                    <Route path="/exam/create" element={<CreateExamPage />} />
                                    <Route path="/exam/:examId/edit" element={<div>Edit Exam</div>} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Redirect unknown routes */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;