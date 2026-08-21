import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MAX_BYTES = 6 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Uploads a story cover to blob storage and returns its URL.
 *
 * Everything is re-hosted here, including images pasted as a remote URL: covers are
 * rendered through next/image, which refuses any hostname outside next.config's
 * remotePatterns, and a stock-photo link also rots on someone else's schedule. Storing a
 * copy means one allowlisted host and a cover that keeps working.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const contentType = req.headers.get("content-type") ?? "";
    let data: Blob | ArrayBuffer;
    let mime: string;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof Blob)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is larger than 6MB" }, { status: 413 });
      data = file;
      mime = file.type;
    } else {
      const { url } = await req.json();
      if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
        return NextResponse.json({ error: "Provide an http(s) image URL" }, { status: 400 });
      }
      const res = await fetch(url);
      if (!res.ok) return NextResponse.json({ error: `Could not fetch image (${res.status})` }, { status: 400 });
      mime = res.headers.get("content-type")?.split(";")[0].trim() ?? "";
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: "Image is larger than 6MB" }, { status: 413 });
      data = buf;
    }

    const ext = EXTENSIONS[mime];
    if (!ext) {
      return NextResponse.json({ error: "Unsupported image type — use JPEG, PNG, WebP or AVIF" }, { status: 415 });
    }

    const blob = await put(`covers/${crypto.randomUUID()}.${ext}`, data, {
      access: "public",
      contentType: mime,
      token: process.env.RETRACE_BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[cover upload] failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
