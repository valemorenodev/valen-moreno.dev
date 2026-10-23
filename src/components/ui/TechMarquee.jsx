import { TECH_ICONS, FallbackIcon } from './techIcons.js'

/** Marquesina infinita del stack. El segundo bloque es decorativo (aria-hidden). */
export default function TechMarquee({ items, reverse = false, duration }) {
  const loop = [...items, ...items]

  return (
    <div className="mask-fade-x group relative overflow-hidden">
      <div
        className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{
          animationDirection: reverse ? 'reverse' : 'normal',
          animationDuration: duration ? `${duration}s` : undefined,
        }}
      >
        {loop.map((item, index) => {
          const Icon = TECH_ICONS[item] ?? FallbackIcon
          const isDuplicate = index >= items.length

          return (
            <span
              key={`${item}-${index}`}
              aria-hidden={isDuplicate || undefined}
              className="flex shrink-0 items-center gap-2 rounded-full border border-line/80 bg-surface/60 px-4 py-2 font-mono text-xs text-ink-soft transition-colors hover:border-violet/40 hover:text-ink"
            >
              <Icon aria-hidden="true" className="size-4 text-violet" />
              {item}
            </span>
          )
        })}
      </div>
    </div>
  )
}
