import Image from "next/image";
import { coverArt, coverBackground, isOptimizedHost } from "@/lib/storyCover";
import { cn } from "@/lib/cn";

interface StoryCoverProps {
  src?: string | null;
  topic?: string | null;
  alt: string;
  /** Tailwind aspect/size classes for the frame. */
  className?: string;
  sizes?: string;
  emojiClassName?: string;
  priority?: boolean;
}

/**
 * The image half of a story card: the uploaded cover when there is one, generated topic
 * art when there is not. Both render at the same size so the grid never reflows between
 * the two states.
 */
export function StoryCover({
  src,
  topic,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  emojiClassName = "text-[52px]",
  priority,
}: StoryCoverProps) {
  const art = coverArt(topic);

  return (
    <div className={cn("relative overflow-hidden bg-ink-raised", className)}>
      {src ? (
        isOptimizedHost(src) ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          // Host is not in next.config's remotePatterns, so the optimizer would throw and
          // take the page down with it; an unoptimized tag still shows the art.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ background: coverBackground(art) }}
        >
          <span className={cn("opacity-45 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] select-none", emojiClassName)} aria-hidden>
            {art.emoji}
          </span>
        </div>
      )}

      {/* Scrim: fades the artwork into the card body so overlaid text keeps its contrast
          whatever the image happens to be. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-surface via-ink-surface/25 to-transparent" />
    </div>
  );
}
