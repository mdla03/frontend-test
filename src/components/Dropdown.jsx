/**
 * Themed replacement for `<select>`. Native option lists are drawn by the OS and
 * can't be styled, so every in-app dropdown should use this instead.
 */
export default function Dropdown({ options, value, onChange, disabled, triggerClassName = '', align = 'start', label }) {
  const selected = options.find((o) => o.value === value)

  return (
    <div className={`dropdown ${align === 'end' ? 'dropdown-end' : ''}`}>
      <div
        tabIndex={disabled ? undefined : 0}
        role="button"
        aria-label={label}
        aria-disabled={disabled}
        className={`flex items-center gap-1.5 transition-opacity ${
          disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:opacity-90'
        } ${triggerClassName}`}
      >
        <span className="truncate">{selected?.label ?? 'Select…'}</span>
        <span className="material-symbols-outlined text-[18px] shrink-0">expand_more</span>
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content menu z-50 mt-2 min-w-44 max-h-72 overflow-y-auto flex-nowrap rounded-xl bg-surface-container-lowest shadow-lg p-2 gap-1"
      >
        {options.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => {
                // daisyUI dropdowns stay open while focused.
                document.activeElement?.blur()
                if (option.value !== value) onChange(option.value)
              }}
              className={`flex items-center gap-2 rounded-lg font-label-md text-label-md ${
                option.value === value ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${option.value === value ? 'text-primary' : 'text-transparent'}`}>
                check
              </span>
              <span className="truncate">{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
