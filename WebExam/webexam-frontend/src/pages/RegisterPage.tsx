import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';

const schema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    role: yup.number().oneOf([1, 2, 3]).required('Role is required'),
});

type FormData = yup.InferType<typeof schema>;

export const RegisterPage: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState<string>('');
    const [success, setSuccess] = React.useState<string>('');

    const {
        register: registerForm,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            role: 1,
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError('');
            setSuccess('');

            // Удаляем confirmPassword перед отправкой
            const { confirmPassword, ...registerData } = data;
            await register(registerData);

            setSuccess('Registration successful! Redirecting to dashboard...');
            setTimeout(() => navigate('/'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                autoComplete="given-name"
                                {...registerForm('firstName')}
                                error={!!errors.firstName}
                                helperText={errors.firstName?.message}
                            />

                            <TextField
                                fullWidth
                                label="Last Name"
                                autoComplete="family-name"
                                {...registerForm('lastName')}
                                error={!!errors.lastName}
                                helperText={errors.lastName?.message}
                            />
                        </Box>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email Address"
                            autoComplete="email"
                            {...registerForm('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            {...registerForm('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            autoComplete="new-password"
                            {...registerForm('confirmPassword')}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                        />

                        <FormControl fullWidth margin="normal" error={!!errors.role}>
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                label="Role"
                                {...registerForm('role')}
                            >
                                <MenuItem value={1}>Student</MenuItem>
                                <MenuItem value={2}>Teacher</MenuItem>
                                <MenuItem value={3}>Admin</MenuItem>
                            </Select>
                            {errors.role && (
                                <FormHelperText>{errors.role.message}</FormHelperText>
                            )}
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Already have an account? Sign In
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};