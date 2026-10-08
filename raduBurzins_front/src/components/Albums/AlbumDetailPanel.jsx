function AlbumDetailPanel({
  album,
  isAlbumCreator,
  showAddPhotoPanel,
  deletingAlbum,
  photos,
  photoPreviewUrls,
  uploadingPhoto,
  onEditAlbum,
  onDeleteAlbum,
  onToggleAddPhotoPanel,
  onGallerySelection,
  onRemovePhoto,
  onUpdatePhotoField,
  onAddPhoto,
  onOpenPhoto,
}) {
  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-col gap-4 border-b border-[#e4e8e1] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf2ec] text-2xl">
            {album.photos?.[0]?.image_path ? (
              <img src={album.photos[0].image_path} alt="" className="h-full w-full object-cover" />
            ) : (
              album.emoji || "📷"
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase text-[#58735e]">{album.category || "Albums"}</div>
            <h2 className="mt-1 break-words text-xl font-black text-dark-purple sm:text-2xl">{album.title}</h2>
            {album.description && (
              <p className="mt-1 max-w-2xl break-words text-sm text-muted">{album.description}</p>
            )}
            <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold ${album.is_public ? "bg-[#eaf2e9] text-[#3f6b45]" : "bg-[#fff2df] text-[#9b651a]"}`}>
              {album.is_public ? "Publisks" : "Tikai izvēlētajiem cilvēkiem"}
            </span>
          </div>
        </div>

        {isAlbumCreator && (
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button type="button" onClick={onEditAlbum} className="btn-ghost w-full rounded-lg px-3 py-2 text-xs sm:w-auto sm:text-sm">
              Labot albumu
            </button>
            <button type="button" onClick={onDeleteAlbum} disabled={deletingAlbum} className="btn-ghost w-full rounded-lg px-3 py-2 text-xs sm:w-auto sm:text-sm">
              {deletingAlbum ? "Dzēš..." : "Dzēst albumu"}
            </button>
            <button type="button" onClick={onToggleAddPhotoPanel} className="btn-primary col-span-2 w-full rounded-lg px-3 py-2 text-xs sm:col-span-1 sm:w-auto sm:text-sm">
              {showAddPhotoPanel ? "Aizvērt foto pievienošanu" : "Pievienot vēl foto"}
            </button>
          </div>
        )}
      </div>

      {isAlbumCreator && showAddPhotoPanel && (
        <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-dark-purple">Pievienot vēl foto</h3>
              <p className="mt-2 text-sm text-muted">
                Atver vienu reizi un izvēlies vairākus foto failus. Tos vari pielāgot vai pievienot vēlāk.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-dashed border-medium-purple/25 bg-white/70 p-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Atlasīt vairākus foto vienlaikus</span>
              <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-medium-purple/20 bg-warm-beige/20 px-4 py-3 text-sm font-semibold text-dark-purple transition hover:bg-warm-beige/35">
                <span className="truncate">
                  {photos.some((photo) => photo.image) ? "Foto faili izvēlēti" : "Izvēlēties failu"}
                </span>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-medium-purple">
                  Pārlūkot
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onGallerySelection}
                  className="sr-only"
                />
              </label>
            </label>
            <p className="mt-2 text-xs text-muted">
              Izvēlētie faili tiks pievienoti kā atsevišķi foto ieraksti zemāk.
            </p>
          </div>

          {photos.some((photo) => photo.image) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.map((photo, index) => {
                if (!photo.image) return null;

                return (
                  <div key={`${photo.image.name}-${index}`} className="rounded-2xl border border-[#eee5dc] bg-[#fcfaf8] p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={photoPreviewUrls[index] || ""}
                        alt={photo.image.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-dark-purple">{photo.image.name}</p>
                        <p className="mt-1 text-xs text-muted">{(photo.image.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" onClick={() => onRemovePhoto(index)} className="btn-ghost px-2 py-1 text-xs">
                        Noņemt
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <input
                        value={photo.title}
                        onChange={(event) => onUpdatePhotoField(index, "title", event.target.value)}
                        className="input-field"
                        placeholder="Foto nosaukums (nav obligāti)"
                      />
                      <input
                        value={photo.note}
                        onChange={(event) => onUpdatePhotoField(index, "note", event.target.value)}
                        className="input-field"
                        placeholder="Piezīme (nav obligāti)"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex justify-center border-t border-[#eee5dc] pt-4">
            <button type="button" onClick={onAddPhoto} disabled={uploadingPhoto} className="btn-primary px-20 py-2">
              {uploadingPhoto ? "Saglabā..." : "Pievienot foto"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {album.photos?.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onOpenPhoto(index)}
            className="group min-w-0 overflow-hidden rounded-lg border border-[#e4e8e1] bg-white text-left transition hover:border-[#bdcdbf] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#66836b]/30"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[#edf1eb]">
              <img src={photo.image_path} alt={photo.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            </div>
            <div className="min-w-0 p-3 sm:p-4">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <h3 className="min-w-0 truncate text-sm font-extrabold text-dark-purple sm:text-base">{photo.title}</h3>
                <span className="shrink-0 rounded-md bg-[#f4f6f2] px-2 py-1 text-xs font-bold text-[#58735e]">
                  {photo.likes_count || 0} ♥
                </span>
              </div>
              {photo.note && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted sm:text-sm">{photo.note}</p>}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default AlbumDetailPanel;