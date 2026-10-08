import React, { useEffect, useMemo, useState } from "react";
import BasePopup from "../../components/BasePopoup";
import AlbumPhotoViewer from "./AlbumPhotoViewer";
import AlbumPhotoBatchForm from "./AlbumPhotoBatchForm";
import AlbumDetailsFields from "./AlbumDetailsFields";
import AlbumDetailPanel from "./AlbumDetailPanel";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

const emptyForm = {
  title: "",
  description: "",
  category: "Notikumu albums",
  emoji: "📷",
  is_public: true,
  shared_with_user_ids: [],
};

const createPhotoEntry = (file = null) => ({
  title: "",
  note: "",
  image: file,
});

function Albums() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAlbumEditModal, setShowAlbumEditModal] = useState(false);
  const [showPhotoEditModal, setShowPhotoEditModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showAddPhotoPanel, setShowAddPhotoPanel] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [photoForm, setPhotoForm] = useState({ title: "", note: "", image: null });
  const [photos, setPhotos] = useState([createPhotoEntry()]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reactionLoading, setReactionLoading] = useState(false);
  const [albumSaving, setAlbumSaving] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);

  useEffect(() => {
    const previewUrls = photos.map((photo) => (photo.image ? URL.createObjectURL(photo.image) : ""));
    setPhotoPreviewUrls(previewUrls);

    return () => previewUrls.forEach((previewUrl) => previewUrl && URL.revokeObjectURL(previewUrl));
  }, [photos]);

  const usersById = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users]);
  const selectedAlbum = useMemo(
    () => albums.find((album) => String(album.id) === String(selectedAlbumId)) || albums[0] || null,
    [albums, selectedAlbumId]
  );

  const selectedPhoto = useMemo(() => {
    if (!selectedAlbum?.photos?.length) return null;
    return selectedAlbum.photos[selectedPhotoIndex] || selectedAlbum.photos[0];
  }, [selectedAlbum, selectedPhotoIndex]);

  const stats = useMemo(() => {
    const totalPhotos = albums.reduce((sum, album) => sum + (album.photos?.length || 0), 0);
    return { albums: albums.length, photos: totalPhotos };
  }, [albums]);

  const isAlbumCreator = selectedAlbum && String(selectedAlbum.user_id) === String(user?.id);

  const sharedUsersLabel = useMemo(() => {
    if (formData.is_public) return "Publisks";
    if (formData.shared_with_user_ids.length === 0) return "Tikai izvēlētajiem cilvēkiem";
    return `Koplietots ar ${formData.shared_with_user_ids.length} cilvēkiem`;
  }, [formData.is_public, formData.shared_with_user_ids.length]);


  // Albuma funkcijas

  
  const loadAlbums = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/albums");
      const nextAlbums = Array.isArray(response.data) ? response.data : [];
      setAlbums(nextAlbums);
      setSelectedAlbumId((current) => current || nextAlbums[0]?.id || "");
      setSelectedPhotoIndex(0);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās ielādēt albumus.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/api/users/status");
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    loadAlbums();
    loadUsers();
  }, []);

  useEffect(() => {
    if (!selectedAlbum?.photos?.length) {
      setSelectedPhotoIndex(0);
      return;
    }

    if (selectedPhotoIndex >= selectedAlbum.photos.length) {
      setSelectedPhotoIndex(0);
    }
  }, [selectedAlbum, selectedPhotoIndex]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleSharedUser = (userId) => {
    setFormData((prev) => {
      const exists = prev.shared_with_user_ids.includes(userId);
      return {
        ...prev,
        shared_with_user_ids: exists
          ? prev.shared_with_user_ids.filter((id) => id !== userId)
          : [...prev.shared_with_user_ids, userId],
      };
    });
  };

  const updatePhotoField = (index, field, value) => {
    setPhotos((prev) =>
      prev.map((photo, photoIndex) => (photoIndex === index ? { ...photo, [field]: value } : photo))
    );
  };

  const addPhotoRow = () => setPhotos((prev) => [...prev, createPhotoEntry()]);

  const removePhotoRow = (index) => {
    setPhotos((prev) => (prev.length === 1 ? prev : prev.filter((_, photoIndex) => photoIndex !== index)));
  };

  const handleGallerySelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setPhotos((prev) => [...prev, ...files.map((file) => createPhotoEntry(file))]);
    event.target.value = "";
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setPhotos([createPhotoEntry()]);
    setError("");
    setMessage("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const validPhotos = photos.filter((photo) => photo.image);
    if (!formData.title.trim()) {
      setError("Albumam vajag nosaukumu.");
      setSaving(false);
      return;
    }

    if (validPhotos.length === 0) {
      setError("Pievieno vismaz vienu foto.");
      setSaving(false);
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    payload.append("category", formData.category.trim());
    payload.append("emoji", formData.emoji.trim() || "📷");
    payload.append("is_public", formData.is_public ? "1" : "0");
    formData.shared_with_user_ids.forEach((userId) => payload.append("shared_with_user_ids[]", userId));

    validPhotos.forEach((photo, index) => {
      payload.append(`photos[${index}][title]`, photo.title.trim() || `Foto ${index + 1}`);
      payload.append(`photos[${index}][note]`, photo.note.trim());
      payload.append(`photos[${index}][image]`, photo.image);
    });

    try {
      const response = await api.post("/api/albums", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdAlbum = response.data?.album;
      if (createdAlbum) {
        setAlbums((prev) => [createdAlbum, ...prev]);
        setSelectedAlbumId(createdAlbum.id);
        setSelectedPhotoIndex(0);
      }

      setShowCreateModal(false);
      resetForm();
      setMessage("Albums izveidots veiksmīgi.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās saglabāt albumu.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAlbum = async (event) => {
    event.preventDefault();
    if (!selectedAlbum) return;

    setAlbumSaving(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    payload.append("category", formData.category.trim());
    payload.append("emoji", formData.emoji.trim() || "📷");
    payload.append("is_public", formData.is_public ? "1" : "0");
    formData.shared_with_user_ids.forEach((userId) => payload.append("shared_with_user_ids[]", userId));
    payload.append("_method", "PUT");

    try {
      const response = await api.post(`/api/albums/${selectedAlbum.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedAlbum = response.data?.album;
      if (updatedAlbum) {
        setAlbums((prev) => prev.map((album) => (String(album.id) === String(updatedAlbum.id) ? updatedAlbum : album)));
      }
      setShowAlbumEditModal(false);
      setMessage("Albums atjaunināts veiksmīgi.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās atjaunināt albumu.");
    } finally {
      setAlbumSaving(false);
    }
  };

  const openAlbumEditor = () => {
    if (!selectedAlbum) return;
    setFormData({
      title: selectedAlbum.title || "",
      description: selectedAlbum.description || "",
      category: selectedAlbum.category || "Notikumu albums",
      emoji: selectedAlbum.emoji || "📷",
      is_public: Boolean(selectedAlbum.is_public),
      shared_with_user_ids: Array.isArray(selectedAlbum.shared_with_user_ids) ? selectedAlbum.shared_with_user_ids : [],
    });
    setShowAlbumEditModal(true);
  };

  const deleteAlbum = async () => {
    if (!selectedAlbum) return;

    const confirmDelete = window.confirm("Vai tiešām dzēst šo albumu?");
    if (!confirmDelete) return;

    setDeletingAlbum(true);
    setError("");

    try {
      await api.delete(`/api/albums/${selectedAlbum.id}`);
      await loadAlbums();
      setMessage("Albums izdzēsts veiksmīgi.");
      setSelectedPhotoIndex(0);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās dzēst albumu.");
    } finally {
      setDeletingAlbum(false);
    }
  };


  // Fotografiju funkcijas


  const handleAddPhoto = async () => {
    if (!selectedAlbum) return;

    const photosToUpload = photos.filter((photo) => photo.image);
    if (photosToUpload.length === 0) {
      setError("Izvēlies foto, ko pievienot.");
      return;
    }

    setUploadingPhoto(true);
    setError("");
    setMessage("");

    try {
      let updatedAlbum = null;

      for (const [index, photo] of photosToUpload.entries()) {
        const payload = new FormData();
        payload.append("title", photo.title.trim() || `Foto ${selectedAlbum.photos.length + index + 1}`);
        payload.append("note", photo.note.trim());
        payload.append("image", photo.image);

        const response = await api.post(`/api/albums/${selectedAlbum.id}/photos`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedAlbum = response.data?.album || updatedAlbum;
      }

      if (updatedAlbum) {
        setAlbums((prev) => prev.map((album) => (
          String(album.id) === String(updatedAlbum.id) ? updatedAlbum : album
        )));
        setSelectedAlbumId(updatedAlbum.id);
        setSelectedPhotoIndex(0);
      }

      setPhotos([createPhotoEntry()]);
      setShowAddPhotoPanel(false);
      setMessage("Foto pievienota veiksmīgi.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās pievienot foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openPhotoEditor = () => {
    setShowViewer(false);
    if (!selectedPhoto) return;
    setPhotoForm({
      title: selectedPhoto.title || "",
      note: selectedPhoto.note || "",
      image: null,
    });
    setShowPhotoEditModal(true);
  };

  const persistPhotoEdit = async (event) => {
    event.preventDefault();
    if (!selectedAlbum || !selectedPhoto) return;

    setUploadingPhoto(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("title", photoForm.title.trim());
    payload.append("note", photoForm.note.trim());
    if (photoForm.image) {
      payload.append("image", photoForm.image);
    }
    payload.append("_method", "PUT");

    try {
      const response = await api.post(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedAlbum = response.data?.album;
      if (updatedAlbum) {
        setAlbums((prev) => prev.map((album) => (String(album.id) === String(updatedAlbum.id) ? updatedAlbum : album)));
      }
      setShowPhotoEditModal(false);
      setMessage("Foto atjaunināta veiksmīgi.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās atjaunināt foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deletePhoto = async () => {
    if (!selectedAlbum || !selectedPhoto) return;

    const confirmDelete = window.confirm("Vai tiešām dzēst šo foto?");
    if (!confirmDelete) return;

    setDeletingPhoto(true);
    setError("");

    try {
      await api.delete(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}`);
      await loadAlbums();
      setSelectedPhotoIndex(0);
      setMessage("Foto izdzēsta veiksmīgi.");
      setShowViewer(false);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās dzēst foto.");
    } finally {
      setDeletingPhoto(false);
    }
  };

  const goPrevious = () => {
    if (!selectedAlbum?.photos?.length) return;
    setSelectedPhotoIndex((current) => (current - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length);
  };

  const goNext = () => {
    if (!selectedAlbum?.photos?.length) return;
    setSelectedPhotoIndex((current) => (current + 1) % selectedAlbum.photos.length);
  };

  const openViewerAt = (index) => {
    setSelectedPhotoIndex(index);
    setShowViewer(true);
  };


  // Reakciju funkcijas
  
  
  const handleReaction = async (emoji) => {
    if (!selectedAlbum || !selectedPhoto) return;

    setReactionLoading(true);
    setError("");

    try {
      const response = await api.post(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}/react`, { emoji });
      const updatedPhoto = response.data?.photo;
      if (updatedPhoto) {
        setAlbums((prev) =>
          prev.map((album) => ({
            ...album,
            photos: (album.photos || []).map((photo) =>
              String(album.id) === String(selectedAlbum.id) && String(photo.id) === String(updatedPhoto.id)
                ? updatedPhoto
                : photo
            ),
          }))
        );
      }
      setMessage("Reakcija saglabāta.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās saglabāt reakciju.");
    } finally {
      setReactionLoading(false);
    }
  };

  const removeReaction = async () => {
    if (!selectedAlbum || !selectedPhoto) return;

    setReactionLoading(true);
    setError("");

    try {
      const response = await api.delete(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}/react`);
      const updatedPhoto = response.data?.photo;
      if (updatedPhoto) {
        setAlbums((prev) =>
          prev.map((album) => ({
            ...album,
            photos: (album.photos || []).map((photo) =>
              String(album.id) === String(selectedAlbum.id) && String(photo.id) === String(updatedPhoto.id)
                ? updatedPhoto
                : photo
            ),
          }))
        );
      }
      setMessage("Reakcija noņemta.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās noņemt reakciju.");
    } finally {
      setReactionLoading(false);
    }
  };

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
                  {loading ? "Ielādē albumus..." : `Albumi: ${stats.albums} · Foto: ${stats.photos}`}
                </p>
              </div>

              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:shrink-0">
                <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary w-full sm:w-auto">
                  <span aria-hidden="true">+</span> Jauns albums
                </button>
                <button type="button" onClick={loadAlbums} className="btn-ghost w-full sm:w-auto">
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
                    onClick={() => setSelectedAlbumId(album.id)}
                    aria-pressed={isActive}
                    className={`flex w-[min(78vw,260px)] shrink-0 items-center gap-3 rounded-lg border p-3 text-left transition lg:w-full ${
                      isActive ? "border-[#829984] bg-white shadow-sm" : "border-[#e4e8e1] bg-white/75 hover:bg-white"
                    }`}
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#edf2ec] text-2xl">
                      {album.photos?.[0]?.image_path ? (
                        <img src={album.photos[0].image_path} alt="" className="h-full w-full object-cover" />
                      ) : (
                        album.emoji || "📷"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-extrabold text-dark-purple">{album.title}</h2>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted">{album.category || "Albums"}</span>
                        <span className="shrink-0 text-xs font-semibold text-[#58735e]">
                          {album.photos?.length || 0} foto
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </aside>

            {selectedAlbum ? (
              <AlbumDetailPanel
                album={selectedAlbum}
                isAlbumCreator={isAlbumCreator}
                showAddPhotoPanel={showAddPhotoPanel}
                deletingAlbum={deletingAlbum}
                photos={photos}
                photoPreviewUrls={photoPreviewUrls}
                uploadingPhoto={uploadingPhoto}
                onEditAlbum={openAlbumEditor}
                onDeleteAlbum={deleteAlbum}
                onToggleAddPhotoPanel={() => setShowAddPhotoPanel((current) => !current)}
                onGallerySelection={handleGallerySelection}
                onRemovePhoto={removePhotoRow}
                onUpdatePhotoField={updatePhotoField}
                onAddPhoto={handleAddPhoto}
                onOpenPhoto={openViewerAt}
              />
            ) : (
                <div className="card surface-strong p-6 text-muted">
                  {loading ? "Ielādē albumus..." : "Nav pieejamu albumu."}
                </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <BasePopup title="Jauns albums" onClose={() => setShowCreateModal(false)} width="980px">
          <form onSubmit={handleCreate} className="space-y-4">
            <AlbumDetailsFields
              formData={formData}
              users={users}
              sharedUsersLabel={sharedUsersLabel}
              onChange={handleChange}
              onTogglePublic={() => setFormData((previous) => ({ ...previous, is_public: !previous.is_public }))}
              onToggleSharedUser={toggleSharedUser}
            />

            <AlbumPhotoBatchForm
              photos={photos}
              photoPreviewUrls={photoPreviewUrls}
              onAddRow={addPhotoRow}
              onRemoveRow={removePhotoRow}
              onGallerySelection={handleGallerySelection}
              onUpdateField={updatePhotoField}
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-ghost">
                Atcelt
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saglabā..." : "Saglabāt albumu"}
              </button>
            </div>
          </form>
        </BasePopup>
      )}

      {showAlbumEditModal && (
        <BasePopup title="Labot albumu" onClose={() => setShowAlbumEditModal(false)} width="860px">
          <form onSubmit={handleUpdateAlbum} className="space-y-4">
            <AlbumDetailsFields
              formData={formData}
              users={users}
              sharedUsersLabel={sharedUsersLabel}
              onChange={handleChange}
              onTogglePublic={() => setFormData((previous) => ({ ...previous, is_public: !previous.is_public }))}
              onToggleSharedUser={toggleSharedUser}
            />

            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setShowAlbumEditModal(false)} className="btn-ghost">
                Atcelt
              </button>
              <button type="submit" disabled={albumSaving} className="btn-primary">
                {albumSaving ? "Saglabā..." : "Saglabāt izmaiņas"}
              </button>
            </div>
          </form>
        </BasePopup>
      )}

      {showPhotoEditModal && selectedPhoto ? (
        <BasePopup title="Labot foto" onClose={() => setShowPhotoEditModal(false)} width="760px">
          <form onSubmit={persistPhotoEdit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <div className="h-44 overflow-hidden rounded-[1.5rem] border border-white/80 bg-warm-beige/30">
                <img src={selectedPhoto.image_path} alt={selectedPhoto.title} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
                  <input value={photoForm.title} onChange={(e) => setPhotoForm((prev) => ({ ...prev, title: e.target.value }))} className="input-field" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-dark-purple">Piezīme</span>
                  <textarea value={photoForm.note} onChange={(e) => setPhotoForm((prev) => ({ ...prev, note: e.target.value }))} className="text-area-field" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-dark-purple">Nomainīt attēlu</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhotoForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
                    className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowPhotoEditModal(false)} className="btn-ghost">
                Atcelt
              </button>
              <button type="submit" disabled={uploadingPhoto} className="btn-primary">
                {uploadingPhoto ? "Saglabā..." : "Saglabāt foto"}
              </button>
            </div>
          </form>
        </BasePopup>
      ) : null}

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
