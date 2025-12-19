import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    LinearProgress,
    Alert,
    Box,
    IconButton,
    Card,
    CardContent,
    Grid,
    Button,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Email,
    Score,
    CheckCircle,
    Cancel,
    CalendarToday,
    AssignmentTurnedIn,
} from '@mui/icons-material';
import { resultsApi, ExamAttempt } from '../api/resultsApi';
import { useAuth } from '../context/AuthContext';

export const ExamResultsPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [stats, setStats] = useState({
        totalAttempts: 0,
        passedAttempts: 0,
        averageScore: 0,
        passRate: 0,
    });

    useEffect(() => {
        if (examId) {
            loadExamAttempts();
        }
    }, [examId]);

    const loadExamAttempts = async () => {
        try {
            setLoading(true);
            setError('');

            const examIdNum = parseInt(examId || '0');
            const data = await resultsApi.getExamAttempts(examIdNum);

            setAttempts(data);

            // Рассчитываем статистику
            if (data.length > 0) {
                const totalAttempts = data.length;
                const passedAttempts = data.filter(attempt => attempt.isPassed).length;
                const averageScore = data.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts;
                const passRate = (passedAttempts / totalAttempts) * 100;

                setStats({
                    totalAttempts,
                    passedAttempts,
                    averageScore,
                    passRate,
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load exam results');
            console.error('Error loading exam attempts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/exams');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <LinearProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={handleBack} sx={{ mr: 2 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" component="h1">
                    Exam Results
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 3,
                    mb: 4
                }}
            >
                <Box>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Attempts
                            </Typography>
                            <Typography variant="h4">
                                {stats.totalAttempts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Passed Attempts
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {stats.passedAttempts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Score
                            </Typography>
                            <Typography variant="h4">
                                {stats.averageScore.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Pass Rate
                            </Typography>
                            <Typography variant="h4">
                                {stats.passRate.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Attempts Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentTurnedIn sx={{ mr: 1 }} />
                        Attempts ({attempts.length})
                    </Typography>

                    {attempts.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No attempts found for this exam.
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Person fontSize="small" sx={{ mr: 1 }} />
                                                Student
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Email fontSize="small" sx={{ mr: 1 }} />
                                                Email
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Score fontSize="small" sx={{ mr: 1 }} />
                                                Score
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                                                Date
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AssignmentTurnedIn fontSize="small" sx={{ mr: 1 }} />
                                                Attempt #
                                            </Box>
                                        </TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Feedback</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attempts.map((attempt) => (
                                        <TableRow key={attempt.resultId} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {attempt.userFullName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {attempt.userEmail}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color={attempt.percentage >= 70 ? 'success.main' : 'error.main'}
                                                >
                                                    {attempt.percentage.toFixed(1)}%
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ({attempt.totalScore}/{attempt.maxPossibleScore})
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(attempt.calculatedAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`#${attempt.attemptNumber}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={attempt.isPassed ? <CheckCircle /> : <Cancel />}
                                                    label={attempt.isPassed ? 'Passed' : 'Failed'}
                                                    color={attempt.isPassed ? 'success' : 'error'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {attempt.feedback ? (
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                        {attempt.feedback}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        No feedback
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Back to Exams
                </Button>

                <Button
                    onClick={loadExamAttempts}
                    variant="contained"
                    disabled={loading}
                >
                    Refresh Results
                </Button>
            </Box>
        </Container>
    );
};