// šis jāpalaiž php artisan reverb:start --host=127.0.0.1 --port=8080

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";
import { getEcho } from "../../services/echo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChatComposer from "./ChatComposer";
import ChatMessageList from "./ChatMessageList";

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

          <ChatMessageList
            messages={messages}
            loading={loading}
            error={error}
            currentUserId={user?.id}
            containerRef={messagesContainerRef}
          />

          <ChatComposer
            sendError={sendError}
            photoDataUrl={photoDataUrl}
            selectedPhotoName={selectedPhotoName}
            fileInputRef={fileInputRef}
            onClearPhoto={clearPhoto}
            onPhotoChange={handlePhotoChange}
            draft={draft}
            onDraftChange={(event) => {
              setDraft(event.target.value);
              if (sendError) setSendError("");
            }}
            sending={sending}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </div>
  );
}

export default FamilyChat;
