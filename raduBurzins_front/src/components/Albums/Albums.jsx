import React, { useEffect, useMemo, useState } from "react";
import AlbumPhotoViewer from "./AlbumPhotoViewer";
import AlbumModals from "./AlbumModals";
import AlbumDetailPanel from "./AlbumDetailPanel";
import useAlbumData from "./useAlbumData";
import useAlbumActions from "./useAlbumActions";
import PrivateImage from "../PrivateImage";
import { useAuth } from "../../context/useAuth";

function Albums() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const {
    albums,
    setAlbums,
    albumPagination,
    users,
    selectedAlbumId,
    setSelectedAlbumId,
    setSelectedAlbumDetails,
    loadedAlbumId,
    albumDetailsLoading,
    setAlbumRefreshToken,
    setSelectedPhotoPage,
    photoPagination,
    loading,
    selectedAlbum,
    loadAlbums,
  } = useAlbumData(setError);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAlbumEditModal, setShowAlbumEditModal] = useState(false);
  const [showPhotoEditModal, setShowPhotoEditModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showAddPhotoPanel, setShowAddPhotoPanel] = useState(false);
  const [message, setMessage] = useState("");

  const usersById = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users]);

  const selectedPhoto = useMemo(() => {
    if (!selectedAlbum?.photos?.length) return null;
    return selectedAlbum.photos[selectedPhotoIndex] || selectedAlbum.photos[0];
  }, [selectedAlbum, selectedPhotoIndex]);

  const {
    formData,
    photoForm,
    setPhotoForm,
    photos,
    photoPreviewUrls,
    saving,
    uploadingPhoto,
    reactionLoading,
    albumSaving,
    deletingPhoto,
    deletingAlbum,
    sharedUsersLabel,
    handleChange,
    togglePublic,
    toggleSharedUser,
    updatePhotoField,
    addPhotoRow,
    removePhotoRow,
    handleGallerySelection,
    handleCreate,
    handleUpdateAlbum,
    openAlbumEditor,
    deleteAlbum,
    handleAddPhoto,
    openPhotoEditor,
    persistPhotoEdit,
    deletePhoto,
    goPrevious,
    goNext,
    openViewerAt,
    handleReaction,
    removeReaction,
  } = useAlbumActions({
    selectedAlbum,
    selectedPhoto,
    selectedPhotoIndex,
    albumPagination,
    photoPagination,
    loadAlbums,
    setAlbums,
    setSelectedAlbumDetails,
    setSelectedAlbumId,
    setAlbumRefreshToken,
    setSelectedPhotoPage,
    setSelectedPhotoIndex,
    setShowCreateModal,
    setShowAlbumEditModal,
    setShowPhotoEditModal,
    setShowViewer,
    setShowAddPhotoPanel,
    setError,
    setMessage,
  });

  const stats = useMemo(() => {
    const totalPhotos = albums.reduce((sum, album) => sum + (album.photos_count ?? album.photos?.length ?? 0), 0);
    return { albums: albumPagination.total, photos: totalPhotos };
  }, [albumPagination.total, albums]);

  const isAlbumCreator = selectedAlbum && String(selectedAlbum.user_id) === String(user?.id);

  const changeAlbumPage = async (page) => {
    setSelectedPhotoIndex(0);
    await loadAlbums(page);
  };

  useEffect(() => {
    if (!selectedAlbum?.photos?.length) {
      setSelectedPhotoIndex(0);
      return;
    }

    if (selectedPhotoIndex >= selectedAlbum.photos.length) {
      setSelectedPhotoIndex(0);
    }
  }, [selectedAlbum, selectedPhotoIndex]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-5 sm:py-8 lg:py-10">
        <div className="space-y-4 sm:space-y-5">
          <section className="card surface-strong p-4 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="eyebrow">
                  <span aria-hidden="true">✦</span>
                  <span>Foto albumi</span>
                </div>
                <h1 className="mt-2 text-3xl font-black text-dark-purple">Foto albumi</h1>
                <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
                  {loading ? "Ielādē albumus..." : `Albumi: ${stats.albums} · Foto šajos albumos: ${stats.photos}`}
                </p>
              </div>

              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:shrink-0">
                <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary w-full sm:w-auto">
                  <span aria-hidden="true">+</span> Jauns albums
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await changeAlbumPage(albumPagination.current_page);
                    setAlbumRefreshToken((current) => current + 1);
                  }}
                  className="btn-ghost w-full sm:w-auto"
                >
                  Atsvaidzināt
                </button>
              </div>
            </div>
          </section>

          {message ? (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          ) : null}
          {error ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="flex min-w-0 gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {albums.map((album) => {
                const isActive = String(selectedAlbumId) === String(album.id);
                return (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => {
                      setSelectedPhotoPage(1);
                      setSelectedPhotoIndex(0);
                      setSelectedAlbumId(album.id);
                    }}
                    aria-pressed={isActive}
                    className={`flex w-[min(78vw,260px)] shrink-0 items-center gap-3 rounded-lg border p-3 text-left transition lg:w-full ${
                      isActive ? "border-[#829984] bg-white shadow-sm" : "border-[#e4e8e1] bg-white/75 hover:bg-white"
                    }`}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#edf2ec] text-2xl">
                      {album.photos?.[0]?.image_path ? (
                        <PrivateImage src={album.photos[0].image_path} alt="" className="h-full w-full object-cover" />
                      ) : (
                        album.emoji || "📷"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-extrabold text-dark-purple">{album.title}</h2>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted">{album.category || "Albums"}</span>
                        <span className="shrink-0 text-xs font-semibold text-[#58735e]">
                          {album.photos_count ?? album.photos?.length ?? 0} foto
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </aside>

            {selectedAlbum && loadedAlbumId === String(selectedAlbum.id) ? (
              <AlbumDetailPanel
                album={selectedAlbum}
                isAlbumCreator={isAlbumCreator}
                showAddPhotoPanel={showAddPhotoPanel}
                deletingAlbum={deletingAlbum}
                photos={photos}
                photoPreviewUrls={photoPreviewUrls}
                uploadingPhoto={uploadingPhoto}
                photoPagination={photoPagination}
                photoPageLoading={albumDetailsLoading}
                onEditAlbum={openAlbumEditor}
                onDeleteAlbum={deleteAlbum}
                onToggleAddPhotoPanel={() => setShowAddPhotoPanel((current) => !current)}
                onGallerySelection={handleGallerySelection}
                onRemovePhoto={removePhotoRow}
                onUpdatePhotoField={updatePhotoField}
                onAddPhoto={handleAddPhoto}
                onOpenPhoto={openViewerAt}
                onPhotoPageChange={(page) => {
                  setSelectedPhotoIndex(0);
                  setSelectedPhotoPage(page);
                }}
              />
            ) : selectedAlbum ? (
              <div className="card surface-strong p-6 text-muted">
                {albumDetailsLoading ? "Ielādē albuma foto..." : "Neizdevās ielādēt albuma foto."}
                {!albumDetailsLoading && (
                  <button type="button" onClick={() => setAlbumRefreshToken((current) => current + 1)} className="btn-ghost mt-3">
                    Mēģināt vēlreiz
                  </button>
                )}
              </div>
            ) : (
                <div className="card surface-strong p-6 text-muted">
                  {loading ? "Ielādē albumus..." : "Nav pieejamu albumu."}
                </div>
            )}
          </div>
          {albumPagination.last_page > 1 && (
            <nav className="flex items-center justify-center gap-3" aria-label="Albumu lapas">
              <button
                type="button"
                onClick={() => changeAlbumPage(albumPagination.current_page - 1)}
                disabled={loading || albumPagination.current_page <= 1}
                className="btn-ghost"
              >
                Iepriekšējie albumi
              </button>
              <span className="text-sm font-semibold text-muted">
                {albumPagination.current_page} / {albumPagination.last_page}
              </span>
              <button
                type="button"
                onClick={() => changeAlbumPage(albumPagination.current_page + 1)}
                disabled={loading || albumPagination.current_page >= albumPagination.last_page}
                className="btn-ghost"
              >
                Nākamie albumi
              </button>
            </nav>
          )}
        </div>
      </div>

      <AlbumModals
        showCreateModal={showCreateModal}
        showAlbumEditModal={showAlbumEditModal}
        showPhotoEditModal={showPhotoEditModal}
        selectedPhoto={selectedPhoto}
        formData={formData}
        photoForm={photoForm}
        users={users}
        sharedUsersLabel={sharedUsersLabel}
        photos={photos}
        photoPreviewUrls={photoPreviewUrls}
        error={error}
        saving={saving}
        albumSaving={albumSaving}
        uploadingPhoto={uploadingPhoto}
        onCloseCreate={() => setShowCreateModal(false)}
        onCloseAlbumEdit={() => setShowAlbumEditModal(false)}
        onClosePhotoEdit={() => setShowPhotoEditModal(false)}
        onCreate={handleCreate}
        onUpdateAlbum={handleUpdateAlbum}
        onUpdatePhoto={persistPhotoEdit}
        onFormChange={handleChange}
        onTogglePublic={togglePublic}
        onToggleSharedUser={toggleSharedUser}
        onAddPhotoRow={addPhotoRow}
        onRemovePhotoRow={removePhotoRow}
        onGallerySelection={handleGallerySelection}
        onUpdatePhotoField={updatePhotoField}
        onPhotoFormChange={(field, value) => setPhotoForm((previous) => ({ ...previous, [field]: value }))}
        onPhotoImageChange={(event) => setPhotoForm((previous) => ({ ...previous, image: event.target.files?.[0] || null }))}
      />

      {showViewer && selectedPhoto ? (
        <AlbumPhotoViewer
          album={selectedAlbum}
          photo={selectedPhoto}
          photoIndex={selectedPhotoIndex}
          usersById={usersById}
          isAlbumCreator={isAlbumCreator}
          reactionLoading={reactionLoading}
          deletingPhoto={deletingPhoto}
          onClose={() => setShowViewer(false)}
          onPrevious={goPrevious}
          onNext={goNext}
          onReact={handleReaction}
          onRemoveReaction={removeReaction}
          onEditPhoto={openPhotoEditor}
          onDeletePhoto={deletePhoto}
        />
      ) : null}
    </div>
  );
}

export default Albums;
