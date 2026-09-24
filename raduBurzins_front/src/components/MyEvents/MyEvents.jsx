import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import BasePopup from '../../components/BasePopoup';
import CreateSpecialDay from '../../components/Calendar/CreateSpecialDay';

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shareWithOthers, setShareWithOthers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    repeats: false,
    location: '',
    event_time: '',
    is_public: true,
    shared_user_ids: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/user/special-days');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Neizdevās ielādēt notikumus.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/api/users');
        const users = [...(response.data || [])];
        setUsers(users);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadEvents();
    loadUsers();
  }, []);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        return aDate - bDate;
      }),
    [events]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openEditor = (event) => {
    const sharedUserIds = event.shared_with_user_ids;
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      repeats: Boolean(event.repeats),
      location: event.location || '',
      event_time: event.event_time || '',
      is_public: Boolean(event.is_public),
      shared_user_ids: event.shared_with_user_ids
    });
    setImageFile(null);
    setRemoveImage(false);
  };

  const toggleSharedUser = (userId) => {
    setFormData((prev) => {
      const exists = prev.shared_user_ids.includes(userId);
      return {
        ...prev,
        shared_user_ids: exists
          ? prev.shared_user_ids.filter((id) => id !== userId)
          : [...prev.shared_user_ids, userId],
      };
    });
  };

  const closeEditor = () => {
    setSelectedEvent(null);
    setImageFile(null);
    setRemoveImage(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedEvent) return;

    setSaving(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('_method', 'PUT');
      payload.append('title', formData.title);
      payload.append('description', formData.description || '');
      payload.append('date', formData.date);
      payload.append('repeats', formData.repeats ? '1' : '0');
      payload.append('location', formData.location || '');
      payload.append('event_time', formData.event_time || '');
      payload.append('is_public', formData.is_public ? '1' : '0');
      formData.shared_user_ids.forEach((userId) => {
        payload.append('shared_user_ids[]', userId);
      });
      if (imageFile) payload.append('image', imageFile);
      if (removeImage) payload.append('remove_image', '1');

      await api.post(`/api/special-days/${selectedEvent.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await loadEvents();
      closeEditor();
    } catch (err) {
      setError(err.response?.data?.message || 'Neizdevās saglabāt notikumu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm('Vai tiešām dzēst šo notikumu?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/special-days/${eventId}`);
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Neizdevās dzēst notikumu.');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="space-y-6">
          <div className="card surface-strong">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="eyebrow">
                  <span>✦</span>
                  <span>Notikumi</span>
                </div>
                <h1 className="section-title mt-3">Mani notikumi</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
                  Šeit vari redzēt visus savus notikumus, tos labot, padarīt publiskus vai paslēpt, pievienot attēlu un citus datus.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 self-start">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  + Jauns notikums
                </button>
                <button
                  type="button"
                  onClick={loadEvents}
                  className="btn-ghost"
                >
                  Atsvaidzināt
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              {loading ? (
                <div className="card surface-strong p-6 text-muted">Ielādē notikumus...</div>
              ) : sortedEvents.length > 0 ? (
                sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="card surface-strong p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-dark-purple">{event.title}</h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${event.is_public ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {event.is_public ? 'Publisks' : 'Privāts'}
                          </span>
                          {event.repeats && (
                            <span className="rounded-full bg-medium-purple/10 px-3 py-1 text-xs font-bold text-medium-purple">
                              Atkārtojas
                            </span>
                          )}
                        </div>

                        <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                          {event.description || 'Nav apraksta.'}
                        </p>

                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-dark-purple">
                            📅 {formatDate(event.date)}
                          </span>
                          {event.event_time && (
                            <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-dark-purple">
                              🕒 {event.event_time}
                            </span>
                          )}
                          {event.location && (
                            <span className="rounded-full bg-white/80 px-3 py-1 font-semibold text-dark-purple">
                              📍 {event.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditor(event)}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Labot
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.id)}
                          className="btn-ghost px-4 py-2 text-sm"
                        >
                          Dzēst
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card surface-strong p-6 text-muted">
                  Te vēl nav neviena notikuma. Pievieno kādu kalendārā, un tas parādīsies šeit.
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-soft">
                <div className="eyebrow">💡 Padoms</div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Pievieno atrašanās vietu, laiku un attēlu, lai notikums būtu pilnīgāks un vieglāk pārskatāms.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-soft">
                <div className="eyebrow">🎯 Ko vari darīt</div>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  <li>• Atvērt notikumu un labot informāciju</li>
                  <li>• Pievienot vai noņemt attēlu</li>
                  <li>• Paslēpt notikumu no publiskā skata</li>
                  <li>• Dzēst vecos notikumus</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateSpecialDay
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadEvents()}
        />
      )}

      {selectedEvent && (
        <BasePopup title={selectedEvent.title} onClose={closeEditor} width="760px">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-white/80 bg-white/75 p-4">
              <div className="eyebrow">📝 Notikuma informācija</div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">Nosaukums</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-md border border-black/20 bg-white/90 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">Datums</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-md border border-black/20 bg-white/90 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-muted">Apraksts</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-black/20 bg-white/90 px-3 py-2"
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">Atrašanās vieta</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-md border border-black/20 bg-white/90 px-3 py-2"
                    placeholder="Piemēram: Mājas, Rīga"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">Laiks</label>
                  <input
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full rounded-md border border-black/20 bg-white/90 px-3 py-2"
                    placeholder="Piemēram: 18:30"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={formData.repeats}
                    onChange={(e) => setFormData({ ...formData, repeats: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-dark-purple">Atkārtojas katru gadu</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!formData.is_public}
                    onChange={(e) => {
                      const isPrivate = e.target.checked;
                      setShareWithOthers(isPrivate);
                      setFormData({
                        ...formData,
                        is_public: !isPrivate,
                        shared_user_ids: isPrivate ? formData.shared_user_ids : [],
                      });
                    }}
                  />
                  <span className="text-sm font-medium text-dark-purple">Privāts pasākums</span>
                </label>
              </div>
            </div>

            {!formData.is_public && <div className="rounded-2xl border border-white/80 bg-white/75 p-4">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-dark-purple">Kas var redzēt šo notikumu?</h3>
                <p className="mt-1 text-xs text-muted">
                  Izvēlies konkrētus lietotājus. Notikums būs redzams tev un izvēlētajiem cilvēkiem.
                </p>
              </div>

              {loadingUsers ? (
                <div className="text-sm text-muted">Ielādē lietotājus...</div>
              ) : users.length > 0 ? (
                <div className="grid max-h-60 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {users.map((user) => {
                    const checked = formData.shared_user_ids.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleSharedUser(user.id)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                          checked
                            ? 'border-medium-purple bg-medium-purple/10'
                            : 'border-white/80 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-dark-purple">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            checked ? 'bg-medium-purple text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {checked ? 'Pievienots' : 'Pievienot'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted">Nav pieejamu lietotāju izvēlei.</div>
              )}
            </div>
            }

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={closeEditor} className="btn-ghost">
                Atcelt
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saglabā...' : 'Saglabāt'}
              </button>
            </div>
          </form>
        </BasePopup>
      )}
    </div>
  );
}

export default MyEvents;
