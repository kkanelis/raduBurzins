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
        const response = await api.post('/api/register', userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return response;
    };

    const logout = async () => {
        try {
            await api.post('/api/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
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
