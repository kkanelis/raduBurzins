import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { createFamilyChatMessage, loadFamilyChatMessages, saveFamilyChatMessages } from "../../services/familyChatStorage";

const getDisplayName = (member) => `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  });

function FamilyChat() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const members = useMemo(() => [...onlineUsers, ...offlineUsers], [onlineUsers, offlineUsers]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/status");
      setOnlineUsers(Array.isArray(response.data.online) ? response.data.online : []);
      setOfflineUsers(Array.isArray(response.data.offline) ? response.data.offline : []);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return undefined;

    const initialize = async () => {
      setLoading(true);
      await fetchUsers();
      setMessages(loadFamilyChatMessages());
    };

    initialize();

    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    saveFamilyChatMessages(messages);
  }, [messages]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-40 pointer-events-none" />

      <div className="section-shell relative py-8 sm:py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="card surface-strong">
            <div className="flex flex-col gap-4 border-b border-white/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="eyebrow">
                  <span>💬</span>
                  <span>Ģimenes čats</span>
                </div>
                <h1 className="section-title">Kopīgā saruna visai ģimenei</h1>
                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Šeit var rakstīt visiem, pievienot bildes un turēt svarīgās lietas vienuviet.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-sm font-semibold text-dark-purple">
                {messages.length} ziņas
              </div>
            </div>

            <div className="mt-5 max-h-[56vh] space-y-3 overflow-y-auto pr-1">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const mine = String(message.fromUserId) === String(user?.id);
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        mine ? "ml-auto bg-medium-purple text-white" : "bg-white text-dark-purple"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wide opacity-80">
                        <span>{message.fromName}</span>
                        <span>{formatTime(message.createdAt)}</span>
                      </div>
                      {message.text && <div className="mt-2 whitespace-pre-wrap leading-6">{message.text}</div>}
                      {message.photo && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/20">
                          <img src={message.photo} alt={message.photoName || "Pievienotā bilde"} className="h-auto w-full" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : loading ? (
                <div className="rounded-2xl border border-dashed border-white/90 bg-white/60 px-4 py-5 text-sm text-muted">
                  Ielādē ģimenes čatu...
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/90 bg-white/60 px-4 py-5 text-sm text-muted">
                  Nav ziņu. Uzraksti pirmo!
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="text-area-field min-h-[110px]"
                placeholder="Raksti ziņu visai ģimenei..."
              />

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="family-chat-photo"
                />
                <label htmlFor="family-chat-photo" className="btn-ghost cursor-pointer">
                  📷 Pievienot foto
                </label>
                {photoDataUrl && (
                  <button type="button" className="btn-ghost" onClick={clearPhoto}>
                    Noņemt foto
                  </button>
                )}
              </div>

              {selectedPhotoName && <p className="text-xs text-muted">Izvēlēts fails: {selectedPhotoName}</p>}

              {photoDataUrl && (
                <div className="overflow-hidden rounded-2xl border border-white/80 bg-white">
                  <img src={photoDataUrl} alt="Priekšskatījums" className="h-56 w-full object-cover" />
                </div>
              )}

              <button type="submit" className="btn-primary w-full sm:w-auto">
                Sūtīt ziņu
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-soft">
              <h2 className="text-lg font-black text-dark-purple">Ģimenes pārskats</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Šis panelis rāda, kas šobrīd ir pieejams un cik cilvēku ir tiešsaistē.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 px-4 py-4 border border-emerald-100">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">Online</div>
                  <div className="mt-1 text-3xl font-black text-emerald-800">{onlineUsers.length}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4 border border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">Offline</div>
                  <div className="mt-1 text-3xl font-black text-slate-800">{offlineUsers.length}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-soft">
              <h3 className="text-sm font-black tracking-wide text-dark-purple">Tiešsaistē tagad</h3>
              <div className="mt-3 space-y-2">
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-medium-purple text-sm font-black text-white">
                        {(member.first_name?.[0] || "") + (member.last_name?.[0] || "")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-dark-purple">{getDisplayName(member)}</div>
                        <div className="text-xs text-muted">Tiešsaistē</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted">Neviens nav tiešsaistē.</div>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white/90 to-warm-beige/40 p-5 shadow-soft">
              <h3 className="text-sm font-black tracking-wide text-dark-purple">Kopā</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {members.length} ģimenes locekļi ir ielādēti no statusa saraksta.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default FamilyChat;
