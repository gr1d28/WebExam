import React, { useState } from 'react';
import { useForm, useFieldArray, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../api/examApi';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    IconButton,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Divider,
    Select,
    MenuItem,
    InputLabel,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';

// Схема валидации
const examSchema = yup.object({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    description: yup.string().required('Description is required'),
    durationMinutes: yup.number()
        .required('Duration is required')
        .min(1, 'Duration must be at least 1 minute')
        .max(300, 'Duration cannot exceed 300 minutes'),
    passingScore: yup.number()
        .required('Passing score is required')
        .min(0, 'Passing score must be at least 0%')
        .max(100, 'Passing score cannot exceed 100%'),
    maxAttempts: yup.number()
        .required('Max attempts is required')
        .min(1, 'At least 1 attempt is required')
        .max(10, 'Cannot exceed 10 attempts'),
    isPublished: yup.boolean().required().default(false),
    questions: yup.array().of(
        yup.object({
            text: yup.string().required('Question text is required'),
            type: yup.number().oneOf([1, 2, 3, 4]).required('Question type is required'),
            points: yup.number()
                .required('Points are required')
                .min(1, 'Minimum 1 point')
                .max(100, 'Maximum 100 points'),
            order: yup.number().required(),
            answerOptions: yup.array().of(
                yup.object({
                    text: yup.string().required('Option text is required'),
                    isCorrect: yup.boolean().required().default(false),
                    order: yup.number().nullable().optional(),
                })
            ).required().default([]),
        })
    ).min(1, 'At least 1 question is required'),
});

// questions type (1 === 'Single Choice', 2 === 'Multiple Choice', 3 === 'Text Answer')

type FormData = {
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    maxAttempts: number;
    isPublished: boolean;
    questions: {
        text: string;
        type: number;
        points: number;
        order: number;
        answerOptions: {
            text: string;
            isCorrect: boolean;
            order: number | null;
        }[];
    }[];
};

export const CreateExamPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: yupResolver(examSchema) as Resolver<FormData>,
        defaultValues: {
            title: '',
            description: '',
            durationMinutes: 60,
            passingScore: 60,
            maxAttempts: 1,
            isPublished: false,
            questions: [
                {
                    text: '',
                    type: 1,
                    points: 1,
                    order: 0,
                    answerOptions: [
                        { text: '', isCorrect: false, order: 0 },
                        { text: '', isCorrect: false, order: 1 },
                    ],
                },
            ],
        },
    });

    const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: 'questions',
    });

    const steps = ['Exam Details', 'Questions', 'Review'];

    const handleNext = (e: React.MouseEvent) => {
        // Чтобы предотвратить поведение по умолчанию (Отправки экзамена при заполнении формы)
        e.preventDefault();
        e.stopPropagation();

        setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    };

    const handleBack = () => {
        setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
    };

    const handleSingleChoiceSelect = (questionIndex: number, optionIndex: number) => {
        const allOptions = watch(`questions.${questionIndex}.answerOptions`);
        const updatedOptions = allOptions.map((opt, idx) => ({
            ...opt,
            isCorrect: idx === optionIndex
        }));

        setValue(`questions.${questionIndex}.answerOptions`, updatedOptions);
    };

    const addQuestion = () => {
        const newOrder = questions.length;
        appendQuestion({
            text: '',
            type: 1,
            points: 1,
            order: newOrder,
            answerOptions: [
                { text: '', isCorrect: false, order: 0 },
                { text: '', isCorrect: false, order: 1 },
            ],
        });
    };

    const addOption = (questionIndex: number) => {
        const currentOptions = watch(`questions.${questionIndex}.answerOptions`) || [];
        const newOptions = [...currentOptions, {
            text: '',
            isCorrect: false,
            order: currentOptions.length
        }];

        setValue(`questions.${questionIndex}.answerOptions`, newOptions);
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const currentOptions = watch(`questions.${questionIndex}.answerOptions`) || [];
        if (currentOptions.length > 2) {
            const newOptions = currentOptions.filter((_, idx) => idx !== optionIndex)
                .map((opt, idx) => ({ ...opt, order: idx })); // Обновляем порядок

            setValue(`questions.${questionIndex}.answerOptions`, newOptions);
        }
    };

    const onSubmit = async (data: FormData) => {
        console.log('onSubmit вызвана!', data);
        try {
            setError('');
            setSuccess('');

            // Преобразуем данные для отправки
            const examData = {
                ...data,
                questions: data.questions.map((q, index) => ({
                    ...q,
                    order: index,
                    answerOptions: q.answerOptions?.map((opt, optIndex) => ({
                        ...opt,
                        order: optIndex,
                    })) || [],
                })),
            };

            const response = await examApi.createExam(examData);

            setSuccess('Exam created successfully!');
            setTimeout(() => {
                navigate(`/exam/${response.id}/edit`);
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create exam');
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Exam Title"
                                    fullWidth
                                    error={!!errors.title}
                                    helperText={errors.title?.message}
                                    placeholder="Enter exam title"
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                    placeholder="Enter exam description"
                                />
                            )}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                            <Controller
                                name="durationMinutes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Duration (minutes)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.durationMinutes}
                                        helperText={errors.durationMinutes?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="passingScore"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Passing Score (%)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.passingScore}
                                        helperText={errors.passingScore?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="maxAttempts"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Max Attempts"
                                        type="number"
                                        fullWidth
                                        error={!!errors.maxAttempts}
                                        helperText={errors.maxAttempts?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="isPublished"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            {...field}
                                            label="Status"
                                            value={field.value ? 'published' : 'draft'}
                                            onChange={(e) => field.onChange(e.target.value === 'published')}
                                        >
                                            <MenuItem value="draft">Draft</MenuItem>
                                            <MenuItem value="published">Published</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Box>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {questions.map((question, questionIndex) => (
                            <Card key={question.id} variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            Question {questionIndex + 1}
                                        </Typography>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => removeQuestion(questionIndex)}
                                                disabled={questions.length <= 1}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {/* Question Text */}
                                        <Controller
                                            name={`questions.${questionIndex}.text`}
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Question Text"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    error={!!errors.questions?.[questionIndex]?.text}
                                                    helperText={errors.questions?.[questionIndex]?.text?.message}
                                                />
                                            )}
                                        />

                                        {/* Question Type and Points */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                            <Controller
                                                name={`questions.${questionIndex}.type`}
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth>
                                                        <InputLabel>Question Type</InputLabel>
                                                        <Select {...field} label="Question Type">
                                                            <MenuItem value={1}>Single Choice</MenuItem>
                                                            <MenuItem value={2}>Multiple Choice</MenuItem>
                                                            <MenuItem value={3}>Text Answer</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            />

                                            <Controller
                                                name={`questions.${questionIndex}.points`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        label="Points"
                                                        type="number"
                                                        fullWidth
                                                        error={!!errors.questions?.[questionIndex]?.points}
                                                        helperText={errors.questions?.[questionIndex]?.points?.message}
                                                    />
                                                )}
                                            />
                                        </Box>

                                        {/* Answer Options (for choice questions) */}
                                        {(watch(`questions.${questionIndex}.type`) === 1 ||
                                            watch(`questions.${questionIndex}.type`) === 2) && (
                                                <>
                                                    <Divider sx={{ my: 2 }} />

                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Answer Options
                                                    </Typography>

                                                    {watch(`questions.${questionIndex}.answerOptions`)?.map((option, optionIndex) => (
                                                        <Box key={optionIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <DragIndicatorIcon sx={{ color: 'action.active' }} />

                                                            <Controller
                                                                name={`questions.${questionIndex}.answerOptions.${optionIndex}.text`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        label={`Option ${optionIndex + 1}`}
                                                                        fullWidth
                                                                        size="small"
                                                                    />
                                                                )}
                                                            />

                                                            {watch(`questions.${questionIndex}.type`) === 1 ? (
                                                                <Controller
                                                                    name={`questions.${questionIndex}.answerOptions.${optionIndex}.isCorrect`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Radio
                                                                            checked={field.value}
                                                                            onChange={() => handleSingleChoiceSelect(questionIndex, optionIndex)}
                                                                        />
                                                                    )}
                                                                />
                                                            ) : (
                                                                <Controller
                                                                    name={`questions.${questionIndex}.answerOptions.${optionIndex}.isCorrect`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <Checkbox
                                                                            checked={field.value}
                                                                            onChange={field.onChange}
                                                                        />
                                                                    )}
                                                                />
                                                            )}

                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeOption(questionIndex, optionIndex)}
                                                                disabled={(watch(`questions.${questionIndex}.answerOptions`)?.length || 0) <= 2}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    ))}

                                                    <Button
                                                        startIcon={<AddIcon />}
                                                        onClick={() => addOption(questionIndex)}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ alignSelf: 'flex-start' }}
                                                    >
                                                        Add Option
                                                    </Button>
                                                </>
                                            )}

                                        {/* Text Answer Info */}
                                        {watch(`questions.${questionIndex}.type`) === 3 && (
                                            <Alert severity="info">
                                                Text answers will be evaluated manually by the teacher.
                                            </Alert>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={addQuestion}
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Add Question
                        </Button>
                    </Box>
                );

            case 2:
                const title = watch('title');
                const description = watch('description');
                const durationMinutes = watch('durationMinutes');
                const passingScore = watch('passingScore');
                const maxAttempts = watch('maxAttempts');
                const isPublished = watch('isPublished');
                const questions_form = watch('questions');
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Exam Summary */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Exam Summary
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Title:</Typography>
                                    <Typography variant="body1">{title}</Typography>

                                    <Typography variant="body2" color="text.secondary">Description:</Typography>
                                    <Typography variant="body1">{description}</Typography>

                                    <Typography variant="body2" color="text.secondary">Duration:</Typography>
                                    <Typography variant="body1">{durationMinutes} minutes</Typography>

                                    <Typography variant="body2" color="text.secondary">Passing Score:</Typography>
                                    <Typography variant="body1">{passingScore}%</Typography>

                                    <Typography variant="body2" color="text.secondary">Max Attempts:</Typography>
                                    <Typography variant="body1">{maxAttempts}</Typography>

                                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                                    <Typography variant="body1">
                                        <Chip
                                            label={isPublished ? 'Published' : 'Draft'}
                                            color={isPublished ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Questions Summary */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Questions ({questions_form.length})
                                </Typography>
                                {questions_form.map((question, index) => (
                                    <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle1">
                                            {index + 1}. {question.text}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip label={question.type} size="small" />
                                            <Chip label={`${question.points} points`} size="small" variant="outlined" />
                                        </Box>

                                        {question.type !== 3 && question.answerOptions && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Options:
                                                </Typography>
                                                {question.answerOptions.map((option, optIndex) => (
                                                    <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2">
                                                            {optIndex + 1}. {option.text}
                                                        </Typography>
                                                        {option.isCorrect && (
                                                            <Chip label="Correct" color="success" size="small" />
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">
                    Create New Exam
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

            <Paper sx={{ p: 3 }}>
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {renderStepContent(activeStep)}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            variant="outlined"
                        >
                            Back
                        </Button>

                        {activeStep < steps.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                variant="contained"
                                type="button"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                startIcon={<SaveIcon />}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Exam'}
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>

            {/* Quick Tips */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
                <Typography variant="subtitle2" color="info.contrastText" gutterBottom>
                    Tips for creating effective exams:
                </Typography>
                <Typography variant="body2" color="info.contrastText">
                    • Write clear and concise questions<br />
                    • Ensure answer options are distinct<br />
                    • Set appropriate time limits<br />
                    • Test the exam yourself before publishing
                </Typography>
            </Paper>
        </Container>
    );
};