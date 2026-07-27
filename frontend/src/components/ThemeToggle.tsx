import { useState } from 'react'
import './ThemeToggle.css'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'calculator-theme'

function readCurrentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readCurrentTheme)

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="12" y1="1.75" x2="12" y2="4.25" />
            <line x1="12" y1="19.75" x2="12" y2="22.25" />
            <line x1="1.75" y1="12" x2="4.25" y2="12" />
            <line x1="19.75" y1="12" x2="22.25" y2="12" />
            <line x1="4.5" y1="4.5" x2="6.2" y2="6.2" />
            <line x1="17.8" y1="17.8" x2="19.5" y2="19.5" />
            <line x1="4.5" y1="19.5" x2="6.2" y2="17.8" />
            <line x1="17.8" y1="6.2" x2="19.5" y2="4.5" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
