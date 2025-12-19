import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { School, ExitToApp } from '@mui/icons-material';

export const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const showRole = (role?: number) => {
        switch (role) {
            case 1:
                return 'Student';
            case 2:
                return 'Teacher';
            case 3:
                return 'Admin';
            default:
                return 'undefined';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <School sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        WebExam System
                    </Typography>

                    <Typography variant="body1" sx={{ mr: 2 }}>
                        {user?.firstName} {user?.lastName} ({showRole(user?.role)})
                    </Typography>

                    <Button
                        color="inherit"
                        onClick={handleLogout}
                        startIcon={<ExitToApp />}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container component="main" sx={{ flex: 1, py: 3 }}>
                <Outlet />
            </Container>

            <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'grey.100' }}>
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" align="center">
                        WebExam System © {new Date().getFullYear()}
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};