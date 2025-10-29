import type { ThemeName } from '../lib/theme'
import Counter from './Counter'
import Timer from './Timer'

export type DifficultyKey = 'beginner' | 'intermediate' | 'expert' | 'custom'

export type Difficulty = {
  key: DifficultyKey
  label: string
  rows: number
  cols: number
  mines: number
}

interface HeaderProps {
  difficulty: DifficultyKey
  difficulties: Difficulty[]
  theme: ThemeName
  onToggleTheme: () => void
  minesLeft: number
  running: boolean
  resetKey: number
  onReset: () => void
  onChangeDifficulty: (key: DifficultyKey) => void
  bestTime?: number | null
  onTick?: (seconds: number) => void
}

export default function Header({
  difficulty,
  difficulties,
  theme,
  onToggleTheme,
  minesLeft,
  running,
  resetKey,
  onReset,
  onChangeDifficulty,
  bestTime,
  onTick
}: HeaderProps) {
  return (
    <div className="header" role="region" aria-label="Game header">
      <div className="header-left">
        <div className="field">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            className="select"
            value={difficulty}
            onChange={(e) => onChangeDifficulty(e.target.value as DifficultyKey)}
            aria-label="Select difficulty"
          >
            {difficulties.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="button theme-toggle"
          onClick={onToggleTheme}
          aria-pressed={theme === 'dark'}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          <span aria-hidden="true" className="theme-toggle__icon">
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
          <span className="theme-toggle__label">Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
      <div className="title">Minesweeper</div>
      <div className="header-right">
        <div className="stats">
          <Counter value={minesLeft} ariaLabel="Mines left" />
          <Timer running={running} resetKey={resetKey} onTick={onTick} />
        </div>
        <button className="button" onClick={onReset} aria-label="Reset game">
          Reset
        </button>
      </div>
      {bestTime != null && (
        <div style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: 12 }} aria-label="Best time">
          Best: {Math.floor(bestTime / 60)
            .toString()
            .padStart(2, '0')}
          :{(bestTime % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  )
}
