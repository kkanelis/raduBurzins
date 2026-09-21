// šis jāpalaiž php artisan reverb:start --host=127.0.0.1 --port=8080

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getEcho } from "../../services/echo";

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
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const members = useMemo(() => [...onlineUsers, ...offlineUsers], [onlineUsers, offlineUsers]);

  const clearPhoto = () => {
    setSelectedPhotoName("");
    setPhotoDataUrl("");
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPhotoName(file.name);
      setPhotoDataUrl(String(reader.result || ""));
      setPhotoFile(file);
    };
    reader.readAsDataURL(file);
  };

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

  const fetchMessages = async () => {
    try {
      const response = await api.get("/api/chat-messages");
      const incoming = Array.isArray(response.data) ? response.data : [];
      setMessages(incoming);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    const text = draft.trim();
    if (!text && !photoDataUrl) return;

    const hasPhoto = Boolean(photoFile);
    const pendingId = `pending-${Date.now()}`;
    const pendingMessage = {
      id: pendingId,
      fromUserId: user.id,
      fromName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Tu",
      text,
      photo: photoDataUrl || null,
      photoName: selectedPhotoName || null,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, pendingMessage]);
    setDraft("");
    clearPhoto();

    setSending(true);
    try {
      let response;

      if (hasPhoto) {
        const payload = new FormData();
        if (text) payload.append("text", text);
        payload.append("photo", photoFile);
        payload.append("photo_name", selectedPhotoName);
        response = await api.post("/api/chat-messages", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/api/chat-messages", { text });
      }

      const createdMessage = response.data?.message;
      if (createdMessage) {
        setMessages((current) => current.map((message) => (
          message.id === pendingId ? createdMessage : message
        )));
      }
      console.groupEnd();
    } catch (error) {
      console.error("error:", error);
      console.groupEnd();
      setMessages((current) => current.filter((message) => message.id !== pendingId));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!user) return undefined;

    const initialize = async () => {
      setLoading(true);
      await fetchUsers();
      await fetchMessages();
    };

    initialize();
    const usersInterval = setInterval(fetchUsers, 30000);

    const echo = getEcho();
    const channel = echo.private("family-chat");
    channel.listen(".message.created", (message) => {
      setMessages((current) => {
        const existingIndex = current.findIndex((item) => String(item.id) === String(message.id));
        if (existingIndex >= 0) {
          return current.map((item, index) => (index === existingIndex ? message : item));
        }

        const pendingIndex = current.findIndex((item) => (
          String(item.id).startsWith("pending-")
          && String(item.fromUserId) === String(message.fromUserId)
          && item.text === message.text
          && item.photoName === message.photoName
        ));
        if (pendingIndex >= 0) {
          return current.map((item, index) => (index === pendingIndex ? message : item));
        }

        return [...current, message];
      });
    });

    return () => {
      clearInterval(usersInterval);
      echo.leave("private-family-chat");
    };
  }, [user]);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#f7f3ef]">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />

      <div className="section-shell relative py-8 sm:py-12">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="flex min-h-[680px] flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-soft backdrop-blur">
            <div className="border-b border-[#eee5dc] bg-gradient-to-r from-[#382d5b] to-[#58467e] px-5 py-6 text-white sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                    <span>💬</span>
                    <span>Ģimenes čats</span>
                  </div>
                  <h1 className="text-2xl font-black text-white sm:text-3xl">Kopīgā saruna visai ģimenei</h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                    Ziņas, bildes un mazie ikdienas jaunumi vienuviet.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-center">
                  <div className="text-xl font-black">{messages.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/65">ziņas</div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfaf8] px-4 py-6 sm:px-8">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const mine = String(message.fromUserId) === String(user?.id);
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] sm:max-w-[72%] ${mine ? "items-end" : "items-start"}`}>
                        <div className={`mb-1 flex items-center gap-2 px-1 text-xs ${mine ? "justify-end" : ""}`}>
                          <span className="font-bold text-[#382d5b]">{mine ? "Tu" : message.fromName}</span>
                          <span className="text-[#9b8f86]">{formatTime(message.createdAt)}</span>
                        </div>
                        <div className={`overflow-hidden rounded-2xl px-4 py-3 shadow-sm ${mine ? "rounded-br-md bg-[#58467e] text-white" : "rounded-bl-md border border-[#eee5dc] bg-white text-[#382d5b]"}`}>
                          {message.text && <div className="whitespace-pre-wrap text-sm leading-6">{message.text}</div>}
                          {message.photo && (
                            <div className={message.text ? "mt-3" : "-mx-4 -my-3"}>
                              <img src={message.photo} alt={message.photoName || "Pievienotā bilde"} className="max-h-72 w-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : loading ? (
                <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-[#9b8f86]">
                  Ielādē ģimenes čatu...
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center text-center text-[#9b8f86]">
                  <span className="mb-3 text-4xl">✦</span>
                  Nav ziņu. Uzraksti pirmo!
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[#eee5dc] bg-white p-4 sm:p-6">
              {photoDataUrl && (
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f7f3ef] p-2">
                  <img src={photoDataUrl} alt="Priekšskatījums" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1 text-xs font-semibold text-[#58467e]">{selectedPhotoName}</div>
                  <button type="button" onClick={clearPhoto} className="rounded-xl px-3 py-2 text-xs font-bold text-[#9b4d4d] hover:bg-white">Noņemt</button>
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-[#e5dbd2] bg-[#fcfaf8] p-2 focus-within:border-[#58467e]">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-[#58467e] transition hover:bg-white" title="Pievienot bildi">＋</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Raksti ziņu visai ģimenei..." rows={1} className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm text-[#382d5b] outline-none placeholder:text-[#aaa09a]" />
                <button type="submit" disabled={sending} className="h-11 rounded-xl bg-[#58467e] px-5 text-sm font-bold text-white transition hover:bg-[#463666] disabled:cursor-wait disabled:opacity-60">Sūtīt</button>
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-soft sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b8f86]">Ģimene</p>
                <h2 className="mt-1 text-xl font-black text-[#382d5b]">Tiešsaistē</h2>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">●</span>
            </div>
            <div className="mt-5 space-y-3">
              {onlineUsers.length > 0 ? onlineUsers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-[#eee5dc] bg-[#fcfaf8] p-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8e0f0] text-sm font-black text-[#58467e]">
                    {(member.first_name?.[0] || "") + (member.last_name?.[0] || "")}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-[#382d5b]">{getDisplayName(member)}</div>
                    <div className="text-xs text-emerald-600">Tiešsaistē</div>
                  </div>
                </div>
              )) : <div className="rounded-2xl bg-[#fcfaf8] p-4 text-sm text-[#9b8f86]">Neviens nav tiešsaistē.</div>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default FamilyChat;
