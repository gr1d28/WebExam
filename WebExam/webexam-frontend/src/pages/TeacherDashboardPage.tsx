import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { examApi } from '../api/examApi';
import { resultsApi, ExamStatistics } from '../api/resultsApi';
import { Exam } from '../api/examApi';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    LinearProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import {
    School,
    Assignment,
    People,
    TrendingUp,
    Assessment,
    Add,
    Edit,
    Visibility,
    CheckCircle,
    Cancel,
} from '@mui/icons-material';

export const TeacherDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [overallStats, setOverallStats] = useState({
        totalExams: 0,
        publishedExams: 0,
        totalAttempts: 0,
        totalPassed: 0,
        overallPassRate: 0,
        averageScore: 0,
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setLoadingStats(true);

            // Загружаем все экзамены (включая неопубликованные)
            const examsData = await examApi.getExams(false);
            setExams(examsData);

            // Рассчитываем базовую статистику из данных экзаменов
            const publishedExams = examsData.filter(exam => exam.isPublished);

            // Инициализируем базовые значения
            const baseStats = {
                totalExams: examsData.length,
                publishedExams: publishedExams.length,
                totalAttempts: 0,
                totalPassed: 0,
                overallPassRate: 0,
                averageScore: 0,
            };

            setOverallStats(baseStats);
            setLoading(false);

            // Затем загружаем статистику для опубликованных экзаменов
            await loadExamStatistics(publishedExams);

        } catch (err: any) {
            console.error('Failed to load dashboard data:', err);
            setLoading(false);
            setLoadingStats(false);
        }
    };

    const loadExamStatistics = async (publishedExams: Exam[]) => {
        try {
            let totalAttempts = 0;
            let totalPassed = 0;
            let totalAverageScore = 0;
            let examsWithStats = 0;

            // Загружаем статистику только для опубликованных экзаменов
            for (const exam of publishedExams) {
                try {
                    const stats = await resultsApi.getExamStatistics(exam.id);

                    if (stats && stats.totalAttempts > 0) {
                        totalAttempts += stats.totalAttempts;
                        totalPassed += stats.passedAttempts;
                        totalAverageScore += stats.averageScore;
                        examsWithStats++;
                    }

                    console.log('Iter: ', stats);
                } catch (err) {
                    console.warn(`No statistics for exam ${exam.id}:`, err);
                    // Пропускаем экзамены без статистики
                }
            }

            console.log('Final aggregated stats:', {
                totalAttempts,
                totalPassed,
                examsWithStats,
                averageScore: examsWithStats > 0 ? Math.round(totalAverageScore / examsWithStats) : 0,
                passRate: totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0
            });

            // Обновляем статистику
            setOverallStats(prev => ({
                ...prev,
                totalAttempts,
                totalPassed,
                overallPassRate: totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0,
                averageScore: examsWithStats > 0 ? Math.round(totalAverageScore / examsWithStats) : 0,
            }));

        } catch (err) {
            console.error('Failed to load exam statistics:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleCreateExam = () => {
        navigate('/exam/create');
    };

    const handleManageExams = () => {
        navigate('/exams');
    };

    const handleEditExam = (examId: number) => {
        navigate(`/exam/${examId}/edit`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Teacher Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage exams and track student performance
                </Typography>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreateExam}
                            >
                                Create New Exam
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Assignment />}
                                onClick={handleManageExams}
                            >
                                Manage Exams
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Overall Statistics */}
            {loadingStats ? (
                <Box sx={{ mb: 4 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        Loading statistics...
                    </Typography>
                </Box>
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                    mb: 4
                }}>
                    {/* Total Exams */}
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <School sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{overallStats.totalExams}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Exams
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Total Attempts */}
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">{overallStats.totalAttempts}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Attempts
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Average Score */}
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">
                                        {overallStats.averageScore > 0 ? `${overallStats.averageScore}%` : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Avg. Score
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Pass Rate */}
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Assessment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">
                                        {overallStats.overallPassRate > 0 ? `${overallStats.overallPassRate}%` : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pass Rate
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Exams List */}
            <Card>
                <CardContent>
                    {exams.length === 0 ? (
                        <Alert severity="info">
                            No exams created yet. Click "Create New Exam" to get started.
                        </Alert>
                    ) : (
                        <>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Questions</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Created</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {exams.slice(0, 5).map((exam) => (
                                            <TableRow key={exam.id} hover>
                                                <TableCell>
                                                    <Typography fontWeight="medium">
                                                        {exam.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {exam.description.substring(0, 50)}...
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={exam.isPublished ? 'Published' : 'Draft'}
                                                        size="small"
                                                        color={exam.isPublished ? 'success' : 'default'}
                                                        icon={exam.isPublished ? <CheckCircle /> : <Cancel />}
                                                    />
                                                </TableCell>
                                                <TableCell>{exam.questionCount}</TableCell>
                                                <TableCell>{exam.durationMinutes} min</TableCell>
                                                <TableCell>{formatDate(exam.createdAt)}</TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<Edit />}
                                                            onClick={() => handleEditExam(exam.id)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {exams.length > 5 && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Button onClick={handleManageExams}>
                                        View All Exams ({exams.length})
                                    </Button>
                                </Box>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};