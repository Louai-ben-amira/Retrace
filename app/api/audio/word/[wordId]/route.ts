import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { synthesizeSpeech } from "@/lib/tts";

export async function GET(_: NextRequest, { params }: { params: { wordId: string } }) {
  try {
    // Same reasoning as /api/audio/[lineId]: authenticate before spending an ElevenLabs
    // call, and gate premium content on the subscription that pays for it.
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const word = await db.vocabGroupWord.findUnique({
      where: { id: params.wordId },
      include: { group: { select: { isPremium: true, isPublished: true } } },
    });
    if (!word || !word.group.isPublished) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // A vocab word has no premium flag of its own — access follows its parent group.
    if (word.group.isPremium) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      });
      if (user?.subscription?.tier !== "PRO") {
        return NextResponse.json({ error: "Pro required" }, { status: 403 });
      }
    }

    if (word.audioUrl) return NextResponse.json({ url: word.audioUrl });

    const audio = await synthesizeSpeech(word.word);

    let blobUrl: string;
    try {
      const blob = await put(`audio/word-${word.id}.mp3`, audio, {
        access: "public",
        contentType: "audio/mpeg",
        token: process.env.RETRACE_BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true,
      });
      blobUrl = blob.url;
    } catch (err) {
      console.error(
        `[GET /api/audio/word/${params.wordId}] blob upload failed — audio will NOT be cached. ` +
          `Check RETRACE_BLOB_READ_WRITE_TOKEN.`,
        err
      );
      throw err;
    }

    db.vocabGroupWord.update({ where: { id: word.id }, data: { audioUrl: blobUrl } }).catch((err) => {
      console.error(`[GET /api/audio/word/${params.wordId}] failed to persist audioUrl`, err);
    });

    return NextResponse.json({ url: blobUrl });
  } catch (err) {
    console.error(`[GET /api/audio/word/${params.wordId}]`, err);
    return NextResponse.json({ error: "Audio unavailable" }, { status: 502 });
  }
}
