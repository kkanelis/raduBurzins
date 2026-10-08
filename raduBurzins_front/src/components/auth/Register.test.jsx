import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('../../services/api', () => ({
    default: { get: mocks.get, post: mocks.post },
}));

afterEach(() => {
    cleanup();
    localStorage.clear();
});

describe('registration approval flow', () => {
    it('shows the pending approval response without storing a token or navigating to a protected route', async () => {
        localStorage.clear();
        mocks.get.mockResolvedValue({ data: [] });
        mocks.post.mockResolvedValue({
            data: {
                status: 'success',
                message: 'Reģistrācija veiksmīga! Tavs lietotāja konts tika nosūtīts apstiprināšanai.',
            },
        });
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter initialEntries={['/register']}>
                        <Routes>
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<div>Login screen</div>} />
                            <Route
                                path="/RegWelcome"
                                element={(
                                    <ProtectedRoute>
                                        <div>Protected welcome</div>
                                    </ProtectedRoute>
                                )}
                            />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>,
        );

        fireEvent.submit(container.querySelector('form'));

        expect((await screen.findByRole('status')).textContent).toContain('nosūtīts apstiprināšanai');
        expect(mocks.post).toHaveBeenCalledWith('/api/register', expect.objectContaining({
            terms: false,
            rules: false,
        }));
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(screen.queryByText('Protected welcome')).toBeNull();
        expect(screen.queryByText('Login screen')).toBeNull();
        await waitFor(() => expect(screen.getByRole('link', { name: 'Pieslēgties' }).getAttribute('href')).toBe('/login'));
    });
});