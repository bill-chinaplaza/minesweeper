import { useEffect, useMemo, useState } from 'react'
import Board from './components/Board'
import Header, { Difficulty, DifficultyKey, GameStatus } from './components/Header'
import styles from './styles/index.module.css'
import {
  Board as BoardT,
  checkWin,
  chord,
  countFlags,
  createEmptyBoard,
  prepareBoardWithMines,
  revealCell,
  toggleMark
} from './lib/board'

const DIFFICULTIES: Difficulty[] = [
  { key: 'beginner', label: 'Beginner (9x9, 10)', rows: 9, cols: 9, mines: 10 },
  { key: 'intermediate', label: 'Intermediate (16x16, 40)', rows: 16, cols: 16, mines: 40 },
  { key: 'expert', label: 'Expert (30x16, 99)', rows: 16, cols: 30, mines: 99 },
  { key: 'custom', label: 'Custom', rows: 10, cols: 10, mines: 10 }
]

const DIFFICULTY_STORAGE_KEY = 'minesweeper:difficulty'
const isBrowser = typeof window !== 'undefined'

function getBestKey(key: DifficultyKey) {
  return `best-time-${key}`
}

function revealAllMines(board: BoardT): BoardT {
  return board.map((row) =>
    row.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell))
  )
}

export default function App() {
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>(() => {
    if (isBrowser) {
      const stored = window.localStorage.getItem(DIFFICULTY_STORAGE_KEY) as DifficultyKey | null
      if (stored && DIFFICULTIES.some((d) => d.key === stored)) {
        return stored
      }
    }
    return 'beginner'
  })

  const difficulty = DIFFICULTIES.find((d) => d.key === difficultyKey)!

  const [rows, setRows] = useState(difficulty.rows)
  const [cols, setCols] = useState(difficulty.cols)
  const [mines, setMines] = useState(difficulty.mines)
  const [board, setBoard] = useState<BoardT>(() => createEmptyBoard(rows, cols))
  const [status, setStatus] = useState<GameStatus>('ready')
  const [firstClickDone, setFirstClickDone] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [focused, setFocused] = useState({ row: 0, col: 0 })
  const [elapsed, setElapsed] = useState(0)

  const minesLeft = useMemo(() => mines - countFlags(board), [mines, board])

  const bestTime = useMemo(() => {
    if (!isBrowser || difficultyKey === 'custom') return null
    const value = window.localStorage.getItem(getBestKey(difficultyKey))
    return value ? parseInt(value, 10) : null
  }, [difficultyKey, status])

  useEffect(() => {
    const d = DIFFICULTIES.find((item) => item.key === difficultyKey)!
    setRows(d.rows)
    setCols(d.cols)
    setMines(d.mines)
    resetGame(d.rows, d.cols)
  }, [difficultyKey])

  useEffect(() => {
    if (isBrowser) {
      window.localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficultyKey)
    }
  }, [difficultyKey])

  function resetGame(r = rows, c = cols) {
    setBoard(createEmptyBoard(r, c))
    setStatus('ready')
    setFirstClickDone(false)
    setFocused({ row: 0, col: 0 })
    setElapsed(0)
    setResetKey((key) => key + 1)
  }

  function validateCustom(r: number, c: number, m: number) {
    const maxMines = Math.max(1, Math.min(r * c - 1, m))
    const vr = Math.max(5, Math.min(30, r))
    const vc = Math.max(5, Math.min(30, c))
    return { rows: vr, cols: vc, mines: Math.max(1, Math.min(vr * vc - 1, maxMines)) }
  }

  function handleWin(nextBoard: BoardT) {
    const finalBoard = revealAllMines(nextBoard)
    setBoard(finalBoard)
    setStatus('won')
    if (difficultyKey !== 'custom' && isBrowser) {
      const key = getBestKey(difficultyKey)
      const prev = window.localStorage.getItem(key)
      if (!prev || parseInt(prev, 10) > elapsed) {
        window.localStorage.setItem(key, String(elapsed))
      }
    }
  }

  function handleLoss(nextBoard: BoardT) {
    const finalBoard = revealAllMines(nextBoard)
    setBoard(finalBoard)
    setStatus('lost')
  }

  function onReveal(r: number, c: number) {
    if (status === 'won' || status === 'lost') return

    let nextBoard = board
    if (!firstClickDone) {
      nextBoard = prepareBoardWithMines(rows, cols, mines, { row: r, col: c })
      setFirstClickDone(true)
      setStatus('running')
    }

    const result = revealCell(nextBoard, r, c)
    nextBoard = result.board

    if (result.hitMine) {
      handleLoss(nextBoard)
      return
    }

    if (checkWin(nextBoard, mines)) {
      handleWin(nextBoard)
      return
    }

    setBoard(nextBoard)
  }

  function onToggleFlag(r: number, c: number) {
    if (status === 'lost' || status === 'won') return
    setBoard((prev) => toggleMark(prev, r, c))
  }

  function onChord(r: number, c: number) {
    if (status !== 'running') return
    const result = chord(board, r, c)
    if (result.hitMine) {
      handleLoss(result.board)
      return
    }
    if (checkWin(result.board, mines)) {
      handleWin(result.board)
      return
    }
    setBoard(result.board)
  }

  function changeDifficulty(key: DifficultyKey) {
    setDifficultyKey(key)
  }

  function handleCustomStart() {
    const validated = validateCustom(rows, cols, mines)
    setRows(validated.rows)
    setCols(validated.cols)
    setMines(validated.mines)
    resetGame(validated.rows, validated.cols)
  }

  const running = status === 'running'

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Header
          difficulty={difficultyKey}
          difficulties={DIFFICULTIES}
          minesLeft={minesLeft}
          running={running}
          resetKey={resetKey}
          onReset={() => resetGame()}
          onChangeDifficulty={changeDifficulty}
          bestTime={bestTime}
          onTick={setElapsed}
          status={status}
        />

        {difficultyKey === 'custom' && (
          <div className={styles.controls}>
            <label>
              Rows
              <input
                className={styles.input}
                type="number"
                min={5}
                max={30}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value || '0', 10))}
              />
            </label>
            <label>
              Cols
              <input
                className={styles.input}
                type="number"
                min={5}
                max={30}
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value || '0', 10))}
              />
            </label>
            <label>
              Mines
              <input
                className={styles.input}
                type="number"
                min={1}
                max={rows * cols - 1}
                value={mines}
                onChange={(e) => setMines(parseInt(e.target.value || '0', 10))}
              />
            </label>
            <button className={styles.button} onClick={handleCustomStart}>
              Apply
            </button>
          </div>
        )}

        <Board
          board={board}
          onReveal={onReveal}
          onToggleFlag={onToggleFlag}
          onChord={onChord}
          gameOver={status === 'won' || status === 'lost'}
          focused={focused}
          setFocused={setFocused}
        />

        <div className={styles.footer} role="status" aria-live="polite">
          {status === 'won' && 'You win!'}
          {status === 'lost' && 'Boom! You hit a mine.'}
        </div>
      </div>
    </div>
  )
}
