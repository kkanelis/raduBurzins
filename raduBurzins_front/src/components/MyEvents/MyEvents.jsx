import React, { useMemo, useState } from 'react';
import api from '../../services/api';
import CreateSpecialDay from '../../components/Calendar/CreateSpecialDay';
import MyEventEditor from './MyEventEditor';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function MyEvents() {
  const queryClient = useQueryClient();

  // Data loading
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ["user-special-days"],
    queryFn: async () => {
      const response = await api.get("/api/user/special-days");
      return response.data || [];
    },
  });

  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["users-status"],
    queryFn: async () => {
      const response = await api.get("/api/users/status");
      return Array.isArray(response.data?.users) ? response.data.users : [];
    },
  });

  // Local UI state
  const [localError, setLocalError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loading = eventsLoading || usersLoading;
  const error = eventsError || usersError || localError;

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events],
  );

  // Event helpers
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openEditor = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      repeats: Boolean(event.repeats),
      location: event.location || '',
      event_time: event.event_time || '',
      is_public: Boolean(event.is_public),
      shared_user_ids: Array.isArray(event.shared_with_user_ids) ? event.shared_with_user_ids : [],
    });
    setLocalError('');
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
    setLocalError('');
  };

  // Event CRUD actions
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedEvent) return;

    setSaving(true);
    setLocalError('');

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
        payload.append('shared_with_user_ids[]', userId);
      });
      await api.post(`/api/special-days/${selectedEvent.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-special-days"] }),
        queryClient.invalidateQueries({ queryKey: ["special-days"] }),
      ]);
      closeEditor();
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Neizdevās saglabāt notikumu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm('Vai tiešām dzēst šo notikumu?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/special-days/${eventId}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-special-days"] }),
        queryClient.invalidateQueries({ queryKey: ["special-days"] }),
      ]);
      setLocalError('');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Neizdevās dzēst notikumu.');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-5 sm:py-8 lg:py-10">
        <div className="space-y-4 sm:space-y-5">
          <div className="card surface-strong p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Notikumi</span>
                </div>
                <h1 className="mt-2 text-3xl font-black text-dark-purple">Mani notikumi</h1>
                <p className="mt-2 max-w-xl text-sm text-muted">
                  Savu notikumu pārvaldīšana.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="btn-primary w-full sm:w-auto"
              >
                <span aria-hidden="true">+</span> Jauns notikums
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-xl border border-[#e5e8e1] bg-white p-6 text-sm text-muted">Ielādē notikumus...</div>
            ) : sortedEvents.length > 0 ? (
              sortedEvents.map((event) => (
                <article key={event.id} className="rounded-xl border border-[#e5e8e1] bg-white p-4 shadow-sm transition hover:border-[#ccd8cc] hover:shadow-md sm:p-5">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-lg font-extrabold text-dark-purple sm:text-xl">{event.title}</h2>
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${event.is_public ? 'bg-[#eaf2e9] text-[#3f6b45]' : 'bg-[#fff2df] text-[#9b651a]'}`}>
                          {event.is_public ? 'Publisks' : 'Privāts'}
                        </span>
                        {event.repeats && (
                          <span className="rounded-md bg-[#f0f1f7] px-2.5 py-1 text-xs font-bold text-[#5c5878]">
                            Atkārtojas katru gadu
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-2 line-clamp-3 max-w-3xl break-words text-sm leading-6 text-muted">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        <span className="max-w-full break-words rounded-md bg-[#f4f6f2] px-3 py-2 text-xs font-semibold text-dark-purple sm:text-sm">
                          <span className="text-muted">Datums</span><span aria-hidden="true"> · </span>{formatDate(event.date)}
                        </span>
                        {event.event_time && (
                          <span className="rounded-md bg-[#f4f6f2] px-3 py-2 text-xs font-semibold text-dark-purple sm:text-sm">
                            <span className="text-muted">Laiks</span><span aria-hidden="true"> · </span>{event.event_time}
                          </span>
                        )}
                        {event.location && (
                          <span className="max-w-full break-words rounded-md bg-[#f4f6f2] px-3 py-2 text-xs font-semibold text-dark-purple sm:text-sm">
                            <span className="text-muted">Vieta</span><span aria-hidden="true"> · </span>{event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                      <button type="button" onClick={() => openEditor(event)} className="btn-primary flex-1 rounded-lg px-4 py-2 text-sm sm:flex-none">
                        Labot
                      </button>
                      <button type="button" onClick={() => handleDelete(event.id)} className="btn-ghost flex-1 rounded-lg border border-[#efd4ce] px-4 py-2 text-sm text-[#a24d3a] hover:bg-[#fff5f2] sm:flex-none">
                        Dzēst
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[#cfd8ce] bg-white/80 px-5 py-10 text-center">
                <h2 className="text-base font-extrabold text-dark-purple">Notikumu vēl nav</h2>
                <p className="mt-1 text-sm text-muted">Jauns notikums parādīsies šeit.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateSpecialDay
          onClose={() => setShowCreateModal(false)}
          onSuccess={(created) => {
            queryClient.setQueryData(["user-special-days"], (current = []) => [created, ...current]);
            queryClient.invalidateQueries({ queryKey: ["special-days"] });
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedEvent && (
        <MyEventEditor
          event={selectedEvent}
          formData={formData}
          setFormData={setFormData}
          users={users}
          usersLoading={usersLoading}
          saving={saving}
          error={localError}
          onClose={closeEditor}
          onSubmit={handleSubmit}
          onToggleSharedUser={toggleSharedUser}
        />
      )}
    </div>
  );
}

export default MyEvents;
