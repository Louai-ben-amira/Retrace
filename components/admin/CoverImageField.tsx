"use client";
import { useRef, useState } from "react";
import { StoryCover } from "@/components/library/StoryCover";
import { Button } from "@/components/ui/Button";

interface CoverImageFieldProps {
  value: string | null;
  topic?: string | null;
  onChange: (url: string | null) => void;
}

/** Upload a cover file or paste an image URL — both end up re-hosted on our own blob store. */
export function CoverImageField({ value, topic, onChange }: CoverImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(body: FormData | string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stories/cover", {
        method: "POST",
        ...(typeof body === "string"
          ? { headers: { "Content-Type": "application/json" }, body }
          : { body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
      setUrlDraft("");
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    void upload(form);
  }

  return (
    <div>
      <label className="text-xs text-cream/40 block mb-2">Cover image</label>
      <div className="flex flex-col sm:flex-row gap-4">
        <StoryCover
          src={value}
          topic={topic}
          alt="Cover preview"
          sizes="240px"
          emojiClassName="text-4xl"
          className="h-[150px] w-[240px] shrink-0 rounded-lg border border-white/10"
        />

        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button type="button" size="sm" variant="secondary" loading={busy} onClick={() => fileRef.current?.click()}>
              Upload image
            </Button>
            {value && (
              <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => onChange(null)}>
                Remove
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <input
              placeholder="…or paste an image URL"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="flex-1 min-w-0 text-sm border border-white/15 rounded-lg px-3 py-2 bg-white/5 text-cream placeholder:text-cream/25"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={busy}
              disabled={!urlDraft.trim()}
              onClick={() => void upload(JSON.stringify({ url: urlDraft.trim() }))}
            >
              Fetch
            </Button>
          </div>

          <p className="text-xs text-cream/30">
            JPEG, PNG, WebP or AVIF up to 6MB. Landscape (16:10) crops best. Without a cover the
            card falls back to generated topic art.
          </p>
          {error && <p className="text-xs text-rose-300">{error}</p>}
        </div>
      </div>
    </div>
  );
}
