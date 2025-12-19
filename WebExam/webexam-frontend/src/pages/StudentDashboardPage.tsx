import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examApi } from '../api/examApi';
import { examTakingApi } from '../api/examTakingApi';
import { resultsApi, UserExamResult } from '../api/resultsApi';
import { Exam, ExamSession } from '../api/examApi';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    LinearProgress,
    Alert,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Grid,
} from '@mui/material';
import {
    School,
    Assignment,
    History,
    TrendingUp,
    AccessTime,
    CheckCircle,
    PlayArrow,
    CalendarToday,
    EmojiEvents,
    BarChart,
} from '@mui/icons-material';

export const StudentDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [sessions, setSessions] = useState<ExamSession[]>([]);
    const [userResults, setUserResults] = useState<UserExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalExams: 0,
        totalAttempts: 0,
        passedExams: 0,
        averageScore: 0,
        activeSessions: 0,
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Загружаем доступные экзамены (только опубликованные)
            const examsData = await examApi.getExams(true);
            setExams(examsData.slice(0, 3));

            // Загружаем сессии пользователя
            const sessionsData = await examTakingApi.getUserSessions();
            setSessions(sessionsData.slice(0, 5));

            // Загружаем результаты пользователя
            const userResultsData = await resultsApi.getUserResults();
            setUserResults(userResultsData);

            // Рассчитываем статистику
            const completedSessions = sessionsData.filter(s =>
                s.status === 2 || s.status === 3
            );

            const passedResults = userResultsData.filter(r => r.hasPassed);
            const averagePercentage = userResultsData.length > 0
                ? userResultsData.reduce((sum, r) => sum + r.bestPercentage, 0) / userResultsData.length
                : 0;

            setStats({
                totalExams: examsData.length,
                totalAttempts: sessionsData.length,
                passedExams: passedResults.length,
                averageScore: Math.round(averagePercentage),
                activeSessions: sessionsData.filter(s => s.status === 1).length,
            });

        } catch (err: any) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = (examId: number) => {
        navigate(`/exam/${examId}/start`);
    };

    const handleContinueExam = (sessionId: number) => {
        navigate(`/exam-taking?session=${sessionId}`);
    };

    const handleViewResults = (sessionId: number) => {
        navigate(`/results/${sessionId}`);
    };

    const handleViewAllExams = () => {
        navigate('/exams');
    };

    const handleViewMyResults = () => {
        navigate('/my-results');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getSessionStatusColor = (status: number) => {
        switch (status) {
            case 1: return 'warning';           // InProgress
            case 2: return 'success'; // Submitted
            case 3: return 'error';     // Expired
            default: return 'default';
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 70) return 'info';
        if (percentage >= 50) return 'warning';
        return 'error';
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome back, {user?.firstName}!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Track your exam progress and performance.
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 4
            }}>
                {/* Available Exams */}
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <School sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                            <Box>
                                <Typography variant="h6">{stats.totalExams}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Available Exams
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Passed Exams */}
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <EmojiEvents sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                            <Box>
                                <Typography variant="h6">{stats.passedExams}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Exams Passed
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Average Score */}
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <TrendingUp sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                            <Box>
                                <Typography variant="h6">
                                    {stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Average Score
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* In Progress */}
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <AccessTime sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                            <Box>
                                <Typography variant="h6">{stats.activeSessions}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    In Progress
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Main Content */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3
            }}>
                {/* Available Exams */}
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Available Exams
                            </Typography>
                            <Button size="small" onClick={handleViewAllExams}>
                                View All
                            </Button>
                        </Box>

                        {exams.length === 0 ? (
                            <Alert severity="info">No exams available</Alert>
                        ) : (
                            <List>
                                {exams.map((exam) => (
                                    <React.Fragment key={exam.id}>
                                        <ListItem
                                            secondaryAction={
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<PlayArrow />}
                                                    onClick={() => handleStartExam(exam.id)}
                                                >
                                                    Start
                                                </Button>
                                            }
                                        >
                                            <ListItemText
                                                primary={exam.title}
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" component="span">
                                                            {exam.questionCount} questions • {exam.durationMinutes} min
                                                        </Typography>
                                                        <br />
                                                        <Typography variant="caption" color="text.secondary">
                                                            Passing score: {exam.passingScore}%
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                <History sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Recent Activity
                            </Typography>
                        </Box>

                        {sessions.length === 0 ? (
                            <Alert severity="info">No recent activity</Alert>
                        ) : (
                            <List>
                                {sessions.map((session) => (
                                    <React.Fragment key={session.id}>
                                        <ListItem
                                            secondaryAction={
                                                session.status === 1 ? (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => handleContinueExam(session.id)}
                                                    >
                                                        Continue
                                                    </Button>
                                                ) : session.status === 2 ? (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleViewResults(session.id)}
                                                    >
                                                        View Results
                                                    </Button>
                                                ) : null
                                            }
                                        >
                                            <ListItemIcon>
                                                <CalendarToday />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={session.examTitle}
                                                secondary={
                                                    <>
                                                        <Chip
                                                            label={session.status}
                                                            size="small"
                                                            color={getSessionStatusColor(session.status) as any}
                                                            sx={{ mr: 1 }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(session.startTime)}
                                                        </Typography>
                                                        {session.status === 1 && (
                                                            <>
                                                                <br />
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Time remaining: {Math.floor(session.timeRemainingSeconds / 60)}:
                                                                    {(session.timeRemainingSeconds % 60).toString().padStart(2, '0')}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Exam Results Summary */}
            <Box sx={{ mt: 3 }}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Exam Results Summary
                            </Typography>
                            <Button size="small" onClick={handleViewMyResults}>
                                View All Results
                            </Button>
                        </Box>

                        {userResults.length === 0 ? (
                            <Alert severity="info">No exam results yet</Alert>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                                gap: 2
                            }}>
                                {userResults.slice(0, 4).map((result) => (
                                    <Card key={result.examId} variant="outlined">
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom noWrap>
                                                {result.examTitle}
                                            </Typography>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box>
                                                    <Typography variant="h6" color={getScoreColor(result.bestPercentage) as any}>
                                                        {result.bestPercentage.toFixed(1)}%
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Best Score
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={result.hasPassed ? 'PASSED' : 'FAILED'}
                                                    size="small"
                                                    color={result.hasPassed ? 'success' : 'error'}
                                                />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                Attempts: {result.attemptCount} • Last: {formatDate(result.lastAttemptDate)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};