import BasePopup from '../../components/BasePopoup';

function MyEventEditor({
  event,
  formData,
  setFormData,
  users,
  usersLoading,
  saving,
  error,
  onClose,
  onSubmit,
  onToggleSharedUser,
}) {
  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <BasePopup title={event.title} onClose={onClose} width="760px">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="rounded-lg border border-[#e5e8e1] bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-extrabold text-dark-purple">Notikuma informācija</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Nosaukums</label>
              <input
                value={formData.title}
                onChange={(eventChange) => updateField('title', eventChange.target.value)}
                className="w-full rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#61836a] focus:bg-white focus:ring-4 focus:ring-[#61836a]/10"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Datums</label>
              <input
                type="date"
                value={formData.date}
                onChange={(eventChange) => updateField('date', eventChange.target.value)}
                className="w-full rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#61836a] focus:bg-white focus:ring-4 focus:ring-[#61836a]/10"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-muted">Apraksts</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(eventChange) => updateField('description', eventChange.target.value)}
              className="w-full rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#61836a] focus:bg-white focus:ring-4 focus:ring-[#61836a]/10"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Atrašanās vieta</label>
              <input
                value={formData.location}
                onChange={(eventChange) => updateField('location', eventChange.target.value)}
                className="w-full rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#61836a] focus:bg-white focus:ring-4 focus:ring-[#61836a]/10"
                placeholder="Piemēram: Mājas, Rīga"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Laiks</label>
              <input
                type="time"
                value={formData.event_time}
                onChange={(eventChange) => updateField('event_time', eventChange.target.value)}
                className="w-full rounded-lg border border-[#dedfd7] bg-[#fcfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#61836a] focus:bg-white focus:ring-4 focus:ring-[#61836a]/10"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg border border-[#e5e8e1] bg-[#fcfcfa] px-4 py-3">
              <input
                type="checkbox"
                checked={formData.repeats}
                onChange={(eventChange) => updateField('repeats', eventChange.target.checked)}
              />
              <span className="text-sm font-medium text-dark-purple">Atkārtojas katru gadu</span>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-[#e5e8e1] bg-[#fcfcfa] px-4 py-3">
              <input
                type="checkbox"
                checked={!formData.is_public}
                onChange={(eventChange) => {
                  const isPrivate = eventChange.target.checked;
                  setFormData((previous) => ({
                    ...previous,
                    is_public: !isPrivate,
                    shared_user_ids: isPrivate ? previous.shared_user_ids : [],
                  }));
                }}
              />
              <span className="text-sm font-medium text-dark-purple">Privāts pasākums</span>
            </label>
          </div>
        </div>

        {!formData.is_public && (
          <div className="rounded-lg border border-[#e5e8e1] bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-dark-purple">Kas var redzēt šo notikumu?</h3>
              <p className="mt-1 text-xs text-muted">
                Izvēlies konkrētus lietotājus. Notikums būs redzams tev un izvēlētajiem cilvēkiem.
              </p>
            </div>

            {usersLoading ? (
              <div className="text-sm text-muted">Ielādē lietotājus...</div>
            ) : users.length > 0 ? (
              <div className="grid max-h-60 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {users.map((user) => {
                  const checked = formData.shared_user_ids.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onToggleSharedUser(user.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                        checked
                          ? 'border-[#718b74] bg-[#edf3ed]'
                          : 'border-[#e5e8e1] bg-white hover:bg-[#f7f9f6]'
                      }`}
                    >
                      <span className="text-sm font-semibold text-dark-purple">
                        {user.first_name} {user.last_name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          checked ? 'bg-[#526f59] text-white' : 'bg-[#f1f2ef] text-gray-600'
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
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost w-full rounded-lg">
            Atcelt
          </button>
          <button type="submit" disabled={saving} className="btn-primary w-full rounded-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
            {saving ? 'Saglabā...' : 'Saglabāt'}
          </button>
        </div>
      </form>
    </BasePopup>
  );
}

export default MyEventEditor;