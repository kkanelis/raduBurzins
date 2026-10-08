import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';

const mocks = vi.hoisted(() => ({
  user: null,
  checkAuth: vi.fn(),
  updateUser: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../../context/useAuth', () => ({
  useAuth: () => ({
    user: mocks.user,
    checkAuth: mocks.checkAuth,
    updateUser: mocks.updateUser,
  }),
}));

vi.mock('../../services/api', () => ({
  default: {
    defaults: { baseURL: 'http://localhost' },
    post: mocks.post,
  },
}));

afterEach(cleanup);

beforeEach(() => {
  mocks.user = {
    id: 5,
    first_name: 'Anna',
    last_name: 'Liepa',
    nickname: '',
    phone: '',
    date_of_birth: null,
    email: 'anna@example.test',
  };
  mocks.checkAuth.mockReset();
  mocks.updateUser.mockReset();
  mocks.post.mockReset();
});

describe('Profile', () => {
  it('submits the profile and refreshes the authenticated user', async () => {
    const updatedUser = { ...mocks.user, first_name: 'Liene' };
    mocks.post.mockResolvedValue({ data: { user: updatedUser } });
    render(<Profile />);

    fireEvent.change(screen.getByLabelText('Vārds'), { target: { value: 'Liene' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saglabāt profilu' }));

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Profila dati atjaunināti.'));

    const [url, payload, config] = mocks.post.mock.calls[0];
    expect(url).toBe('/api/profile');
    expect(payload.get('first_name')).toBe('Liene');
    expect(payload.get('_method')).toBe('PUT');
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
    expect(mocks.updateUser).toHaveBeenCalledWith(updatedUser);
    expect(mocks.checkAuth).toHaveBeenCalledOnce();
  });

  it('shows the API error and stops the saving state when submission fails', async () => {
    mocks.post.mockRejectedValue({ response: { data: { message: 'Saglabāšana neizdevās.' } } });
    render(<Profile />);

    fireEvent.click(screen.getByRole('button', { name: 'Saglabāt profilu' }));

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Saglabāšana neizdevās.'));
    expect(screen.getByRole('button', { name: 'Saglabāt profilu' }).hasAttribute('disabled')).toBe(false);
  });
});