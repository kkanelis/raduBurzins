import BasePopup from "../../components/BasePopoup";
import AlbumPhotoBatchForm from "./AlbumPhotoBatchForm";
import AlbumDetailsFields from "./AlbumDetailsFields";
import PrivateImage from "../PrivateImage";

function AlbumModals({
  showCreateModal,
  showAlbumEditModal,
  showPhotoEditModal,
  selectedPhoto,
  formData,
  photoForm,
  users,
  sharedUsersLabel,
  photos,
  photoPreviewUrls,
  error,
  saving,
  albumSaving,
  uploadingPhoto,
  onCloseCreate,
  onCloseAlbumEdit,
  onClosePhotoEdit,
  onCreate,
  onUpdateAlbum,
  onUpdatePhoto,
  onFormChange,
  onTogglePublic,
  onToggleSharedUser,
  onAddPhotoRow,
  onRemovePhotoRow,
  onGallerySelection,
  onUpdatePhotoField,
  onPhotoFormChange,
  onPhotoImageChange,
}) {
  return (
    <>
      {showCreateModal && (
        <BasePopup title="Jauns albums" onClose={onCloseCreate} width="980px">
          <form onSubmit={onCreate} className="space-y-4">
            <AlbumDetailsFields
              formData={formData}
              users={users}
              sharedUsersLabel={sharedUsersLabel}
              onChange={onFormChange}
              onTogglePublic={onTogglePublic}
              onToggleSharedUser={onToggleSharedUser}
            />
            <AlbumPhotoBatchForm
              photos={photos}
              photoPreviewUrls={photoPreviewUrls}
              onAddRow={onAddPhotoRow}
              onRemoveRow={onRemovePhotoRow}
              onGallerySelection={onGallerySelection}
              onUpdateField={onUpdatePhotoField}
            />
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={onCloseCreate} className="btn-ghost">Atcelt</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saglabā..." : "Saglabāt albumu"}
              </button>
            </div>
          </form>
        </BasePopup>
      )}

      {showAlbumEditModal && (
        <BasePopup title="Labot albumu" onClose={onCloseAlbumEdit} width="860px">
          <form onSubmit={onUpdateAlbum} className="space-y-4">
            <AlbumDetailsFields
              formData={formData}
              users={users}
              sharedUsersLabel={sharedUsersLabel}
              onChange={onFormChange}
              onTogglePublic={onTogglePublic}
              onToggleSharedUser={onToggleSharedUser}
            />
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={onCloseAlbumEdit} className="btn-ghost">Atcelt</button>
              <button type="submit" disabled={albumSaving} className="btn-primary">
                {albumSaving ? "Saglabā..." : "Saglabāt izmaiņas"}
              </button>
            </div>
          </form>
        </BasePopup>
      )}

      {showPhotoEditModal && selectedPhoto ? (
        <BasePopup title="Labot foto" onClose={onClosePhotoEdit} width="760px">
          <form onSubmit={onUpdatePhoto} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <div className="h-44 overflow-hidden rounded-[1.5rem] border border-white/80 bg-warm-beige/30">
                <PrivateImage src={selectedPhoto.image_path} alt={selectedPhoto.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
                  <input value={photoForm.title} onChange={(event) => onPhotoFormChange("title", event.target.value)} className="input-field" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-dark-purple">Piezīme</span>
                  <textarea value={photoForm.note} onChange={(event) => onPhotoFormChange("note", event.target.value)} className="text-area-field" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-dark-purple">Nomainīt attēlu</span>
                  <input type="file" accept="image/*" onChange={onPhotoImageChange} className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm" />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClosePhotoEdit} className="btn-ghost">Atcelt</button>
              <button type="submit" disabled={uploadingPhoto} className="btn-primary">
                {uploadingPhoto ? "Saglabā..." : "Saglabāt foto"}
              </button>
            </div>
          </form>
        </BasePopup>
      ) : null}
    </>
  );
}

export default AlbumModals;