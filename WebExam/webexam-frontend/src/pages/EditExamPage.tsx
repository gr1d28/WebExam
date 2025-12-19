// src/pages/EditExamPage.tsx (обновленная версия)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Alert,
    LinearProgress,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    IconButton,
    Card,
    CardContent,
    FormControlLabel,
    Switch,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    ArrowBack,
    Save,
    Delete,
    Add,
    Close,
    AccessTime,
    School,
    CheckBox,
    RadioButtonChecked,
    ShortText,
    Code,
    Delete as DeleteIcon,
    Edit,
} from '@mui/icons-material';
import { examApi, ExamById, Question, CreateQuestionRequest, CreateAnswerOptionRequest } from '../api/examApi';
import { useAuth } from '../context/AuthContext';

export const EditExamPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [exam, setExam] = useState<ExamById | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    // Диалог редактирования вопроса
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<CreateQuestionRequest>({
        text: '',
        type: 1,
        points: 1,
        order: 0,
        answerOptions: [
            { text: '', isCorrect: false, order: 0 },
            { text: '', isCorrect: false, order: 1 },
        ],
    });

    // Форма экзамена
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: 60,
        passingScore: 70,
        maxAttempts: 3,
        isPublished: false,
    });

    // Новый вопрос
    const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
        text: '',
        type: 1,
        points: 1,
        order: 0,
        answerOptions: [
            { text: '', isCorrect: false, order: 0 },
            { text: '', isCorrect: false, order: 1 },
        ],
    });

    useEffect(() => {
        if (examId && user?.role === 2) {
            loadExam();
        }
    }, [examId, user]);

    const loadExam = async () => {
        try {
            setLoading(true);
            const data = await examApi.getExamById(parseInt(examId || '0'));
            setExam(data);

            setFormData({
                title: data.title,
                description: data.description || '',
                durationMinutes: data.durationMinutes,
                passingScore: data.passingScore,
                maxAttempts: data.maxAttempts || 3,
                isPublished: data.isPublished,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load exam');
            console.error('Error loading exam:', err);
        } finally {
            setLoading(false);
        }
    };

    const prepareFullExamData = () => {
        if (!exam) return null;

        return {
            title: formData.title,
            description: formData.description,
            durationMinutes: formData.durationMinutes,
            passingScore: formData.passingScore,
            maxAttempts: formData.maxAttempts,
            isPublished: formData.isPublished,
            questions: exam.questions.map((q, index) => ({
                text: q.text,
                type: q.type,
                points: q.points,
                order: index,
                answerOptions: q.answerOptions.map((a, aIndex) => ({
                    text: a.text,
                    isCorrect: a.isCorrect || false,
                    order: aIndex
                }))
            }))
        };
    };

    const handleSaveExam = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            if (!formData.title.trim()) {
                setError('Exam title is required');
                return;
            }

            const fullExamData = prepareFullExamData();
            if (!fullExamData) {
                setError('Exam data not loaded');
                return;
            }

            await examApi.updateExam(parseInt(examId || '0'), fullExamData);
            setSuccess('Exam updated successfully!');
            await loadExam();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save exam');
            console.error('Error saving exam:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = async () => {
        try {
            if (!newQuestion.text.trim()) {
                setError('Question text is required');
                return;
            }

            // Валидация для вопросов с вариантами
            if (newQuestion.type === 1 || newQuestion.type === 2) {
                const hasEmptyOption = newQuestion.answerOptions.some(opt => !opt.text.trim());
                if (hasEmptyOption) {
                    setError('All options must have text');
                    return;
                }

                const hasCorrectOption = newQuestion.answerOptions.some(opt => opt.isCorrect);
                if (!hasCorrectOption) {
                    setError('At least one option must be marked as correct');
                    return;
                }
            }

            setError('');
            setSuccess('');

            if (!exam) {
                setError('Exam not loaded');
                return;
            }

            // Подготавливаем полные данные экзамена с новым вопросом
            const updatedQuestions = [
                ...exam.questions.map(q => ({
                    text: q.text,
                    type: q.type,
                    points: q.points,
                    order: q.order,
                    answerOptions: q.answerOptions.map(a => ({
                        text: a.text,
                        isCorrect: a.isCorrect || false,
                        order: a.order || 0
                    }))
                })),
                {
                    ...newQuestion,
                    order: exam.questions.length
                }
            ];

            const fullExamData = {
                ...formData,
                questions: updatedQuestions
            };

            await examApi.updateExam(parseInt(examId || '0'), fullExamData);

            // Сбрасываем форму
            setNewQuestion({
                text: '',
                type: 1,
                points: 1,
                order: 0,
                answerOptions: [
                    { text: '', isCorrect: false, order: 0 },
                    { text: '', isCorrect: false, order: 1 },
                ],
            });

            setSuccess('Question added successfully!');
            await loadExam();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add question');
            console.error('Error adding question:', err);
        }
    };

    const handleDeleteQuestion = async (questionId: number) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            if (!exam) return;

            const updatedQuestions = exam.questions
                .filter(q => q.id !== questionId)
                .map((q, index) => ({
                    text: q.text,
                    type: q.type,
                    points: q.points,
                    order: index,
                    answerOptions: q.answerOptions.map((a, aIndex) => ({
                        text: a.text,
                        isCorrect: a.isCorrect || false,
                        order: aIndex
                    }))
                }));

            const fullExamData = {
                ...formData,
                questions: updatedQuestions
            };

            await examApi.updateExam(parseInt(examId || '0'), fullExamData);
            setSuccess('Question deleted successfully!');
            await loadExam();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete question');
            console.error('Error deleting question:', err);
        }
    };

    const handleEditQuestion = (index: number) => {
        if (!exam) return;

        const question = exam.questions[index];
        setEditingQuestionIndex(index);
        setEditingQuestion({
            text: question.text,
            type: question.type,
            points: question.points,
            order: question.order,
            answerOptions: question.answerOptions.map(a => ({
                text: a.text,
                isCorrect: a.isCorrect || false,
                order: a.order || 0
            }))
        });
        setEditDialogOpen(true);
    };

    const handleSaveEditedQuestion = async () => {
        try {
            if (!exam || editingQuestionIndex === null) return;

            if (!editingQuestion.text.trim()) {
                setError('Question text is required');
                return;
            }

            const originalQuestion = exam.questions[editingQuestionIndex];

            const updatedQuestions = [...exam.questions];
            updatedQuestions[editingQuestionIndex] = {
                ...originalQuestion,
                text: editingQuestion.text,
                type: editingQuestion.type,
                points: editingQuestion.points,
                answerOptions: editingQuestion.answerOptions.map((opt, i) => {
                    const existingOption = originalQuestion.answerOptions[i];
                    return {
                        id: existingOption?.id,
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        order: i
                    };
                })
            };

            const fullExamData = {
                id: exam.id,
                ...formData,
                questions: updatedQuestions.map((q, index) => ({
                    text: q.text,
                    type: q.type,
                    points: q.points,
                    order: index,
                    answerOptions: q.answerOptions.map((a, aIndex) => ({
                        text: a.text,
                        isCorrect: a.isCorrect || false,
                        order: aIndex
                    }))
                }))
            };

            await examApi.updateExam(parseInt(examId || '0'), fullExamData);

            setEditDialogOpen(false);
            setEditingQuestionIndex(null);
            setSuccess('Question updated successfully!');
            await loadExam();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update question');
            console.error('Error updating question:', err);
        }
    };

    // Вспомогательные функции (остаются такими же)
    const handleQuestionTypeChange = (e: any, isEditing: boolean = false) => {
        const type = parseInt(e.target.value);

        if (isEditing) {
            setEditingQuestion(prev => ({
                ...prev,
                type,
                answerOptions: (type === 3 || type === 4) ? [] :
                    prev.answerOptions.length > 0 ? prev.answerOptions : [
                        { text: '', isCorrect: false, order: 0 },
                        { text: '', isCorrect: false, order: 1 },
                    ]
            }));
        } else {
            setNewQuestion(prev => ({
                ...prev,
                type,
                answerOptions: (type === 3 || type === 4) ? [] :
                    prev.answerOptions.length > 0 ? prev.answerOptions : [
                        { text: '', isCorrect: false, order: 0 },
                        { text: '', isCorrect: false, order: 1 },
                    ]
            }));
        }
    };

    const handleOptionTextChange = (index: number, text: string, isEditing: boolean = false) => {
        if (isEditing) {
            const updatedOptions = [...editingQuestion.answerOptions];
            updatedOptions[index] = { ...updatedOptions[index], text };
            setEditingQuestion(prev => ({ ...prev, answerOptions: updatedOptions }));
        } else {
            const updatedOptions = [...newQuestion.answerOptions];
            updatedOptions[index] = { ...updatedOptions[index], text };
            setNewQuestion(prev => ({ ...prev, answerOptions: updatedOptions }));
        }
    };

    const handleOptionCorrectChange = (index: number, isEditing: boolean = false) => {
        if (isEditing) {
            const updatedOptions = [...editingQuestion.answerOptions];
            const currentOption = updatedOptions[index];

            if (editingQuestion.type === 1) {
                updatedOptions.forEach((opt, i) => {
                    updatedOptions[i] = { ...opt, isCorrect: i === index };
                });
            } else {
                updatedOptions[index] = { ...currentOption, isCorrect: !currentOption.isCorrect };
            }

            setEditingQuestion(prev => ({ ...prev, answerOptions: updatedOptions }));
        } else {
            const updatedOptions = [...newQuestion.answerOptions];
            const currentOption = updatedOptions[index];

            if (newQuestion.type === 1) {
                updatedOptions.forEach((opt, i) => {
                    updatedOptions[i] = { ...opt, isCorrect: i === index };
                });
            } else {
                updatedOptions[index] = { ...currentOption, isCorrect: !currentOption.isCorrect };
            }

            setNewQuestion(prev => ({ ...prev, answerOptions: updatedOptions }));
        }
    };

    const addOption = (isEditing: boolean = false) => {
        if (isEditing) {
            setEditingQuestion(prev => ({
                ...prev,
                answerOptions: [
                    ...prev.answerOptions,
                    { text: '', isCorrect: false, order: prev.answerOptions.length }
                ]
            }));
        } else {
            setNewQuestion(prev => ({
                ...prev,
                answerOptions: [
                    ...prev.answerOptions,
                    { text: '', isCorrect: false, order: prev.answerOptions.length }
                ]
            }));
        }
    };

    const removeOption = (index: number, isEditing: boolean = false) => {
        if (isEditing) {
            if (editingQuestion.answerOptions.length <= 2) {
                setError('Question must have at least 2 options');
                return;
            }

            const updatedOptions = editingQuestion.answerOptions
                .filter((_, i) => i !== index)
                .map((opt, i) => ({ ...opt, order: i }));

            setEditingQuestion(prev => ({ ...prev, answerOptions: updatedOptions }));
        } else {
            if (newQuestion.answerOptions.length <= 2) {
                setError('Question must have at least 2 options');
                return;
            }

            const updatedOptions = newQuestion.answerOptions
                .filter((_, i) => i !== index)
                .map((opt, i) => ({ ...opt, order: i }));

            setNewQuestion(prev => ({ ...prev, answerOptions: updatedOptions }));
        }
    };

    // Остальные функции (handleFormChange, handleSwitchChange, etc.) остаются без изменений
    // ... (они такие же как в предыдущей версии)

    const getQuestionTypeIcon = (type: number) => {
        switch (type) {
            case 1: return <RadioButtonChecked fontSize="small" />;
            case 2: return <CheckBox fontSize="small" />;
            case 3: return <ShortText fontSize="small" />;
            case 4: return <Code fontSize="small" />;
            default: return <RadioButtonChecked fontSize="small" />;
        }
    };

    const getQuestionTypeLabel = (type: number) => {
        switch (type) {
            case 1: return 'Single Choice';
            case 2: return 'Multiple Choice';
            case 3: return 'Text Answer';
            case 4: return 'Code Answer';
            default: return 'Unknown';
        }
    };

    const handleBack = () => {
        navigate('/exams');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <LinearProgress />
            </Container>
        );
    }

    if (!exam || user?.role !== 2) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">
                    Exam not found or you don't have permission to edit it.
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                >
                    Back to Exams
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" component="h1">
                    Edit Exam: {exam.title}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Основная информация экзамена */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Exam Information
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                        <TextField
                            label="Exam Title *"
                            name="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <TextField
                            label="Duration (minutes) *"
                            name="durationMinutes"
                            type="number"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                durationMinutes: parseInt(e.target.value) || 0
                            }))}
                            fullWidth
                            required
                            InputProps={{
                                endAdornment: <AccessTime fontSize="small" />,
                                inputProps: { min: 1 }
                            }}
                        />

                        <TextField
                            label="Passing Score (%) *"
                            name="passingScore"
                            type="number"
                            value={formData.passingScore}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                passingScore: parseInt(e.target.value) || 0
                            }))}
                            fullWidth
                            required
                            InputProps={{
                                inputProps: { min: 0, max: 100 },
                                endAdornment: <School fontSize="small" />,
                            }}
                        />

                        <TextField
                            label="Max Attempts"
                            name="maxAttempts"
                            type="number"
                            value={formData.maxAttempts}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                maxAttempts: parseInt(e.target.value) || 1
                            }))}
                            fullWidth
                            InputProps={{
                                inputProps: { min: 1, max: 10 }
                            }}
                        />

                        <FormControl fullWidth>
                            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isPublished}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                isPublished: e.target.checked
                                            }))}
                                            name="isPublished"
                                            color="primary"
                                        />
                                    }
                                    label="Published"
                                />
                                <FormHelperText>
                                    {formData.isPublished ? 'Visible to students' : 'Draft mode'}
                                </FormHelperText>
                            </Box>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                icon={<AccessTime />}
                                label={`${formData.durationMinutes} min`}
                            />
                            <Chip
                                icon={<School />}
                                label={`${formData.passingScore}% to pass`}
                            />
                            <Chip
                                label={`${exam.questionCount} questions`}
                                variant="outlined"
                            />
                            <Chip
                                label={formData.isPublished ? 'Published' : 'Draft'}
                                color={formData.isPublished ? 'success' : 'default'}
                                variant="outlined"
                            />
                        </Box>

                        <Button
                            startIcon={<Save />}
                            onClick={handleSaveExam}
                            variant="contained"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Существующие вопросы */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Questions ({exam.questionCount})
                        </Typography>

                        <Button
                            startIcon={<Delete />}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this exam?')) {
                                    examApi.deleteExam(parseInt(examId || '0')).then(() => {
                                        navigate('/exams');
                                    });
                                }
                            }}
                            variant="outlined"
                            color="error"
                            size="small"
                        >
                            Delete Exam
                        </Button>
                    </Box>

                    {exam.questions.length === 0 ? (
                        <Alert severity="info">
                            No questions yet. Add your first question below.
                        </Alert>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {exam.questions.map((question, index) => (
                                <Paper key={question.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getQuestionTypeIcon(question.type)}
                                            <Typography fontWeight="medium">
                                                Q{index + 1}: {question.text}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditQuestion(index)}
                                                title="Edit question"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteQuestion(question.id)}
                                                color="error"
                                                title="Delete question"
                                            >
                                                <Close />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {getQuestionTypeLabel(question.type)} • Points: {question.points}
                                    </Typography>

                                    {(question.type === 1 || question.type === 2) && question.answerOptions.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Options:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {question.answerOptions.map((option, optIndex) => (
                                                    <Box
                                                        key={option.id}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: option.isCorrect ? 'success.light' : 'grey.50'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                            {question.type === 1 ? (
                                                                <RadioButtonChecked fontSize="small" />
                                                            ) : (
                                                                <CheckBox fontSize="small" />
                                                            )}
                                                            <Typography>{option.text}</Typography>
                                                        </Box>
                                                        {option.isCorrect && (
                                                            <Chip
                                                                label="Correct"
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {(question.type === 3 || question.type === 4) && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Text Answer Type
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                Students will provide a written answer
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Диалог редактирования вопроса */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Question</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <TextField
                            label="Question Text *"
                            value={editingQuestion.text}
                            onChange={(e) => setEditingQuestion(prev => ({ ...prev, text: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Question Type *</InputLabel>
                                <Select
                                    value={editingQuestion.type}
                                    onChange={(e) => handleQuestionTypeChange(e, true)}
                                    label="Question Type *"
                                >
                                    <MenuItem value={1}>Single Choice</MenuItem>
                                    <MenuItem value={2}>Multiple Choice</MenuItem>
                                    <MenuItem value={3}>Text Answer</MenuItem>
                                    <MenuItem value={4}>Code Answer</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Points *"
                                type="number"
                                value={editingQuestion.points}
                                onChange={(e) => setEditingQuestion(prev => ({
                                    ...prev,
                                    points: parseInt(e.target.value) || 1
                                }))}
                                fullWidth
                                inputProps={{ min: 1 }}
                            />
                        </Box>

                        {(editingQuestion.type === 1 || editingQuestion.type === 2) && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Answer Options *
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {editingQuestion.answerOptions.map((option, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                label={`Option ${index + 1}`}
                                                value={option.text}
                                                onChange={(e) => handleOptionTextChange(index, e.target.value, true)}
                                                fullWidth
                                                required
                                            />
                                            <IconButton
                                                onClick={() => handleOptionCorrectChange(index, true)}
                                                color={option.isCorrect ? 'success' : 'default'}
                                                title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                                            >
                                                {editingQuestion.type === 1 ? (
                                                    <RadioButtonChecked />
                                                ) : (
                                                    <CheckBox />
                                                )}
                                            </IconButton>
                                            <IconButton
                                                onClick={() => removeOption(index, true)}
                                                color="error"
                                                disabled={editingQuestion.answerOptions.length <= 2}
                                                title="Remove option"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>

                                <Button
                                    startIcon={<Add />}
                                    onClick={() => addOption(true)}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mt: 1 }}
                                >
                                    Add Option
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEditedQuestion} variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Добавление нового вопроса */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Add New Question
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Question Text *"
                            value={newQuestion.text}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Question Type *</InputLabel>
                                <Select
                                    value={newQuestion.type}
                                    onChange={(e) => handleQuestionTypeChange(e, false)}
                                    label="Question Type *"
                                >
                                    <MenuItem value={1}>Single Choice</MenuItem>
                                    <MenuItem value={2}>Multiple Choice</MenuItem>
                                    <MenuItem value={3}>Text Answer</MenuItem>
                                    <MenuItem value={4}>Code Answer</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Points *"
                                type="number"
                                value={newQuestion.points}
                                onChange={(e) => setNewQuestion(prev => ({
                                    ...prev,
                                    points: parseInt(e.target.value) || 1
                                }))}
                                fullWidth
                                inputProps={{ min: 1 }}
                            />
                        </Box>

                        {(newQuestion.type === 1 || newQuestion.type === 2) && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Answer Options *
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {newQuestion.answerOptions.map((option, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                label={`Option ${index + 1}`}
                                                value={option.text}
                                                onChange={(e) => handleOptionTextChange(index, e.target.value, false)}
                                                fullWidth
                                                required
                                            />
                                            <IconButton
                                                onClick={() => handleOptionCorrectChange(index, false)}
                                                color={option.isCorrect ? 'success' : 'default'}
                                                title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                                            >
                                                {newQuestion.type === 1 ? (
                                                    <RadioButtonChecked />
                                                ) : (
                                                    <CheckBox />
                                                )}
                                            </IconButton>
                                            <IconButton
                                                onClick={() => removeOption(index, false)}
                                                color="error"
                                                disabled={newQuestion.answerOptions.length <= 2}
                                                title="Remove option"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>

                                <Button
                                    startIcon={<Add />}
                                    onClick={() => addOption(false)}
                                    variant="outlined"
                                    size="small"
                                    sx={{ mt: 1 }}
                                >
                                    Add Option
                                </Button>

                                <FormHelperText sx={{ mt: 1 }}>
                                    {newQuestion.type === 1
                                        ? 'Select exactly one correct answer'
                                        : 'Select one or more correct answers'}
                                </FormHelperText>
                            </Box>
                        )}

                        <Button
                            startIcon={<Add />}
                            onClick={handleAddQuestion}
                            variant="contained"
                            sx={{ alignSelf: 'flex-start' }}
                            disabled={!newQuestion.text.trim()}
                        >
                            Add Question
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Back to Exams
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<Save />}
                        onClick={handleSaveExam}
                        variant="contained"
                        disabled={saving}
                    >
                        Save All Changes
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};