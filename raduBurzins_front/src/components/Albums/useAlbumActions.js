import { useEffect, useMemo, useState } from "react";
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

function useAlbumActions({
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
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [photoForm, setPhotoForm] = useState({ title: "", note: "", image: null });
  const [photos, setPhotos] = useState([createPhotoEntry()]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [albumSaving, setAlbumSaving] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);

  useEffect(() => {
    const previewUrls = photos.map((photo) => (photo.image ? URL.createObjectURL(photo.image) : ""));
    setPhotoPreviewUrls(previewUrls);

    return () => previewUrls.forEach((previewUrl) => previewUrl && URL.revokeObjectURL(previewUrl));
  }, [photos]);

  const sharedUsersLabel = useMemo(() => {
    if (formData.is_public) return "Publisks";
    if (formData.shared_with_user_ids.length === 0) return "Tikai izvēlētajiem cilvēkiem";
    return `Koplietots ar ${formData.shared_with_user_ids.length} cilvēkiem`;
  }, [formData.is_public, formData.shared_with_user_ids.length]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const togglePublic = () => {
    setFormData((previous) => ({ ...previous, is_public: !previous.is_public }));
  };

  const toggleSharedUser = (userId) => {
    setFormData((previous) => {
      const exists = previous.shared_with_user_ids.includes(userId);
      return {
        ...previous,
        shared_with_user_ids: exists
          ? previous.shared_with_user_ids.filter((id) => id !== userId)
          : [...previous.shared_with_user_ids, userId],
      };
    });
  };

  const updatePhotoField = (index, field, value) => {
    setPhotos((previous) => previous.map((photo, photoIndex) => (
      photoIndex === index ? { ...photo, [field]: value } : photo
    )));
  };

  const addPhotoRow = () => setPhotos((previous) => [...previous, createPhotoEntry()]);

  const removePhotoRow = (index) => {
    setPhotos((previous) => (previous.length === 1
      ? previous
      : previous.filter((_, photoIndex) => photoIndex !== index)));
  };

  const handleGallerySelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setPhotos((previous) => [...previous, ...files.map((file) => createPhotoEntry(file))]);
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
        await loadAlbums(1);
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
        setAlbums((previous) => previous.map((album) => (
          String(album.id) === String(updatedAlbum.id) ? updatedAlbum : album
        )));
        setSelectedAlbumDetails((current) => (current
          ? { ...current, ...updatedAlbum, photos: current.photos, photos_pagination: current.photos_pagination }
          : updatedAlbum));
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
    if (!selectedAlbum || !window.confirm("Vai tiešām dzēst šo albumu?")) return;

    setDeletingAlbum(true);
    setError("");

    try {
      await api.delete(`/api/albums/${selectedAlbum.id}`);
      await loadAlbums(1);
      setMessage("Albums izdzēsts veiksmīgi.");
      setSelectedPhotoIndex(0);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās dzēst albumu.");
    } finally {
      setDeletingAlbum(false);
    }
  };

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
      for (const [index, photo] of photosToUpload.entries()) {
        const payload = new FormData();
        payload.append("title", photo.title.trim() || `Foto ${(selectedAlbum.photos_count || 0) + index + 1}`);
        payload.append("note", photo.note.trim());
        payload.append("image", photo.image);

        await api.post(`/api/albums/${selectedAlbum.id}/photos`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setAlbumRefreshToken((current) => current + 1);
      setSelectedPhotoPage(1);
      setSelectedPhotoIndex(0);
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
    if (photoForm.image) payload.append("image", photoForm.image);
    payload.append("_method", "PUT");

    try {
      await api.post(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlbumRefreshToken((current) => current + 1);
      setShowPhotoEditModal(false);
      setMessage("Foto atjaunināta veiksmīgi.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās atjaunināt foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deletePhoto = async () => {
    if (!selectedAlbum || !selectedPhoto || !window.confirm("Vai tiešām dzēst šo foto?")) return;

    setDeletingPhoto(true);
    setError("");

    try {
      await api.delete(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}`);
      await loadAlbums(albumPagination.current_page);
      setAlbumRefreshToken((current) => current + 1);
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
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex((current) => current - 1);
      return;
    }

    const previousPage = photoPagination.current_page > 1
      ? photoPagination.current_page - 1
      : photoPagination.last_page;
    const previousPagePhotoCount = previousPage === photoPagination.last_page
      ? (photoPagination.total % photoPagination.per_page || photoPagination.per_page)
      : photoPagination.per_page;

    setSelectedPhotoIndex(previousPagePhotoCount - 1);
    setSelectedPhotoPage(previousPage);
  };

  const goNext = () => {
    if (!selectedAlbum?.photos?.length) return;
    if (selectedPhotoIndex < selectedAlbum.photos.length - 1) {
      setSelectedPhotoIndex((current) => current + 1);
      return;
    }

    setSelectedPhotoIndex(0);
    setSelectedPhotoPage((current) => (current < photoPagination.last_page ? current + 1 : 1));
  };

  const openViewerAt = (index) => {
    setSelectedPhotoIndex(index);
    setShowViewer(true);
  };

  const handleReaction = async (emoji) => {
    if (!selectedAlbum || !selectedPhoto) return;

    setReactionLoading(true);
    setError("");

    try {
      const response = await api.post(`/api/albums/${selectedAlbum.id}/photos/${selectedPhoto.id}/react`, { emoji });
      const updatedPhoto = response.data?.photo;
      if (updatedPhoto) {
        setAlbums((previous) => previous.map((album) => ({
          ...album,
          photos: (album.photos || []).map((photo) => (
            String(album.id) === String(selectedAlbum.id) && String(photo.id) === String(updatedPhoto.id)
              ? updatedPhoto
              : photo
          )),
        })));
        setSelectedAlbumDetails((current) => (current ? {
          ...current,
          photos: current.photos.map((photo) => (
            String(photo.id) === String(updatedPhoto.id) ? updatedPhoto : photo
          )),
        } : current));
      }
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
        setAlbums((previous) => previous.map((album) => ({
          ...album,
          photos: (album.photos || []).map((photo) => (
            String(album.id) === String(selectedAlbum.id) && String(photo.id) === String(updatedPhoto.id)
              ? updatedPhoto
              : photo
          )),
        })));
        setSelectedAlbumDetails((current) => (current ? {
          ...current,
          photos: current.photos.map((photo) => (
            String(photo.id) === String(updatedPhoto.id) ? updatedPhoto : photo
          )),
        } : current));
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās noņemt reakciju.");
    } finally {
      setReactionLoading(false);
    }
  };

  return {
    formData,
    setFormData,
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
  };
}

export default useAlbumActions;
