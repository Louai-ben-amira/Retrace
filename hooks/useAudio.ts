"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const AUDIO_SPEEDS = [0.6, 0.85, 1, 1.25] as const;
export type AudioSpeed = (typeof AUDIO_SPEEDS)[number];

interface UseAudioOptions {
  id: string;
  text: string;
  endpointBase?: string;
}

export function useAudio({ id, text, endpointBase = "/api/audio" }: UseAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [speed, setSpeed] = useState<AudioSpeed>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  // Reset playback state whenever we move to a new line/word.
  useEffect(() => {
    stop();
    audioRef.current = null;
    setUsingFallback(false);
    setError(null);
  }, [id, stop]);

  useEffect(() => stop, [stop]);

  const playFallback = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Audio is not available.");
      return;
    }
    setUsingFallback(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speedRef.current;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setError("Audio is not available.");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const play = useCallback(async () => {
    setError(null);

    if (usingFallback) {
      playFallback();
      return;
    }

    if (audioRef.current) {
      audioRef.current.playbackRate = speedRef.current;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${endpointBase}/${id}`);
      if (!res.ok) throw new Error("tts-unavailable");
      const { url } = (await res.json()) as { url: string };

      const audio = new Audio(url);
      audio.playbackRate = speedRef.current;
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
      await audio.play();
    } catch {
      playFallback();
    } finally {
      setIsLoading(false);
    }
  }, [id, endpointBase, usingFallback, playFallback]);

  const changeSpeed = useCallback((next: AudioSpeed) => {
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, []);

  return { play, stop, isPlaying, isLoading, error, usingFallback, speed, setSpeed: changeSpeed };
}
