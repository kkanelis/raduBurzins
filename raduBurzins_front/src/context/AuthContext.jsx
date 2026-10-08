import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AuthContext from './AuthContextValue';

// Authentication context shared across the frontend
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore stored session and verify auth state on app load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
            }
        }
        checkAuth();
    }, []);

    useEffect(() => {
        const handleUnauthorized = () => setUser(null);
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/api/user');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (nextUser) => {
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
    };

    const login = async (email, password) => {
        const response = await api.post('/api/login', {
            email,
            password
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return response;
    };

    const register = async (userData) => {
        return api.post('/api/register', userData);
    };

    const logout = async () => {
        try {
            await api.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            checkAuth,
            updateUser,
            isAuthenticated: !!user
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
