import React, { useEffect, useMemo, useState } from "react";
import BasePopup from "../../components/BasePopoup";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const emojiOptions = ["❤️", "😍", "🔥", "👏", "😂", "🎉", "😮", "👍"];

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

const createPreviewUrl = (file) => (file ? URL.createObjectURL(file) : "");

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
  const [formData, setFormData] = useState(emptyForm);
  const [photoForm, setPhotoForm] = useState({ title: "", note: "", image: null });
  const [photos, setPhotos] = useState([createPhotoEntry()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reactionLoading, setReactionLoading] = useState(false);
  const [albumSaving, setAlbumSaving] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
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

  const loadAlbums = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/albums");
      const nextAlbums = Array.isArray(response.data) ? response.data : [];
      setAlbums(nextAlbums);
      setSelectedAlbumId((current) => current || nextAlbums[0]?.id || "");
      setSelectedPhotoIndex(0);
      console.log(response);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās ielādēt albumus.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/api/users/status");
      const combined = [...(response.data.online || []), ...(response.data.offline || [])];
      const uniqueUsers = Array.from(new Map(combined.map((user) => [user.id, user])).values());
      setUsers(uniqueUsers);
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

    payload.append("cover_photo_index", "0");

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

  const handleAddPhoto = async () => {
    if (!selectedAlbum) return;

    const nextPhoto = photos[0];
    if (!nextPhoto?.image) {
      setError("Izvēlies foto, ko pievienot.");
      return;
    }

    setUploadingPhoto(true);
    setError("");
    setMessage("");

    const payload = new FormData();
    payload.append("title", nextPhoto.title.trim() || `Foto ${selectedAlbum.photos.length + 1}`);
    payload.append("note", nextPhoto.note.trim());
    payload.append("image", nextPhoto.image);

    try {
      const response = await api.post(`/api/albums/${selectedAlbum.id}/photos`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedAlbum = response.data?.album;
      if (updatedAlbum) {
        setAlbums((prev) =>
          prev.map((album) => (String(album.id) === String(updatedAlbum.id) ? updatedAlbum : album))
        );
        setSelectedAlbumId(updatedAlbum.id);
        setSelectedPhotoIndex(0);
      }

      setPhotos([createPhotoEntry()]);
      setMessage("Foto pievienota veiksmīgi.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās pievienot foto.");
    } finally {
      setUploadingPhoto(false);
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

  const openPhotoEditor = () => {
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

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="space-y-6">
          <section className="card surface-strong">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="eyebrow">
                  <span>📚</span>
                  <span>Foto albumi</span>
                </div>
                <h1 className="section-title">Albumi no notikumiem, svētkiem un ikdienas mirkļiem</h1>
                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Veido albumus, pievieno daudz foto, skaties tos pilnekrāna skatā un pārlūko ar iepriekšējo / nākamo foto.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary">
                  + Jauns albums
                </button>
                <button type="button" onClick={loadAlbums} className="btn-ghost">
                  Atsvaidzināt
                </button>
              </div>
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {message}
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/80 bg-white/75 p-4">
                <div className="text-sm font-semibold text-muted">Albumi</div>
                <div className="mt-2 text-3xl font-black text-dark-purple">{stats.albums}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/80 bg-white/75 p-4">
                <div className="text-sm font-semibold text-muted">Foto</div>
                <div className="mt-2 text-3xl font-black text-dark-purple">{stats.photos}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/80 bg-white/75 p-4">
                <div className="text-sm font-semibold text-muted">Statuss</div>
                <div className="mt-2 text-lg font-black text-dark-purple">{loading ? "Ielādē..." : "Gatavs"}</div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-3">
              {albums.map((album) => {
                const isActive = String(selectedAlbumId) === String(album.id);
                return (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => setSelectedAlbumId(album.id)}
                    className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                      isActive ? "border-medium-purple bg-white shadow-md" : "border-white/70 bg-white/75 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c5cff] to-[#12b5a6] text-2xl shadow-lg">
                        {album.emoji || "📷"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="truncate text-base font-black text-dark-purple">{album.title}</h2>
                          <span className="rounded-full bg-medium-purple/10 px-2 py-1 text-xs font-bold text-medium-purple">
                            {album.photos?.length || 0}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                          {album.description || "Nav apraksta."}
                        </p>
                        <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-medium-purple">
                          {album.category || "Albums"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </aside>

            <section className="space-y-4">
              {selectedAlbum ? (
                <>
                  <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-soft sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#7c5cff] to-[#12b5a6] text-3xl shadow-lg">
                          {selectedAlbum.emoji || "📷"}
                        </div>
                        <div>
                          <div className="eyebrow">{selectedAlbum.category || "Albums"}</div>
                          <h2 className="mt-3 text-2xl font-black text-dark-purple">{selectedAlbum.title}</h2>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                            {selectedAlbum.description || "Nav apraksta."}
                          </p>
                          <div className="mt-2 text-xs font-semibold text-medium-purple">
                            {selectedAlbum.is_public ? "Publisks" : "Tikai izvēlētajiem cilvēkiem"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {isAlbumCreator ? (
                          <>
                            <button type="button" onClick={openAlbumEditor} className="btn-ghost px-4 py-2 text-sm">
                              Labot albumu
                            </button>
                            <button type="button" onClick={deleteAlbum} disabled={deletingAlbum} className="btn-ghost px-4 py-2 text-sm">
                              {deletingAlbum ? "Dzēš..." : "Dzēst albumu"}
                            </button>
                          </>
                        ) : null}
                        <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm font-semibold text-dark-purple">
                          {selectedAlbum.photos?.length || 0} foto
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-soft sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-dark-purple">Pievienot vēl foto</h3>
                        <p className="mt-2 text-sm text-muted">
                          Atver vienu reizi un izvēlies vairākus foto failus. Tos vari pielāgot vai pievienot vēlāk.
                        </p>
                      </div>
                      <button type="button" onClick={handleAddPhoto} disabled={uploadingPhoto} className="btn-primary">
                        {uploadingPhoto ? "Saglabā..." : "Pievienot foto"}
                      </button>
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
                            onChange={handleGallerySelection}
                            className="sr-only"
                          />
                        </label>
                      </label>
                      <p className="mt-2 text-xs text-muted">
                        Izvēlētie faili tiks pievienoti kā atsevišķi foto ieraksti zemāk.
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={addPhotoRow} className="btn-ghost">
                        + Pievienot vēl vienu foto
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedAlbum.photos?.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openViewerAt(index)}
                        className="card surface-strong overflow-hidden p-0 text-left transition hover:-translate-y-0.5"
                      >
                        <div className="h-44 bg-gradient-to-br from-[#e6dccf] via-white to-[#f7f3ef]">
                          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-black text-dark-purple">{item.title}</h3>
                            <span className="rounded-full bg-medium-purple/10 px-2 py-1 text-xs font-bold text-medium-purple">
                              {item.likes_count || 0} ♥
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted">{item.note || "Nav piezīmes."}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="card surface-strong p-6 text-muted">
                  {loading ? "Ielādē albumus..." : "Nav pieejamu albumu."}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <BasePopup title="Jauns albums" onClose={() => setShowCreateModal(false)} width="980px">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
                <input name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="Piemēram: Kāzas" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-dark-purple">Kategorija</span>
                <input name="category" value={formData.category} onChange={handleChange} className="input-field" placeholder="Notikumu albums" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-dark-purple">Emoji</span>
                <input name="emoji" value={formData.emoji} onChange={handleChange} className="input-field" placeholder="📷" />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Apraksts</span>
              <textarea name="description" value={formData.description} onChange={handleChange} className="text-area-field" placeholder="Kāds ir šis albums?" />
            </label>

            <div className="rounded-2xl border border-dashed border-medium-purple/25 bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-dark-purple">Foto, ko pievienosi albumam</h3>
                  <p className="mt-1 text-xs text-muted">Vari vienlaikus izvēlēties vairākus foto failus.</p>
                </div>
                <button type="button" onClick={addPhotoRow} className="btn-ghost px-4 py-2 text-sm">
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
                      onChange={handleGallerySelection}
                      className="sr-only"
                    />
                  </label>
                </label>
              </div>

              <div className="mt-4 grid gap-4">
                {photos.map((photo, index) => {
                  const previewUrl = createPreviewUrl(photo.image);

                  return (
                    <div key={index} className="rounded-[1.5rem] border border-white/80 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/80 bg-warm-beige/30 shadow-sm">
                            {photo.image ? (
                              <img
                                src={previewUrl}
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

                        <button type="button" onClick={() => removePhotoRow(index)} className="btn-ghost px-3 py-2 text-sm">
                          Noņemt
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <label className="grid gap-2 md:col-span-1">
                          <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
                          <input
                            value={photo.title}
                            onChange={(event) => updatePhotoField(index, "title", event.target.value)}
                            className="input-field"
                            placeholder="Piemēram: Ierašanās"
                          />
                        </label>
                        <label className="grid gap-2 md:col-span-1">
                          <span className="text-sm font-semibold text-dark-purple">Piezīme</span>
                          <input
                            value={photo.note}
                            onChange={(event) => updatePhotoField(index, "note", event.target.value)}
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
                                onChange={(event) => updatePhotoField(index, "image", event.target.files?.[0] || null)}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-medium-purple/25 bg-white/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-dark-purple">Privātums</h3>
                  <p className="mt-1 text-xs text-muted">{sharedUsersLabel}</p>
                </div>
                <button type="button" onClick={() => setFormData((prev) => ({ ...prev, is_public: !prev.is_public }))} className="btn-ghost px-4 py-2 text-sm">
                  {formData.is_public ? "Padarīt privātu" : "Padarīt publisku"}
                </button>
              </div>

              {!formData.is_public ? (
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
                            onClick={() => toggleSharedUser(user.id)}
                            className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                              checked ? "border-medium-purple bg-medium-purple/10" : "border-white/80 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold text-dark-purple">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-muted">{user.is_admin ? "Administrators" : "Lietotājs"}</div>
                            </div>
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
              ) : null}
            </div>

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
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-dark-purple">Nosaukums</span>
                <input name="title" value={formData.title} onChange={handleChange} className="input-field" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-dark-purple">Kategorija</span>
                <input name="category" value={formData.category} onChange={handleChange} className="input-field" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-dark-purple">Emoji</span>
                <input name="emoji" value={formData.emoji} onChange={handleChange} className="input-field" />
              </label>
              <label className="grid gap-2 items-start">
                <span className="text-sm font-semibold text-dark-purple">Publisks albums</span>
                <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} className="h-5 w-5" />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-dark-purple">Apraksts</span>
              <textarea name="description" value={formData.description} onChange={handleChange} className="text-area-field" />
            </label>

            <div className="rounded-2xl border border-white/80 bg-white/75 p-4">
              <div className="mb-3">
                <h4 className="text-sm font-bold text-dark-purple">Koplietot ar konkrētiem cilvēkiem</h4>
              </div>
              {users.length > 0 ? (
                <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {users.map((user) => {
                    const checked = formData.shared_with_user_ids.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleSharedUser(user.id)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                          checked ? "border-medium-purple bg-medium-purple/10" : "border-white/80 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-dark-purple">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-muted">{user.is_admin ? "Administrators" : "Lietotājs"}</div>
                        </div>
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
                <img src={selectedPhoto.image_url} alt={selectedPhoto.title} className="h-full w-full object-cover" />
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
        <div className="modal-backdrop">
          <div className="card surface-strong w-full max-w-5xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow">Skatīt foto</div>
                <h3 className="mt-2 text-2xl font-black text-dark-purple">{selectedPhoto.title}</h3>
                <p className="mt-2 text-sm text-muted">{selectedPhoto.note || "Nav piezīmes."}</p>
              </div>
              <button type="button" className="btn-ghost h-10 w-10 !p-0" onClick={() => setShowViewer(false)}>
                ✕
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-white/80 bg-warm-beige/20">
              <img src={selectedPhoto.image_url} alt={selectedPhoto.title} className="max-h-[58vh] w-full object-contain bg-black/5" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={goPrevious} className="btn-ghost">
                  ← Iepriekšējais
                </button>
                <button type="button" onClick={goNext} className="btn-ghost">
                  Nākamais →
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleReaction("❤️")} disabled={reactionLoading} className="btn-ghost">
                  ❤️ Patīk
                </button>
                <button type="button" onClick={() => handleReaction("😍")} disabled={reactionLoading} className="btn-ghost">
                  😍
                </button>
                <button type="button" onClick={() => handleReaction("🔥")} disabled={reactionLoading} className="btn-ghost">
                  🔥
                </button>
                <button type="button" onClick={removeReaction} disabled={reactionLoading} className="btn-ghost">
                  Noņemt reakciju
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={openPhotoEditor} className="btn-primary">
                Labot foto
              </button>
              <button type="button" onClick={deletePhoto} disabled={deletingPhoto} className="btn-ghost">
                {deletingPhoto ? "Dzēš..." : "Dzēst foto"}
              </button>
            </div>

            {selectedPhoto.reactions && Object.keys(selectedPhoto.reactions).length > 0 ? (
              <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-4">
                <div className="text-sm font-bold text-dark-purple">Reakcijas</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {Object.entries(selectedPhoto.reactions).map(([userId, reaction]) => {
                    const reactor = usersById.get(String(userId));
                    const reactorName = reactor
                      ? `${reactor.first_name || ""} ${reactor.last_name || ""}`.trim()
                      : `Lietotājs #${userId}`;
                    return (
                      <div key={userId} className="flex items-center justify-between rounded-xl border border-white/80 bg-white px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-dark-purple">{reactorName}</div>
                          <div className="text-xs text-muted">Reakcija uz šo foto</div>
                        </div>
                        <span className="rounded-full bg-medium-purple/10 px-3 py-1 text-lg font-bold text-medium-purple">
                          {reaction}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Albums;
