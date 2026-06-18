import { create } from "zustand";
import type { UploadItem } from "../lib/types";
import { contentService } from "../services/contentService";
import { uid } from "../lib/utils";

interface UploadState {
  uploads: UploadItem[];
  stage: string;
  lastUploadResult: any | null;
  addFiles: (files: File[]) => void;
  uploadFile: (file: File, languageCode?: string, persona?: string) => Promise<any>;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: [],
  stage: "",
  lastUploadResult: null,

  addFiles: (files) =>
    set((s) => ({
      uploads: [
        ...s.uploads,
        ...files.map((f) => ({
          id: uid("up"),
          name: f.name,
          size: f.size,
          progress: 0,
          status: "queued" as const,
        })),
      ],
    })),

  reset: () => set({ uploads: [], stage: "", lastUploadResult: null }),

  async uploadFile(file, languageCode = "en", persona = "university") {
    const itemId = uid("up");

    set((s) => ({
      uploads: [
        ...s.uploads,
        {
          id: itemId,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "uploading" as const,
        },
      ],
    }));

    let result: any = null;

    try {
      const generator = contentService.uploadDocument(file, languageCode, persona);
      let next = await generator.next();

      while (!next.done) {
        const { stage, progress } = next.value;
        const status: UploadItem["status"] =
          progress < 30 ? "uploading" : progress < 60 ? "parsing" : "processing";

        set((s) => ({
          stage,
          uploads: s.uploads.map((u) =>
            u.id === itemId ? { ...u, progress, status } : u
          ),
        }));

        next = await generator.next();
      }

      result = next.value;

      set((s) => ({
        lastUploadResult: result,
        uploads: s.uploads.map((u) =>
          u.id === itemId ? { ...u, status: "done", progress: 100 } : u
        ),
        stage: "",
      }));
    } catch (err) {
      set((s) => ({
        uploads: s.uploads.map((u) =>
          u.id === itemId ? { ...u, status: "error" as any, progress: 0 } : u
        ),
        stage: "",
      }));
      throw err;
    }

    return result;
  },
}));