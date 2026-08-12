export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-6 w-9 items-center justify-center rounded-md bg-brand">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {!compact && (
        <span className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold tracking-tight text-fg">
            Live<span className="text-muted">Tube</span>
          </span>
          <span className="text-xs text-muted">쌩튜브</span>
        </span>
      )}
    </span>
  );
}
