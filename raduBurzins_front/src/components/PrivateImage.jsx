import { useEffect, useState } from "react";
import api from "../services/api";

function PrivateImage({ src, alt, className }) {
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    setImageUrl("");
    setStatus(src ? "loading" : "empty");

    if (!src) {
      return () => controller.abort();
    }

    api.get(src, { responseType: "blob", signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;

        objectUrl = URL.createObjectURL(data);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return (
    <span className={`relative flex min-h-20 items-center justify-center overflow-hidden ${className || ""}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          className={`relative z-0 ${className || ""}`}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
      {status === "loading" && (
        <span role="status" className="absolute inset-0 z-10 flex items-center justify-center px-2 text-center text-xs font-semibold text-muted" aria-live="polite">
          Ielādējas...
        </span>
      )}
      {status === "error" && (
        <span role="status" className="absolute inset-0 z-10 flex items-center justify-center px-2 text-center text-xs font-semibold text-muted" aria-live="polite">
          Attēlu neizdevās ielādēt
        </span>
      )}
    </span>
  );
}

export default PrivateImage;