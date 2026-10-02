// šis jāpalaiž php artisan reverb:start --host=127.0.0.1 --port=8080

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";
import { getEcho } from "../../services/echo";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  });

function FamilyChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading: loading,
    isError: error,
  } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await api.get("/api/chat-messages");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [draft, setDraft] = useState("");
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const clearPhoto = () => {
    setSelectedPhotoName("");
    setPhotoDataUrl("");
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSendError("");

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPhotoName(file.name);
      setPhotoDataUrl(String(reader.result || ""));
      setPhotoFile(file);
    };
    reader.readAsDataURL(file);
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
    setSendError("");

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

    queryClient.setQueryData(["chat-messages"], (current = []) => [
      ...current,
      pendingMessage,
    ]);

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
        queryClient.setQueryData(["chat-messages"], (current = []) => {
          const next = current.filter((message) => (
            String(message.id) !== String(pendingId)
            && String(message.clientMessageId) !== String(pendingId)
          ));
          return [...next, createdMessage];
        });
      }
    } catch (submissionError) {
      console.error("error:", submissionError);
      const currentMessages = queryClient.getQueryData(["chat-messages"]) || [];
      const messageWasBroadcast = currentMessages.some((message) => (
        String(message.clientMessageId) === String(pendingId)
        && String(message.id) !== String(pendingId)
      ));
      queryClient.setQueryData(["chat-messages"], (current = []) => current.filter(
        (message) => String(message.id) !== String(pendingId)
      ));
      if (!messageWasBroadcast) {
        setDraft(text);
        if (hasPhoto) {
          setSelectedPhotoName(selectedPhotoName);
          setPhotoDataUrl(photoDataUrl);
          setPhotoFile(photoFile);
        }
        setSendError(submissionError.response?.data?.message || "Ziņu neizdevās nosūtīt. Mēģini vēlreiz.");
      }
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!user) return undefined;

    const echo = getEcho();
    const channel = echo.private("family-chat");

    const handleIncomingMessage = (message) => {
      queryClient.setQueryData(["chat-messages"], (current = []) => {
        const existing = Array.isArray(current) ? current : [];
        const existingIndex = existing.findIndex((item) => String(item.id) === String(message.id));
        if (existingIndex >= 0) {
          return existing.map((item, index) => (index === existingIndex ? message : item));
        }

        const clientIndex = message.clientMessageId
          ? existing.findIndex((item) => String(item.clientMessageId) === String(message.clientMessageId))
          : -1;
        if (clientIndex >= 0) {
          return existing.map((item, index) => (index === clientIndex ? message : item));
        }

        const pendingIndex = existing.findIndex((item) => (
          String(item.id).startsWith("pending-")
          && String(item.fromUserId) === String(message.fromUserId)
          && item.text === message.text
          && item.photoName === message.photoName
        ));
        if (pendingIndex >= 0) {
          return existing.map((item, index) => (index === pendingIndex ? message : item));
        }

        return [...existing, message];
      });
    };

    channel.listen(".message.created", handleIncomingMessage);

    return () => {
      channel.stopListening(".message.created", handleIncomingMessage);
      echo.leave("family-chat");
    };
  }, [queryClient, user]);

  return (
    <div className="relative h-[calc(100vh-5rem)] min-h-0 overflow-hidden bg-[#f5f7f3]">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />

      <div className="section-shell relative h-full min-h-0 py-3 sm:py-5">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#e1e7df] bg-white shadow-[0_16px_40px_rgba(39,48,39,0.09)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ece6] bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <div className="eyebrow mb-2">
                <span aria-hidden="true">✦</span>
                <span>Ģimene</span>
              </div>
              <h1 className="text-xl font-black text-dark-purple sm:text-2xl">Ģimenes čats</h1>
              <p className="mt-1 text-sm text-muted">Kopīgā saruna</p>
            </div>

            <div className="shrink-0 rounded-lg border border-[#e1e9e0] bg-[#f4f7f2] px-3 py-2 text-center">
              <div className="text-lg font-extrabold leading-none text-[#3d5d43]">{messages.length}</div>
              <div className="mt-1 text-[10px] font-bold uppercase text-muted">ziņas</div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8faf7] px-3 py-4 sm:px-6 sm:py-5"
          >
            {error ? (
              <div className="flex min-h-64 items-center justify-center text-center text-sm font-semibold text-[#9b4d4d]">
                Neizdevās ielādēt ģimenes čatu. Mēģini vēlreiz.
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => {
                const mine = String(message.fromUserId) === String(user?.id);

                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] sm:max-w-[72%] ${mine ? "items-end" : "items-start"}`}>
                      <div className={`mb-1.5 flex items-center gap-2 px-1 text-[11px] ${mine ? "justify-end" : ""}`}>
                        <span className="font-bold text-[#425b46]">{mine ? "Tu" : message.fromName}</span>
                        <span className="text-[#858d83]">{formatTime(message.createdAt)}</span>
                      </div>

                      <div
                        className={`overflow-hidden rounded-xl px-4 py-3 shadow-sm transition ${
                          mine
                            ? "rounded-br-sm bg-[#526f59] text-white"
                            : "rounded-bl-sm border border-[#e3e9e1] bg-white text-dark-purple"
                        }`}
                      >
                        {message.text && <div className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</div>}
                        {message.photo && (
                          <div className={message.text ? "mt-3" : "-mx-4 -my-3"}>
                            <img
                              src={message.photo}
                              alt={message.photoName || "Pievienotā bilde"}
                              className="max-h-72 w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : loading ? (
              <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-muted">
                Ielādē ģimenes čatu...
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center text-muted">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3ed] text-xl text-[#526f59]" aria-hidden="true">✦</span>
                <span className="text-sm font-semibold">Nav ziņu. Uzraksti pirmo!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#e8ece6] bg-white p-3 sm:p-4">
            {sendError && (
              <div role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {sendError}
              </div>
            )}
            {photoDataUrl && (
              <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#e1e9e0] bg-[#f7f9f6] p-2">
                <img src={photoDataUrl} alt="Priekšskatījums" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1 truncate text-xs font-semibold text-[#425b46]">{selectedPhotoName}</div>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="shrink-0 rounded-md px-3 py-2 text-xs font-bold text-[#9b4d4d] transition hover:bg-white"
                >
                  Noņemt
                </button>
              </div>
            )}

            <div className="flex min-w-0 items-end gap-2 rounded-lg border border-[#dfe5dc] bg-[#fbfcfa] p-1.5 transition focus-within:border-[#66836b] focus-within:ring-2 focus-within:ring-[#66836b]/15">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Pievienot bildi"
                title="Pievienot bildi"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl font-medium text-[#526f59] transition hover:bg-[#edf3ed]"
              >
                <span aria-hidden="true">+</span>
              </button>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

              <textarea
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (sendError) setSendError("");
                }}
                placeholder="Raksti ziņu visai ģimenei..."
                aria-label="Ziņas teksts"
                rows={1}
                className="max-h-32 min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-dark-purple outline-none placeholder:text-muted/70"
              />

              <button
                type="submit"
                disabled={sending}
                aria-label="Sūtīt ziņu"
                className="flex h-10 shrink-0 items-center justify-center rounded-md bg-[#526f59] px-4 text-sm font-bold text-white transition hover:bg-[#405a46] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="hidden sm:inline">{sending ? "Sūta..." : "Sūtīt"}</span>
                <span className="text-lg leading-none sm:hidden" aria-hidden="true">↑</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default FamilyChat;
