function ChatComposer({
  sendError,
  photoDataUrl,
  selectedPhotoName,
  fileInputRef,
  onClearPhoto,
  onPhotoChange,
  draft,
  onDraftChange,
  sending,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="border-t border-[#e8ece6] bg-white p-3 sm:p-4">
      {sendError && (
        <div role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {sendError}
        </div>
      )}
      {photoDataUrl && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#e1e9e0] bg-[#f7f9f6] p-2">
          <img src={photoDataUrl} alt="Priekšskatījums" className="h-12 w-12 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1 truncate text-xs font-semibold text-[#425b46]">{selectedPhotoName}</div>
          <button
            type="button"
            onClick={onClearPhoto}
            className="shrink-0 rounded-md px-3 py-2 text-xs font-bold text-[#9b4d4d] transition hover:bg-white"
          >
            Noņemt
          </button>
        </div>
      )}

      <div className="flex min-w-0 items-end gap-2 rounded-lg border border-[#dfe5dc] bg-[#fbfcfa] p-1.5 transition focus-within:border-[#66836b] focus-within:ring-2 focus-within:ring-[#66836b]/15">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Pievienot bildi"
          title="Pievienot bildi"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl font-medium text-[#526f59] transition hover:bg-[#edf3ed]"
        >
          <span aria-hidden="true">+</span>
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />

        <textarea
          value={draft}
          onChange={onDraftChange}
          placeholder="Raksti ziņu visai ģimenei..."
          aria-label="Ziņas teksts"
          rows={1}
          className="max-h-32 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-dark-purple outline-none placeholder:text-muted/70"
        />

        <button
          type="submit"
          disabled={sending}
          aria-label="Sūtīt ziņu"
          className="flex h-10 shrink-0 items-center justify-center rounded-md bg-[#526f59] px-4 text-sm font-bold text-white transition hover:bg-[#405a46] disabled:cursor-wait disabled:opacity-60"
        >
          <span className="hidden sm:inline">{sending ? "Sūta..." : "Sūtīt"}</span>
          <span className="text-lg leading-none sm:hidden" aria-hidden="true">↑</span>
        </button>
      </div>
    </form>
  );
}

export default ChatComposer;