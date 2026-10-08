import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MyEvents from './MyEvents';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('../../services/api', () => ({
  default: { get: mocks.get, post: mocks.post },
}));

afterEach(cleanup);

describe('MyEvents', () => {
  it('lists users from the users-status API response when editing a private event', async () => {
    mocks.get.mockImplementation(async (url) => {
      if (url === '/api/user/special-days') {
        return {
          data: [{
            id: 3,
            title: 'Ģimenes vakars',
            date: '2026-10-13',
            is_public: false,
            shared_with_user_ids: [],
          }],
        };
      }

      return {
        data: { users: [{ id: 7, first_name: 'Jānis', last_name: 'Liepa' }] },
      };
    });
    mocks.post.mockResolvedValue({ data: {} });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MyEvents />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Labot' }));

    const recipientButton = await screen.findByRole('button', {
      name: (name) => name.includes('Jānis') && name.includes('Pievienot'),
    });
    fireEvent.click(recipientButton);
    expect(recipientButton.textContent).toContain('Pievienots');
    fireEvent.click(screen.getByRole('button', { name: 'Saglabāt' }));

    await vi.waitFor(() => expect(mocks.post).toHaveBeenCalled());

    const [url, payload] = mocks.post.mock.calls[0];
    expect(url).toBe('/api/special-days/3');
    expect(payload.getAll('shared_with_user_ids[]')).toEqual(['7']);
  });
});