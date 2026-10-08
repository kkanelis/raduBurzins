function AlbumPhotoBatchForm({ photos, photoPreviewUrls, onAddRow, onRemoveRow, onGallerySelection, onUpdateField }) {
  return (
    <div className="rounded-2xl border border-dashed border-medium-purple/25 bg-white/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-dark-purple">Foto, ko pievienosi albumam</h3>
          <p className="mt-1 text-xs text-muted">Vari vienlaikus izvēlēties vairākus foto failus.</p>
        </div>
        <button type="button" onClick={onAddRow} className="btn-ghost px-4 py-2 text-sm">
          + Foto rinda
        </button>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-dashed border-medium-purple/25 bg-white p-4">
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
      </div>

      <div className="mt-4 grid gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="rounded-[1.5rem] border border-white/80 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/80 bg-warm-beige/30 shadow-sm">
                  {photo.image ? (
                    <img
                      src={photoPreviewUrls[index] || ""}
                      alt={photo.image.name || `Foto ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-medium-purple">
                      📷
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-dark-purple">Foto {index + 1}</h4>
                  <p className="text-xs text-muted">
                    {photo.image?.name ? `Fails: ${photo.image.name}` : "Fails nav izvēlēts"}
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => onRemoveRow(index)} className="btn-ghost px-3 py-2 text-sm">
                Noņemt
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 md:col-span-1">
                <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
                <input
                  value={photo.title}
                  onChange={(event) => onUpdateField(index, "title", event.target.value)}
                  className="input-field"
                  placeholder="Piemēram: Ierašanās"
                />
              </label>
              <label className="grid gap-2 md:col-span-1">
                <span className="text-sm font-semibold text-dark-purple">Piezīme</span>
                <input
                  value={photo.note}
                  onChange={(event) => onUpdateField(index, "note", event.target.value)}
                  className="input-field"
                  placeholder="Neliels apraksts"
                />
              </label>
              <label className="grid gap-2 md:col-span-1">
                <span className="text-sm font-semibold text-dark-purple">Attēls</span>
                <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm">
                  <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-medium-purple/20 bg-warm-beige/20 px-4 py-3 text-sm font-semibold text-dark-purple transition hover:bg-warm-beige/35">
                    <span className="truncate">
                      {photo.image?.name ? photo.image.name : "Izvēlēties failu"}
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-medium-purple">
                      Pārlūkot
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => onUpdateField(index, "image", event.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlbumPhotoBatchForm;