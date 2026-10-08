import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('../services/api', () => ({
    default: { get: mocks.get, post: mocks.post },
}));

function AuthStatus() {
    const { user, logout } = useAuth();
    return (
        <>
            <div>{user?.first_name || 'signed-out'}</div>
            <button type="button" onClick={logout}>Logout</button>
        </>
    );
}

afterEach(() => {
    cleanup();
    localStorage.clear();
});

beforeEach(() => {
    localStorage.clear();
    mocks.get.mockReset().mockResolvedValue({
        data: { id: 9, first_name: 'Anna', last_name: 'Liepa' },
    });
    mocks.post.mockReset().mockResolvedValue({ data: {} });
});

describe('AuthProvider', () => {
    it('clears the authenticated user when the API reports an unauthorized token', async () => {
        localStorage.setItem('token', 'expired-token');
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AuthStatus />
                </AuthProvider>
            </QueryClientProvider>,
        );

        expect(await screen.findByText('Anna')).toBeTruthy();

        fireEvent(window, new Event('auth:unauthorized'));

        await waitFor(() => expect(screen.getByText('signed-out')).toBeTruthy());
    });

    it('clears local authentication when the logout request fails', async () => {
        localStorage.setItem('token', 'active-token');
        localStorage.setItem('user', JSON.stringify({ id: 9, first_name: 'Anna' }));
        mocks.post.mockRejectedValue(new Error('Network unavailable'));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AuthStatus />
                </AuthProvider>
            </QueryClientProvider>,
        );

        expect(await screen.findByText('Anna')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

        await waitFor(() => expect(screen.getByText('signed-out')).toBeTruthy());
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        consoleError.mockRestore();
    });
});