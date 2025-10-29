import Counter from './Counter'
import Timer from './Timer'
import { formatTime } from '../lib/utils'
import styles from '../styles/index.module.css'

export type DifficultyKey = 'beginner' | 'intermediate' | 'expert' | 'custom'

export type Difficulty = {
  key: DifficultyKey
  label: string
  rows: number
  cols: number
  mines: number
}

export type GameStatus = 'ready' | 'running' | 'won' | 'lost'

interface HeaderProps {
  difficulty: DifficultyKey
  difficulties: Difficulty[]
  minesLeft: number
  running: boolean
  resetKey: number
  onReset: () => void
  onChangeDifficulty: (key: DifficultyKey) => void
  bestTime?: number | null
  onTick?: (seconds: number) => void
  status: GameStatus
}

const FACE_BY_STATUS: Record<GameStatus, string> = {
  ready: '🙂',
  running: '😮',
  won: '😎',
  lost: '😵'
}

const STATUS_LABEL: Record<GameStatus, string> = {
  ready: 'Ready to play',
  running: 'Game in progress',
  won: 'Game won',
  lost: 'Game lost'
}

export default function Header({
  difficulty,
  difficulties,
  minesLeft,
  running,
  resetKey,
  onReset,
  onChangeDifficulty,
  bestTime,
  onTick,
  status
}: HeaderProps) {
  const faceClassName = [styles.button, styles['face-button'], styles[`face-${status}`]].filter(Boolean).join(' ')

  return (
    <div className={styles.header} role="region" aria-label="Game header">
      <div className={styles['header-left']}>
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          className={styles.select}
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
        className={faceClassName}
        onClick={onReset}
        aria-label={`Reset game (${STATUS_LABEL[status]})`}
        type="button"
      >
        {FACE_BY_STATUS[status]}
      </button>
      <div className={styles['header-right']}>
        <div className={styles.stats}>
          <Counter value={minesLeft} ariaLabel="Mines left" />
          <Timer running={running} resetKey={resetKey} onTick={onTick} />
        </div>
      </div>
      {bestTime != null && (
        <div className={styles['best-time']} aria-label="Best time">
          Best: {formatTime(bestTime)}
        </div>
      )}
    </div>
  )
}
