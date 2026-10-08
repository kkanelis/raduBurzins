function AlbumDetailsFields({ formData, users, sharedUsersLabel, onChange, onTogglePublic, onToggleSharedUser }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
          <input name="title" value={formData.title} onChange={onChange} className="input-field" placeholder="Piemēram: Kāzas" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-dark-purple">Kategorija</span>
          <input name="category" value={formData.category} onChange={onChange} className="input-field" placeholder="Notikumu albums" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-dark-purple">Emoji</span>
          <input name="emoji" value={formData.emoji} onChange={onChange} className="input-field" placeholder="📷" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-dark-purple">Apraksts</span>
        <textarea name="description" value={formData.description} onChange={onChange} className="text-area-field" placeholder="Kāds ir šis albums?" />
      </label>

      <div className="rounded-2xl border border-dashed border-medium-purple/25 bg-white/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-dark-purple">Privātums</h3>
            <p className="mt-1 text-xs text-muted">{sharedUsersLabel}</p>
          </div>
          <button type="button" onClick={onTogglePublic} className="btn-ghost px-4 py-2 text-sm">
            {formData.is_public ? "Padarīt privātu" : "Padarīt publisku"}
          </button>
        </div>

        {!formData.is_public && (
          <div className="mt-4 rounded-[1.5rem] border border-white/80 bg-white p-4">
            <div className="mb-3">
              <h4 className="text-sm font-bold text-dark-purple">Kas var redzēt albumu?</h4>
              <p className="mt-1 text-xs text-muted">Atzīmē konkrētus cilvēkus, ja albums nav publisks.</p>
            </div>

            {users.length > 0 ? (
              <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {users.map((user) => {
                  const checked = formData.shared_with_user_ids.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onToggleSharedUser(user.id)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                        checked ? "border-medium-purple bg-medium-purple/10" : "border-white/80 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-dark-purple">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="block text-xs text-muted">{user.is_admin ? "Administrators" : "Lietotājs"}</span>
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${checked ? "bg-medium-purple text-white" : "bg-gray-100 text-gray-600"}`}>
                        {checked ? "Pievienots" : "Pievienot"}
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
      </div>
    </>
  );
}

export default AlbumDetailsFields;