import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "";
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffMinutes < 1) return "redzēts pirms dažām sekundēm";
  if (diffMinutes < 60) return `redzēts pirms ${diffMinutes} minūtēm`;
  if (diffMinutes < 1440) return `redzēts pirms ${Math.floor(diffMinutes / 60)} stundām`;
  return "vairāk nekā dienu";
};

const getDisplayName = (member) => `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();

const getInitials = (member) => {
  const first = member.first_name?.[0] ?? "";
  const last = member.last_name?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
};

const getProfileImageUrl = (member) =>
  member?.avatar_url ||
  member?.avatar_path ||
  "";

function UserSidebar() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const members = useMemo(() => [...onlineUsers, ...offlineUsers], [onlineUsers, offlineUsers]);
  const currentUserImageUrl = getProfileImageUrl(user);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/status");
      setOnlineUsers(Array.isArray(response.data.online) ? response.data.online : []);
      setOfflineUsers(Array.isArray(response.data.offline) ? response.data.offline : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      await api.post("/api/users/status");
      await fetchUsers();
    } catch (error) {
      console.error("Neizdevās atjaunināt statusu:", error);
    }
  };

  useEffect(() => {
    if (!user) return undefined;

    const initialize = async () => {
      setIsLoading(true);
      await updateStatus();
      await fetchUsers();
    };

    initialize();

    const statusInterval = setInterval(updateStatus, 30000);
    const fetchInterval = setInterval(fetchUsers, 60000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(fetchInterval);
    };
  }, [user]);

  if (isLoading) {
    return (
      <aside className="hidden w-full shrink-0 p-4 lg:block lg:w-[23rem] xl:w-[25rem]">
        <div className="card sticky top-24">Ielādē ģimenes paneli...</div>
      </aside>
    );
  }

  if (collapsed) {
    return (
      <aside className="hidden shrink-0 p-3 lg:block lg:w-16 xl:w-16">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="btn-ghost sticky top-24 h-12 w-12 !p-0 text-lg shadow-sm"
          aria-label="Atvērt sānjoslu"
          title="Atvērt sānjoslu"
        >
          ›
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden shrink-0 p-3 lg:block lg:w-[23rem] xl:w-[25rem]">
      <div className="card sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-white/70 pb-4">
          <div className="min-w-0">
            <div className="eyebrow">
              <span>✦</span>
              <span>Panelis</span>
            </div>
            <h2 className="mt-3 text-xl font-black tracking-tight text-dark-purple">
              Ātra piekļuve visam svarīgajam
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Šeit redzi ģimenes statusu, īsceļus un tieši to, kas notiek tagad.
            </p>
          </div>

          <button
            type="button"
            aria-pressed={collapsed}
            aria-label="Sakļaut sānjoslu"
            onClick={() => setCollapsed(true)}
            className="btn-ghost shrink-0 px-3 py-2"
          >
            <span>‹</span>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-[1.5rem] border border-white/80 bg-white/75 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-medium-purple text-sm font-black text-white">
                {currentUserImageUrl ? (
                  <img
                    src={currentUserImageUrl}
                    alt={`${getDisplayName(user)} profils`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user)
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-dark-purple">
                  {getDisplayName(user)}
                </div>
                <div className="text-xs text-muted">Tavs profils</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">Tiešsaistē</div>
              <div className="mt-1 text-2xl font-black text-emerald-800">{onlineUsers.length}</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">Bezsaistē</div>
              <div className="mt-1 text-2xl font-black text-amber-800">{offlineUsers.length}</div>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700">Kopā</div>
              <div className="mt-1 text-2xl font-black text-violet-800">{members.length}</div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/80 bg-white/75 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black tracking-wide text-dark-purple">Tiešsaistē</h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">
                {members.length} lietotāji
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              {members.map((member) => {
                const isOnline = onlineUsers.some((item) => String(item.id) === String(member.id));
                const profileImageUrl =
                  String(member.id) === String(user?.id) ? currentUserImageUrl : getProfileImageUrl(member);

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-medium-purple text-sm font-black text-white">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt={`${getDisplayName(member)} profils`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(member)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-dark-purple">
                        {member.is_admin ? "⭐ " : ""}
                        {getDisplayName(member)}
                      </div>
                      <div className="text-xs text-muted">
                        {isOnline ? "Tiešsaistē" : "Bezsaistē"}
                        {member.last_seen ? ` · ${formatLastSeen(member.last_seen)}` : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default UserSidebar;
