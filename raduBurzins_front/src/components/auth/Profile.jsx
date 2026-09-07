import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Profile() {
  const { user, checkAuth, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    nickname: user?.nickname || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    email: user?.email || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const normalizeDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    if (user?.avatar_url) return `${user.avatar_url}?t=${user.updated_at || Date.now()}`;
    return '';
  }, [avatarFile, user?.avatar_url, user?.updated_at]);

  if (!user) return <div className="py-8 text-center">Nav lietotāja datu.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    setAvatarFile(file || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value ?? '');
      });
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      const response = await api.post('/api/profile/avatar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.user) {
        updateUser(response.data.user);
        await checkAuth();
      }

      setMessage('Profila dati atjaunināti.');
      setAvatarFile(null);
    } catch (submissionError) {
      setError(
        submissionError?.response?.data?.message ||
          'Neizdevās saglabāt profila datus.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-3 sm:px-4">
      <div className="card max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profila bilde"
                className="h-20 w-20 rounded-2xl object-cover shadow-soft ring-4 ring-white"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent-1 to-accent-2 text-white flex items-center justify-center font-bold text-2xl shadow-soft">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-dark-purple">Mans profils</h2>
            <p className="text-sm text-muted">
              Šeit vari labot savu vārdu, kontaktus un profila bildi.
            </p>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Vārds</span>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Uzvārds</span>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Iesauka</span>
              <input
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Telefons</span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Dzimšanas datums</span>
              <input
                type="date"
                name="date_of_birth"
                value={normalizeDateForInput(formData.date_of_birth)}
                onChange={handleChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">E-pasts</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-accent-2 focus:ring-2 focus:ring-accent-2/20"
              />
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Profila bilde</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-accent-1 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary rounded-2xl px-6 py-3 text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saglabā...' : 'Saglabāt profilu'}
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}

export default Profile;
