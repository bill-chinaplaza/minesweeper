export type ThemeName = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'app-theme'

export function getInitialTheme(
  win: Window | undefined = typeof window !== 'undefined' ? window : undefined
): ThemeName {
  if (!win) return 'light'

  try {
    const stored = win.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Ignore storage access issues
  }

  try {
    if (typeof win.matchMedia === 'function' && win.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // Ignore media query issues
  }

  return 'light'
}

export function applyTheme(
  theme: ThemeName,
  doc: Document | undefined = typeof document !== 'undefined' ? document : undefined
) {
  if (!doc) return
  const root = doc.documentElement
  root.dataset.theme = theme
  root.style.setProperty('color-scheme', theme)
}

export function persistTheme(theme: ThemeName, storage?: Storage) {
  let target = storage

  if (!target) {
    try {
      target = typeof window !== 'undefined' ? window.localStorage : undefined
    } catch {
      target = undefined
    }
  }

  if (!target) return

  try {
    target.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore storage access issues
  }
}
