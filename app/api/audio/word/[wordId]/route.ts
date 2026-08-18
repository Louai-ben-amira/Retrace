import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { synthesizeSpeech } from "@/lib/tts";

export async function GET(_: NextRequest, { params }: { params: { wordId: string } }) {
  try {
    const word = await db.vocabGroupWord.findUnique({ where: { id: params.wordId } });
    if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });
    if (word.audioUrl) return NextResponse.json({ url: word.audioUrl });

    const audio = await synthesizeSpeech(word.word);
    const blob = await put(`audio/word-${word.id}.mp3`, audio, {
      access: "public",
      contentType: "audio/mpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });

    // The client only needs blob.url to start playback — persisting it for future cache
    // hits doesn't need to hold up the response. Worst case on failure, the next play just
    // re-synthesizes once more; it's self-healing, not a correctness issue.
    db.vocabGroupWord.update({ where: { id: word.id }, data: { audioUrl: blob.url } }).catch((err) => {
      console.error(`[GET /api/audio/word/${params.wordId}] failed to persist audioUrl`, err);
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error(`[GET /api/audio/word/${params.wordId}]`, err);
    return NextResponse.json({ error: "Audio unavailable" }, { status: 502 });
  }
}
