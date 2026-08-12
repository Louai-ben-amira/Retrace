interface StartGateProps {
  storyTitle: string;
  onStart: () => void;
}

export function StartGate({ storyTitle, onStart }: StartGateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-8 px-6 animate-scale-in">
      <div>
        <p className="text-sm text-brand-500 mb-3 tracking-wide animate-fade-up">Ready to retrace</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream text-balance animate-fade-up" style={{ animationDelay: "80ms" }}>{storyTitle}</h1>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="animate-fade-up inline-flex items-center gap-2 bg-brand-500 text-ink font-semibold text-lg px-8 py-3.5 rounded-full shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:shadow-[0_0_48px_rgba(14,207,183,0.4)] hover:-translate-y-0.5 transition-all duration-200"
        style={{ animationDelay: "160ms" }}
      >
        Start <span aria-hidden>→</span>
      </button>
      <p className="text-xs text-cream/30 animate-fade-up" style={{ animationDelay: "220ms" }}>Type along as the audio plays · press T to hide translation</p>
    </div>
  );
}
