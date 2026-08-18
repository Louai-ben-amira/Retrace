import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { synthesizeSpeech } from "@/lib/tts";

export async function GET(_: NextRequest, { params }: { params: { lineId: string } }) {
  try {
    // Synthesis costs real money per call, so this route authenticates before it does
    // anything. Without it any signed-in account could enumerate line ids and bill the
    // ElevenLabs quota at will — and unpublished/premium lines were readable too.
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const line = await db.line.findUnique({
      where: { id: params.lineId },
      include: { story: { select: { isPremium: true, isPublished: true } } },
    });
    if (!line || !line.story.isPublished) {
      return NextResponse.json({ error: "Line not found" }, { status: 404 });
    }

    // Premium audio is gated exactly like the premium story text it belongs to.
    if (line.story.isPremium) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      });
      if (user?.subscription?.tier !== "PRO") {
        return NextResponse.json({ error: "Pro required" }, { status: 403 });
      }
    }

    if (line.audioUrl) return NextResponse.json({ url: line.audioUrl });

    const audio = await synthesizeSpeech(line.text);

    let blobUrl: string;
    try {
      const blob = await put(`audio/${line.id}.mp3`, audio, {
        access: "public",
        contentType: "audio/mpeg",
        token: process.env.RETRACE_BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true,
      });
      blobUrl = blob.url;
    } catch (err) {
      // Deliberately loud and re-thrown. A silent fallback here is what let every line in
      // the database sit with audioUrl = null: playback still "worked" via the browser's
      // speech synthesis, so nothing surfaced, while every play re-billed ElevenLabs
      // because the result was never cached.
      console.error(
        `[GET /api/audio/${params.lineId}] blob upload failed — audio will NOT be cached. ` +
          `Check RETRACE_BLOB_READ_WRITE_TOKEN.`,
        err
      );
      throw err;
    }

    // The client only needs the URL to start playback — persisting it for future cache
    // hits doesn't need to hold up the response.
    db.line.update({ where: { id: line.id }, data: { audioUrl: blobUrl } }).catch((err) => {
      console.error(`[GET /api/audio/${params.lineId}] failed to persist audioUrl`, err);
    });

    return NextResponse.json({ url: blobUrl });
  } catch (err) {
    console.error(`[GET /api/audio/${params.lineId}]`, err);
    return NextResponse.json({ error: "Audio unavailable" }, { status: 502 });
  }
}
