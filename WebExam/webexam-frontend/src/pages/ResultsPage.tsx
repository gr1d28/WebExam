import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultsApi } from '../api/resultsApi';
import { examApi } from '../api/examApi';
import {
    Container,
    Paper,
    Typography,
    Box,
    LinearProgress,
    Alert,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Card,
    CardContent,
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    TrendingUp,
    AccessTime,
    Assignment,
    ArrowBack,
    EmojiEvents,
} from '@mui/icons-material';

export const ResultsPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadResults();
    }, [sessionId]);

    const loadResults = async () => {
        try {
            setLoading(true);
            setError('');

            // Получаем результаты по сессии
            const resultData = await resultsApi.getResultBySession(Number(sessionId));
            setResult(resultData);

            // Получаем информацию об экзамене
            if (resultData.exam) {
                setExam(resultData.exam);
            } else if (resultData.examSession?.examId) {
                const examData = await examApi.getExamById(resultData.examSession.examId);
                setExam(examData);
            } else if (resultData.examId) {
                const examData = await examApi.getExamById(resultData.examId);
                setExam(examData);
            }

        } catch (err: any) {
            console.error('Error loading results:', err);
            setError(err.response?.data?.message || 'Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const loadUserResults = async () => {
        try {
            const userResults = await resultsApi.getUserResults();
            console.log('User results:', userResults);
            // Можно использовать для отображения истории попыток
        } catch (err) {
            console.error('Error loading user results:', err);
        }
    };

    const loadExamStatistics = async (examId: number) => {
        try {
            const statistics = await resultsApi.getExamStatistics(examId);
            console.log('Exam statistics:', statistics);
            // Можно использовать для отображения статистики
        } catch (err) {
            console.error('Error loading exam statistics:', err);
        }
    };

    useEffect(() => {
        if (exam?.id) {
            // Загружаем статистику экзамена, если пользователь - преподаватель или админ
            loadExamStatistics(exam.id);
        }

        // Загружаем историю результатов пользователя
        loadUserResults();
    }, [exam?.id]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 75) return 'info';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const handleRetakeExam = () => {
        if (exam?.id) {
            navigate(`/exam/${exam.id}/start`);
        }
    };

    const handleViewAllExams = () => {
        navigate('/exams');
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4 }}>
                <LinearProgress />
            </Container>
        );
    }

    if (error || !result) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Results not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    variant="contained"
                >
                    Back to Dashboard
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    <EmojiEvents sx={{ verticalAlign: 'middle', mr: 2 }} />
                    Exam Results
                </Typography>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    variant="outlined"
                >
                    Back to Dashboard
                </Button>
            </Box>

            {/* Main Content */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                gap: 3
            }}>
                {/* Left Column - Main Results */}
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">
                            {exam?.title || 'Exam Results'}
                        </Typography>
                        <Chip
                            label={result.isPassed ? 'PASSED' : 'FAILED'}
                            color={result.isPassed ? 'success' : 'error'}
                            icon={result.isPassed ? <CheckCircle /> : <Cancel />}
                        />
                    </Box>

                    {exam?.description && (
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {exam.description}
                        </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Score Cards */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 3,
                        mb: 3
                    }}>
                        {/* Final Score */}
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {result.percentage}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Final Score
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Points Earned */}
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4">
                                    {result.totalScore}/{result.maxPossibleScore}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Points Earned
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Passing Score */}
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4">
                                    {exam?.passingScore || result.passingScore || 60}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Passing Score
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Completion Time */}
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center' }}>
                                <AccessTime sx={{ fontSize: 40, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(result.calculatedAt)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Feedback */}
                    {result.feedback && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Feedback
                            </Typography>
                            <Typography variant="body1">
                                {result.feedback}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Right Column - Details */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        <Assignment sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Exam Details
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Duration"
                                secondary={`${exam?.durationMinutes || 60} minutes`}
                            />
                        </ListItem>
                        <Divider />

                        {exam?.questionCount && (
                            <>
                                <ListItem>
                                    <ListItemText
                                        primary="Questions"
                                        secondary={`${exam.questionCount} total`}
                                    />
                                </ListItem>
                                <Divider />
                            </>
                        )}

                        <ListItem>
                            <ListItemText
                                primary="Attempt Number"
                                secondary={result.attemptNumber || '1'}
                            />
                        </ListItem>
                        <Divider />

                        <ListItem>
                            <ListItemText
                                primary="Completion Time"
                                secondary={formatDate(result.calculatedAt)}
                            />
                        </ListItem>
                    </List>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 3 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleRetakeExam}
                            sx={{ mb: 1 }}
                            disabled={!exam?.id}
                        >
                            Retake Exam
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleViewAllExams}
                        >
                            Browse More Exams
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* Additional Information Section */}
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Additional Information
                </Typography>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2
                }}>
                    {/* Session Details */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                                Session ID
                            </Typography>
                            <Typography variant="body1">
                                {sessionId}
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Exam ID */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                                Exam ID
                            </Typography>
                            <Typography variant="body1">
                                {exam?.id || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Result ID */}
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">
                                Result ID
                            </Typography>
                            <Typography variant="body1">
                                {result.id || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Paper>
        </Container>
    );
};