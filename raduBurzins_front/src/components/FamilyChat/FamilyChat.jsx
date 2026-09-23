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
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  const fetchMessages = async () => {
    try {
      const response = await api.get("/api/chat-messages");
      const incoming = Array.isArray(response.data) ? response.data : [];
      setMessages(incoming);
    } catch (error) {
      console.error("error:", error);
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    const text = draft.trim();
    if (!text && !photoDataUrl) return;

    const hasPhoto = Boolean(photoFile);
    const pendingId = `pending-${Date.now()}`;
    const pendingMessage = {
      id: pendingId,
      clientMessageId: pendingId,
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
        payload.append("client_message_id", pendingId);
        payload.append("photo", photoFile);
        payload.append("photo_name", selectedPhotoName);
        response = await api.post("/api/chat-messages", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/api/chat-messages", {
          text,
          client_message_id: pendingId,
        });
      }

      const createdMessage = response.data?.message;
      if (createdMessage) {
        setMessages((current) => current.map((message) => (
          message.clientMessageId === pendingId ? createdMessage : message
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
      await fetchMessages();
    };

    initialize();
    const echo = getEcho();
    const channel = echo.private("family-chat");
    channel.listen(".message.created", (message) => {
      setMessages((current) => {
        const existingIndex = current.findIndex((item) => String(item.id) === String(message.id));
        if (existingIndex >= 0) {
          return current.map((item, index) => (index === existingIndex ? message : item));
        }

        const clientIndex = message.clientMessageId
          ? current.findIndex((item) => item.clientMessageId === message.clientMessageId)
          : -1;
        if (clientIndex >= 0) {
          return current.map((item, index) => (index === clientIndex ? message : item));
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
      echo.leave("private-family-chat");
    };
  }, [user]);

  return (
    <div className="relative h-[calc(100vh-5rem)] min-h-0 overflow-hidden bg-[#f7f3ef]">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />

        <div className="section-shell relative h-full min-h-0 py-4 sm:py-6">
          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-soft backdrop-blur">
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

            <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#fcfaf8] px-4 py-6 sm:px-8">
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
        </div>
    </div>
  );
}

export default FamilyChat;
