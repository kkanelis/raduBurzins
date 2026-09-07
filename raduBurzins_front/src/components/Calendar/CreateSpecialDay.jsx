import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { lv } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import BasePopup from '../BasePopoup';

registerLocale('lv', lv);

function CreateSpecialDay({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: null,
    repeats: false,
    location: '',
    event_time: '',
    shared_user_ids: [],
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get('/api/users/status');
        const combined = [...(response.data.online || []), ...(response.data.offline || [])];
        const uniqueUsers = Array.from(new Map(combined.map((user) => [user.id, user])).values());
        setUsers(uniqueUsers);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) return setError('Lūdzu izvēlies datumu.');

    try {
      const payload = {
        ...formData,
        date: formData.date.toISOString().split('T')[0],
        repeats: formData.repeats ? '1' : '0',
        shared_user_ids: formData.shared_user_ids,
      };

      const response = await api.post('/api/special-days', payload);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Neizdevās izveidot notikumu');
    }
  };

  return (
    <BasePopup title="Iesniegt jaunu notikumu" onClose={onClose} width="760px">
      {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">Nosaukums</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full rounded-md border border-black/30 bg-white/80 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted">Apraksts</label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-md border border-black/30 bg-white/80 px-3 py-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Datums</label>
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              locale="lv"
              dateFormat="dd.MM.yyyy"
              placeholderText="Izvēlies datumu"
              calendarClassName="custom-calendar"
              popperPlacement="bottom-start"
              showPopperArrow={false}
              dropdownMode="select"
              className="w-full rounded-md border border-black/30 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Laiks</label>
            <input
              type="text"
              value={formData.event_time}
              onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              placeholder="Piemēram: 18:30"
              className="w-full rounded-md border border-black/30 bg-white/80 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted">Atrašanās vieta</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Piemēram: Rīga"
            className="w-full rounded-md border border-black/30 bg-white/80 px-3 py-2"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-4 py-3">
            <input
              type="checkbox"
              checked={formData.repeats}
              onChange={(e) => setFormData({ ...formData, repeats: e.target.checked })}
            />
            <span className="text-sm text-dark-purple">Atkārtojas katru gadu</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 px-4 py-3">
            <input
              type="checkbox"
              checked={formData.shared_user_ids.length > 0}
              readOnly
            />
            <span className="text-sm text-dark-purple">Redzams izvēlētiem cilvēkiem</span>
          </label>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
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
                      <div className="text-xs text-muted">
                        {user.is_admin ? 'Administrators' : 'Lietotājs'}
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

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">Atcelt</button>
          <button type="submit" className="btn-primary">Iesniegt</button>
        </div>
      </form>
    </BasePopup>
  );
}

export default CreateSpecialDay;
