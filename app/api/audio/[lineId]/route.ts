import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { synthesizeSpeech } from "@/lib/tts";

export async function GET(_: NextRequest, { params }: { params: { lineId: string } }) {
  try {
    const line = await db.line.findUnique({ where: { id: params.lineId } });
    if (!line) return NextResponse.json({ error: "Line not found" }, { status: 404 });
    if (line.audioUrl) return NextResponse.json({ url: line.audioUrl });

    const audio = await synthesizeSpeech(line.text);
    const blob = await put(`audio/${line.id}.mp3`, audio, {
      access: "public",
      contentType: "audio/mpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });

    // The client only needs blob.url to start playback — persisting it for future cache
    // hits doesn't need to hold up the response. Worst case on failure, the next play just
    // re-synthesizes once more; it's self-healing, not a correctness issue.
    db.line.update({ where: { id: line.id }, data: { audioUrl: blob.url } }).catch((err) => {
      console.error(`[GET /api/audio/${params.lineId}] failed to persist audioUrl`, err);
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error(`[GET /api/audio/${params.lineId}]`, err);
    return NextResponse.json({ error: "Audio unavailable" }, { status: 502 });
  }
}
