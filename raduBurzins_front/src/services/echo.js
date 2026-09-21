import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const reverbHost = import.meta.env.VITE_REVERB_HOST || "127.0.0.1";
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || "http";

let echoInstance;

export const getEcho = () => {
  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: "reverb",
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: reverbHost,
      wsPort: reverbPort,
      wssPort: reverbPort,
      forceTLS: reverbScheme === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      },
    });
  }

  return echoInstance;
};
