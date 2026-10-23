import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../services/api";
import PrivateImage from "./PrivateImage";

vi.mock("../services/api", () => ({
  default: { get: vi.fn() },
}));

describe("PrivateImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:protected-image"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("shows a loading message until the authenticated image request finishes", async () => {
    let resolveImage;
    api.get.mockReturnValue(new Promise((resolve) => {
      resolveImage = resolve;
    }));

    render(<PrivateImage src="/api/albums/1/photos/2/file" alt="Album photo" className="h-full" />);

    expect(screen.getByRole("status").textContent).toBe("Ielādējas...");
    expect(api.get).toHaveBeenCalledWith("/api/albums/1/photos/2/file", expect.objectContaining({
      responseType: "blob",
    }));

    await act(async () => {
      resolveImage({ data: new Blob(["image"]) });
    });

    expect((await screen.findByRole("img", { name: "Album photo" })).getAttribute("src")).toBe("blob:protected-image");
  });
});
