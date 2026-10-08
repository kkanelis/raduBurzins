function AlbumPhotoViewer({
  album,
  photo,
  photoIndex,
  usersById,
  isAlbumCreator,
  reactionLoading,
  deletingPhoto,
  onClose,
  onPrevious,
  onNext,
  onReact,
  onRemoveReaction,
  onEditPhoto,
  onDeletePhoto,
}) {
  return (
    <div className="modal-backdrop p-2 sm:p-4" onClick={onClose}>
      <div
        className="mx-auto flex h-full max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#151a16] text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={photo.title || "Foto skatītājs"}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#1b221c] px-3 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase text-[#a9b6a8]">{album?.title || "Albums"}</div>
            <h2 className="mt-0.5 truncate text-sm font-extrabold sm:text-base">{photo.title}</h2>
            {photo.note && <p className="mt-0.5 line-clamp-1 text-xs text-white/60">{photo.note}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-semibold text-white/65">
              {photoIndex + 1} / {album?.photos?.length || 1}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              onClick={onClose}
              aria-label="Aizvērt foto"
              title="Aizvērt"
            >
              ×
            </button>
          </div>
        </header>

        <div className="relative flex min-h-[40vh] flex-1 items-center justify-center overflow-hidden bg-[#0c0f0c] p-3 sm:min-h-0 sm:p-6">
          <img
            src={photo.image_path}
            alt={photo.title}
            className="max-h-[68vh] w-full object-contain sm:max-h-[74vh]"
          />
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Iepriekšējais foto"
            title="Iepriekšējais foto"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-xl text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 sm:left-4 sm:h-11 sm:w-11"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Nākamais foto"
            title="Nākamais foto"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-xl text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 sm:right-4 sm:h-11 sm:w-11"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <footer className="grid shrink-0 gap-2 border-t border-white/10 bg-[#1b221c] p-3 sm:flex sm:items-center sm:justify-between sm:px-5">
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => onReact("❤️")}
              disabled={reactionLoading}
              className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white/85 transition hover:bg-white/10 disabled:opacity-50 sm:text-sm"
            >
              ❤️ Patīk
            </button>
            <button
              type="button"
              onClick={onRemoveReaction}
              disabled={reactionLoading}
              className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 disabled:opacity-50 sm:text-sm"
            >
              Noņemt reakciju
            </button>
          </div>
          {isAlbumCreator && (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button type="button" onClick={onEditPhoto} className="rounded-md bg-[#526f59] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#63836a] sm:text-sm">
                Labot foto
              </button>
              <button type="button" onClick={onDeletePhoto} disabled={deletingPhoto} className="rounded-md border border-[#d89685]/40 px-3 py-2 text-xs font-bold text-[#f1b7a7] transition hover:bg-white/10 disabled:opacity-50 sm:text-sm">
                {deletingPhoto ? "Dzēš..." : "Dzēst foto"}
              </button>
            </div>
          )}
        </footer>

        {photo.reactions && Object.keys(photo.reactions).length > 0 ? (
          <div className="max-h-24 shrink-0 overflow-y-auto border-t border-white/10 bg-[#171d18] px-3 py-2 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-white/50">Reakcijas</span>
              {Object.entries(photo.reactions).map(([userId, reaction]) => {
                const reactor = usersById.get(String(userId));
                const reactorName = reactor
                  ? `${reactor.first_name || ""} ${reactor.last_name || ""}`.trim()
                  : `Lietotājs #${userId}`;
                return (
                  <span key={userId} className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80">
                    <span className="truncate">{reactorName}</span>
                    <span>{reaction}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AlbumPhotoViewer;