import React, { useState, useEffect } from 'react';
import { examApi } from '../api/examApi';
import { Exam } from '../api/examApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    IconButton,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    AccessTime,
    School,
    Assignment,
    PlayArrow,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

export const ExamListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            setLoading(true);
            const data = await examApi.getExams(user?.role === 1);
            setExams(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = (examId: number) => {
        navigate(`/exam/${examId}/start`);
    };

    const handleViewResults = (examId: number) => {
        navigate(`/exam/${examId}/results`);
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">
                    {user?.role === 1 ? 'Available Exams' : 'My Exams'}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
                {exams.map((exam) => (
                    <Card key={exam.id}>
                            <CardContent>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {exam.title}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {exam.description}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<AccessTime />}
                                        label={`${exam.durationMinutes} min`}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        icon={<School />}
                                        label={`${exam.passingScore}% to pass`}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        icon={<Assignment />}
                                        label={`${exam.questionCount} questions`}
                                        size="small"
                                    />
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    Created by: {exam.createdBy.firstName} {exam.createdBy.lastName}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                {user?.role === 1 ? (
                                    <Button
                                        size="small"
                                        startIcon={<PlayArrow />}
                                        onClick={() => handleStartExam(exam.id)}
                                        variant="contained"
                                        fullWidth
                                    >
                                        Start Exam
                                    </Button>
                                ) : (
                                    <Button
                                        size="small"
                                        onClick={() => handleViewResults(exam.id)}
                                        variant="outlined"
                                        fullWidth
                                    >
                                        View Results
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                ))}
            </Box>

            {exams.length === 0 && !loading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No exams available at the moment.
                </Alert>
            )}
        </Container>
    );
};