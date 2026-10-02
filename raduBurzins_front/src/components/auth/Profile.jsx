import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import api from '../../services/api';

const profileInputClassName = 'w-full min-w-0 rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3.5 py-2.5 text-sm text-dark-purple shadow-sm outline-none transition placeholder:text-muted/70 focus:border-[#61836a] focus:bg-white focus:ring-4 focus:ring-[#61836a]/10';

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
  const [avatarPreview, setAvatarPreview] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const normalizeDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(user?.avatar_path
        ? `${api.defaults.baseURL}/storage/${user.avatar_path}?t=${user.updated_at || Date.now()}`
        : '');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile, user?.avatar_path, user?.updated_at]);

  if (!user) return <div className="py-8 text-center">Nav lietotāja datu.</div>;

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
      payload.append('_method', 'PUT');
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      const response = await api.post('/api/profile', payload, {
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
    <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-4 sm:py-8">
      <div className="overflow-hidden rounded-xl border border-[#e4e5dd] bg-white shadow-[0_18px_50px_rgba(39,48,39,0.1)]">
        <header className="border-b border-[#dfe7dc] bg-[#edf3ed] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profila bilde"
                className="h-20 w-20 rounded-full object-cover shadow-md ring-4 ring-white sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#526f59] text-2xl font-extrabold text-white shadow-md ring-4 ring-white sm:h-24 sm:w-24">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </div>
            )}
          </div>
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase text-[#58735e]">Mans profils</div>
              <h1 className="mt-1 break-words text-2xl font-black text-dark-purple sm:text-3xl">
                {user.first_name} {user.last_name}
              </h1>
              <p className="mt-1 break-all text-sm text-muted">{user.email}</p>
            </div>
          </div>
        </header>

        <div className="space-y-5 px-4 py-5 sm:px-8 sm:py-7">
          {message ? (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="shrink-0 text-sm font-extrabold text-dark-purple">Personas dati</h2>
                <span aria-hidden="true" className="h-px flex-1 bg-[#e9ebe5]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">Vārds</span>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={profileInputClassName}
                  />
                </label>

                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">Uzvārds</span>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={profileInputClassName}
                  />
                </label>

                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">Iesauka</span>
                  <input
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className={profileInputClassName}
                  />
                </label>

                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">Telefons</span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={profileInputClassName}
                  />
                </label>

                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">Dzimšanas datums</span>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={normalizeDateForInput(formData.date_of_birth)}
                    onChange={handleChange}
                    className={profileInputClassName}
                  />
                </label>

                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">E-pasts</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={profileInputClassName}
                  />
                </label>
              </div>
            </section>

            <section className="border-t border-[#e9ebe5] pt-6">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="shrink-0 text-sm font-extrabold text-dark-purple">Profila attēls</h2>
                <span aria-hidden="true" className="h-px flex-1 bg-[#e9ebe5]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#59645a]">Izvēlies attēlu</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full min-w-0 rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3 py-2 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-[#e8efe8] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#38553e]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  aria-busy={saving}
                  className="btn-primary w-full rounded-lg px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {saving ? 'Saglabā...' : 'Saglabāt profilu'}
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
