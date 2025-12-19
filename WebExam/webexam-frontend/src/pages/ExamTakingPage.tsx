import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { examTakingApi } from '../api/examTakingApi';
import { examApi } from '../api/examApi';
import { Exam, Question, AnswerOption } from '../api/examApi';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    Checkbox,
    TextField,
    FormControl,
    FormLabel,
    LinearProgress,
    Alert,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { Timer, NavigateNext, Send, PlayArrow } from '@mui/icons-material';

interface FormData {
    selectedOptionIds: number[];
    answerText: string;
}

export const ExamTakingPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<Exam | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [questionIndex, setQuestionIndex] = useState(0);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { isSubmitting },
    } = useForm<FormData>();

    useEffect(() => {
        initializeExam();
        const timer = setInterval(() => {
            setTimeRemaining((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [examId]);

    const initializeExam = async () => {
        try {
            setLoading(true);
            const examData = await examApi.getExamForTaking(Number(examId));
            setExam(examData);

            // Проверяем активную сессию или начинаем новую
            try {
                const activeSession = await examTakingApi.getActiveSession(Number(examId));
                setSessionId(activeSession.id);
                setTimeRemaining(activeSession.timeRemainingSeconds);
                await loadNextQuestion(activeSession.id);
            } catch {
                // Нет активной сессии, начнем позже
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load exam');
        } finally {
            setLoading(false);
        }
    };

    const startExam = async () => {
        try {
            const session = await examTakingApi.startExam({ examId: Number(examId) });
            setSessionId(session.id);
            setTimeRemaining(session.timeRemainingSeconds);
            setCurrentQuestion(session.currentQuestion || null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start exam');
        }
    };

    const loadNextQuestion = async (sessionId: number) => {
        try {
            const question = await examTakingApi.getNextQuestion(sessionId);
            setCurrentQuestion(question);
            if (question) {
                reset({
                    selectedOptionIds: [],
                    answerText: '',
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load question');
        }
    };

    const onSubmitAnswer = async (data: FormData) => {
        if (!sessionId || !currentQuestion) return;

        try {
            const selectedOptionIds = Array.isArray(data.selectedOptionIds)
                ? data.selectedOptionIds.map(id => Number(id)).filter(id => !isNaN(id))
                : data.selectedOptionIds
                    ? [Number(data.selectedOptionIds)].filter(id => !isNaN(id))
                    : [];
            const answerText = (data.answerText) ? data.answerText : '';
            await examTakingApi.submitAnswer(sessionId, {
                questionId: currentQuestion.id,
                selectedOptionIds: selectedOptionIds,
                answerText: answerText,
            });

            // Загружаем следующий вопрос
            await loadNextQuestion(sessionId);
            setQuestionIndex((prev) => prev + 1);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit answer');
        }
    };

    const submitExam = async () => {
        if (!sessionId) return;

        try {
            await examTakingApi.submitExam(sessionId);
            navigate(`/results/${sessionId}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit exam');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <LinearProgress />;
    }

    if (!exam) {
        return (
            <Container>
                <Alert severity="error">Exam not found</Alert>
            </Container>
        );
    }

    if (!sessionId) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        {exam.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {exam.description}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6">Exam Details:</Typography>
                        <Typography>Duration: {exam.durationMinutes} minutes</Typography>
                        <Typography>Questions: {exam.questionCount}</Typography>
                        <Typography>Passing Score: {exam.passingScore}%</Typography>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={startExam}
                        startIcon={<PlayArrow />}
                    >
                        Start Exam
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        All questions answered!
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={submitExam}
                        startIcon={<Send />}
                    >
                        Submit Exam
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Header */}
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{exam.title}</Typography>
                <Box display="flex" alignItems="center">
                    <Timer sx={{ mr: 1 }} />
                    <Typography variant="h6">{formatTime(timeRemaining)}</Typography>
                </Box>
            </Paper>

            {/* Progress */}
            <Stepper activeStep={questionIndex} sx={{ mb: 3 }}>
                {Array.from({ length: exam.questionCount }).map((_, index) => (
                    <Step key={index}>
                        <StepLabel>{`Question ${index + 1}`}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Question */}
            <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Question {questionIndex + 1} of {exam.questionCount}
                </Typography>
                <Typography variant="body1" paragraph>
                    {currentQuestion.text}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Points: {currentQuestion.points}
                </Typography>
            </Paper>

            {/* Answer Form */}
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmitAnswer)}>
                    {currentQuestion.type === 1 && (
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend">Select one answer:</FormLabel>
                            <RadioGroup>
                                {currentQuestion.answerOptions.map((option) => (
                                    <FormControlLabel
                                        key={option.id}
                                        value={option.id}
                                        control={<Radio {...register('selectedOptionIds.0')} />}
                                        label={option.text}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    )}

                    {currentQuestion.type === 2 && (
                        <FormControl component="fieldset" fullWidth>
                            <FormLabel component="legend">Select all that apply:</FormLabel>
                            {currentQuestion.answerOptions.map((option) => (
                                <FormControlLabel
                                    key={option.id}
                                    control={
                                        <Checkbox
                                            value={option.id}
                                            {...register('selectedOptionIds')}
                                        />
                                    }
                                    label={option.text}
                                />
                            ))}
                        </FormControl>
                    )}

                    {currentQuestion.type === 3 && (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Your answer"
                            {...register('answerText')}
                            placeholder="Type your answer here..."
                        />
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            endIcon={<NavigateNext />}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Next Question'}
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={submitExam}
                            startIcon={<Send />}
                        >
                            Submit Exam
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};