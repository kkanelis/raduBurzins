const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("lv-LV", {
    hour: "2-digit",
    minute: "2-digit",
  });

function ChatMessageList({ messages, loading, error, currentUserId, containerRef }) {
  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8faf7] px-3 py-4 sm:px-6 sm:py-5"
    >
      {error ? (
        <div className="flex min-h-64 items-center justify-center text-center text-sm font-semibold text-[#9b4d4d]">
          Neizdevās ielādēt ģimenes čatu. Mēģini vēlreiz.
        </div>
      ) : messages.length > 0 ? (
        messages.map((message) => {
          const mine = String(message.fromUserId) === String(currentUserId);

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
  );
}

export default ChatMessageList;