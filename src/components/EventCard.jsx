const CATEGORY_STYLES = {
  'Life Skills': { badge: 'bg-secondary-container text-on-secondary-container', gradient: 'from-primary/15 to-primary-container/10', icon: 'school' },
  Wellness: { badge: 'bg-secondary-container text-on-secondary-container', gradient: 'from-secondary-container/40 to-surface-container', icon: 'spa' },
  'Career Growth': { badge: 'bg-surface-container text-on-surface', gradient: 'from-surface-container-high to-surface-container', icon: 'campaign' },
  Icebreakers: { badge: 'bg-surface-container-high text-on-surface', gradient: 'from-surface-container-high to-surface-variant', icon: 'diversity_3' },
  Social: { badge: 'bg-secondary-container text-on-secondary-container', gradient: 'from-secondary-container/40 to-primary-container/10', icon: 'groups' },
}

const DEFAULT_STYLE = { badge: 'bg-surface-container text-on-surface', gradient: 'from-surface-container-high to-surface-container', icon: 'event' }

export default function EventCard({
  category,
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
  ctaLabel = 'Register Attendance',
  ctaIcon = 'arrow_forward',
  onCtaClick,
}) {
  const style = CATEGORY_STYLES[category] ?? DEFAULT_STYLE

  return (
    <article className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`relative w-full h-48 overflow-hidden bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-[64px] text-primary/25">{style.icon}</span>

        <div className="absolute top-3 left-3 flex gap-2">
          {category && (
            <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow ${style.badge}`}>
              {category}
            </span>
          )}
          {hours && (
            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold">
              {hours}
            </span>
          )}
        </div>

        {(day || dateLabel) && (
          <div className="absolute bottom-3 left-3 bg-surface-container-lowest rounded-lg p-2 flex flex-col items-center min-w-[50px] shadow-sm">
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold">{day}</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">{dateLabel}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-1.5 flex-wrap">
            {scheduleText && (
              <>
                <span className="material-symbols-outlined text-[16px] text-primary">{scheduleIcon}</span>
                <span>{scheduleText}</span>
              </>
            )}
            {scheduleText && locationText && <span>•</span>}
            {locationText && (
              <>
                <span className="material-symbols-outlined text-[16px] text-primary">{locationIcon}</span>
                <span className="truncate">{locationText}</span>
              </>
            )}
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="pt-5 mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            {badgeText && (
              <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${badgeClass}`}>
                {badgeText}
              </span>
            )}
          </div>
          <button
            className="w-full py-2.5 bg-primary hover:bg-secondary text-on-primary rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-colors"
            type="button"
            onClick={onCtaClick}
          >
            <span>{ctaLabel}</span>
            <span className="material-symbols-outlined text-[18px]">{ctaIcon}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
