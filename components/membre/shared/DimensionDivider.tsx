type Props = {
  label?: string
}

export default function DimensionDivider({ label }: Props) {
  return (
    <div className="relative flex items-center py-4 my-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/35 to-steel/30" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-2 bg-accent/40" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-2 bg-steel/40" />
      {label && (
        <span className="px-3 text-xs font-mono uppercase tracking-widest text-muted bg-bg">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-steel/30 via-accent/35 to-transparent" />
    </div>
  )
}