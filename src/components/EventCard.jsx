const CATEGORY_STYLES = {
  Sports: { badge: 'bg-secondary-container text-on-secondary-container', gradient: 'from-primary/15 to-primary-container/10', icon: 'sports_soccer' },
  Lifestyle: { badge: 'bg-secondary-container text-on-secondary-container', gradient: 'from-secondary-container/40 to-surface-container', icon: 'self_improvement' },
  Community: { badge: 'bg-surface-container text-on-surface', gradient: 'from-surface-container-high to-surface-container', icon: 'diversity_3' },
  Networking: { badge: 'bg-surface-container-high text-on-surface', gradient: 'from-surface-container-high to-surface-variant', icon: 'groups' },
  Others: { badge: 'bg-secondary-container text-on-secondary-container', gradient: 'from-secondary-container/40 to-primary-container/10', icon: 'apps' },
}

const DEFAULT_STYLE = { badge: 'bg-surface-container text-on-surface', gradient: 'from-surface-container-high to-surface-container', icon: 'event' }

export default function EventCard({
  category,
  // Event rows are spread in raw, so accept the column name too.
  event_category,
  img_url,
  modality,
  registered,
  hours,
  day,
  dateLabel,
  scheduleIcon = 'schedule',
  scheduleText,
  locationIcon = 'location_on',
  locationText,
  title,
  description,
  avatars,
  goingText,
  badgeText,
  badgeClass = 'bg-secondary-container text-on-secondary-container',
  onClick,
}) {
  const eventCategory = category ?? event_category
  const isVirtual = modality === 'virtual'
  const style = CATEGORY_STYLES[eventCategory] ?? DEFAULT_STYLE

  return (
    <article
      className={`group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary' : ''
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`relative w-full h-48 overflow-hidden bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
        {img_url ? (
          <img
            src={img_url}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            // A dead URL falls back to the category gradient underneath.
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span className="material-symbols-outlined text-[64px] text-primary/25">{style.icon}</span>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          {eventCategory && (
            <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow ${style.badge}`}>
              {eventCategory}
            </span>
          )}
          {hours && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold">
              {hours}
            </span>
          )}
        </div>

        {registered && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold shadow">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Registered
          </span>
        )}

        {(day || dateLabel) && (
          <div className="absolute bottom-3 left-3 bg-surface-container-lowest rounded-lg p-2 flex flex-col items-center min-w-[50px] shadow-sm">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold">{day}</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">{dateLabel}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-1.5 min-w-0">
            {scheduleText && (
              <span className="flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[16px] text-primary">{scheduleIcon}</span>
                {scheduleText}
              </span>
            )}
            {scheduleText && (isVirtual || locationText) && <span className="shrink-0">•</span>}
            {isVirtual ? (
              // A meeting URL is noise on a card — the icon carries the meaning.
              <span className="flex items-center gap-1 shrink-0" title="Virtual event">
                <span className="material-symbols-outlined text-[16px] text-primary">videocam</span>
                Virtual
              </span>
            ) : (
              locationText && (
                <span className="flex items-center gap-1 min-w-0" title={locationText}>
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">{locationIcon}</span>
                  <span className="truncate">{locationText}</span>
                </span>
              )
            )}
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="pt-5 mt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {avatars?.length > 0 && (
                <div className="flex -space-x-2 overflow-hidden">
                  {avatars.map((a, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full ring-2 ring-surface-container-lowest text-[10px] font-bold flex items-center justify-center ${a.bg ?? 'bg-surface-variant'} ${a.text ?? 'text-on-surface'}`}
                    >
                      {a.label}
                    </div>
                  ))}
                </div>
              )}
              {goingText && <span className="font-label-sm text-label-sm text-on-surface-variant">{goingText}</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {badgeText && (
                <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${badgeClass}`}>
                  {badgeText}
                </span>
              )}
              {onClick && (
                <span className="flex items-center gap-1 font-label-md text-label-md text-primary">
                  View details
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
