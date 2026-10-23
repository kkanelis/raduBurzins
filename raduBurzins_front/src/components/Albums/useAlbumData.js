import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function useAlbumData(setError) {
  const [albums, setAlbums] = useState([]);
  const [albumPagination, setAlbumPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [users, setUsers] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedAlbumDetails, setSelectedAlbumDetails] = useState(null);
  const [loadedAlbumId, setLoadedAlbumId] = useState("");
  const [albumDetailsLoading, setAlbumDetailsLoading] = useState(false);
  const [albumRefreshToken, setAlbumRefreshToken] = useState(0);
  const [selectedPhotoPage, setSelectedPhotoPage] = useState(1);
  const [photoPagination, setPhotoPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const selectedAlbum = useMemo(
    () => (String(selectedAlbumDetails?.id) === String(selectedAlbumId)
      ? selectedAlbumDetails
      : albums.find((album) => String(album.id) === String(selectedAlbumId)) || albums[0] || null),
    [albums, selectedAlbumDetails, selectedAlbumId]
  );

  const loadAlbums = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/albums", { params: { page } });
      const nextAlbums = Array.isArray(response.data?.data) ? response.data.data : [];
      setAlbums(nextAlbums);
      setAlbumPagination({
        current_page: response.data?.current_page || page,
        last_page: response.data?.last_page || 1,
        total: response.data?.total || 0,
      });
      setSelectedPhotoPage(1);
      setSelectedAlbumId((current) => (
        nextAlbums.some((album) => String(album.id) === String(current))
          ? current
          : nextAlbums[0]?.id || ""
      ));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Neizdevās ielādēt albumus.");
    } finally {
      setLoading(false);
    }
  }, [setError]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get("/api/users/status");
      setUsers(Array.isArray(response.data?.users) ? response.data.users : []);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadAlbums();
    loadUsers();
  }, [loadAlbums, loadUsers]);

  useEffect(() => {
    if (!selectedAlbumId) {
      setLoadedAlbumId("");
      setSelectedAlbumDetails(null);
      return undefined;
    }

    let isCurrentRequest = true;
    setAlbumDetailsLoading(true);
    setLoadedAlbumId("");

    api.get(`/api/albums/${selectedAlbumId}`, { params: { photos_page: selectedPhotoPage } })
      .then((response) => {
        if (!isCurrentRequest) return;

        const detailedAlbum = response.data;
        setSelectedAlbumDetails(detailedAlbum);
        setPhotoPagination(detailedAlbum.photos_pagination || {
          current_page: 1,
          last_page: 1,
          total: detailedAlbum.photos_count || 0,
        });
        setLoadedAlbumId(String(selectedAlbumId));
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(requestError?.response?.data?.message || "Neizdevās ielādēt albuma foto.");
        }
      })
      .finally(() => {
        if (isCurrentRequest) setAlbumDetailsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedAlbumId, selectedPhotoPage, albumRefreshToken, setError]);

  return {
    albums,
    setAlbums,
    albumPagination,
    users,
    selectedAlbumId,
    setSelectedAlbumId,
    setSelectedAlbumDetails,
    loadedAlbumId,
    albumDetailsLoading,
    albumRefreshToken,
    setAlbumRefreshToken,
    selectedPhotoPage,
    setSelectedPhotoPage,
    photoPagination,
    loading,
    selectedAlbum,
    loadAlbums,
  };
}

export default useAlbumData;