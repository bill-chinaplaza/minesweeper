import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { THEME_STORAGE_KEY } from '../lib/theme'

describe('Theme preference', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.removeProperty('color-scheme')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('respects stored preference from localStorage', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    render(<App />)

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))

    const toggle = screen.getByRole('button', { name: /switch to light theme/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('uses system preference when no stored value is present', async () => {
    const originalMatchMedia = window.matchMedia

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })) as unknown as typeof window.matchMedia

    try {
      render(<App />)

      await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))
      expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument()
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })

  it('toggles theme and persists the new preference', async () => {
    const user = userEvent.setup()

    render(<App />)

    const toggle = screen.getByRole('button', { name: /switch to dark theme/i })

    await user.click(toggle)

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.click(toggle)

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'))
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })
})
