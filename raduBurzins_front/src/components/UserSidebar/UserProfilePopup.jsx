import React from "react";
import BasePopup from "../BasePopoup";

function UserProfilePopup({ user, onClose }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("lv-LV", { month: "long", day: "numeric" });
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("lv-LV", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <BasePopup title={`${user.first_name} ${user.last_name}`} onClose={onClose}>
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-medium-purple text-xl font-bold text-white">
          {user.first_name?.[0]}
          {user.last_name?.[0]}
        </div>

        <div className="flex-1">
          {user.nickname && (
            <p className="mb-1 text-sm text-muted">
              <strong>Iesauka:</strong> {user.nickname}
            </p>
          )}

          <p className="mb-1">
            <strong>Status:</strong>{" "}
            <span>{user.online ? "🟢 Tiešsaistē" : "🔴 Bezsaistē"}</span>
          </p>

          {user.date_of_birth && (
            <p className="mb-1 text-sm text-muted">
              <strong>Dzimšanas diena:</strong> {formatDate(user.date_of_birth)}
            </p>
          )}

          {!user.online && user.last_seen && (
            <p className="text-sm text-muted">
              <strong>Pēdējo reizi redzēts:</strong> {formatLastSeen(user.last_seen)}
            </p>
          )}
        </div>
      </div>
    </BasePopup>
  );
}

export default UserProfilePopup;
