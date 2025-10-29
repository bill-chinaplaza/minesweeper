import { useEffect, useMemo, useState } from 'react'
import Board from './components/Board'
import Header, { Difficulty, DifficultyKey } from './components/Header'
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

function getBestKey(key: DifficultyKey) {
  return `best-time-${key}`
}

export default function App() {
  const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>('beginner')
  const difficulty = DIFFICULTIES.find((d) => d.key === difficultyKey)!
  const [rows, setRows] = useState(difficulty.rows)
  const [cols, setCols] = useState(difficulty.cols)
  const [mines, setMines] = useState(difficulty.mines)
  const [board, setBoard] = useState<BoardT>(() => createEmptyBoard(rows, cols))
  const [status, setStatus] = useState<'ready' | 'running' | 'won' | 'lost'>('ready')
  const [firstClickDone, setFirstClickDone] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [focused, setFocused] = useState({ row: 0, col: 0 })
  const [elapsed, setElapsed] = useState(0)

  const minesLeft = useMemo(() => Math.max(0, mines - countFlags(board)), [mines, board])

  // Persist best times for built-in difficulties only
  const bestTime = useMemo(() => {
    if (difficultyKey === 'custom') return null
    const v = localStorage.getItem(getBestKey(difficultyKey))
    return v ? parseInt(v, 10) : null
  }, [difficultyKey])

  useEffect(() => {
    // When difficulty changes, reset params
    const d = DIFFICULTIES.find((d) => d.key === difficultyKey)!
    setRows(d.rows)
    setCols(d.cols)
    setMines(d.mines)
    resetGame(d.rows, d.cols)
  }, [difficultyKey])

  function resetGame(r = rows, c = cols) {
    setBoard(createEmptyBoard(r, c))
    setStatus('ready')
    setFirstClickDone(false)
    setFocused({ row: 0, col: 0 })
    setElapsed(0)
    setResetKey((k) => k + 1)
  }

  function validateCustom(r: number, c: number, m: number) {
    const maxMines = Math.max(1, Math.min(r * c - 1, m))
    const vr = Math.max(5, Math.min(30, r))
    const vc = Math.max(5, Math.min(30, c))
    return { rows: vr, cols: vc, mines: Math.max(1, Math.min(vr * vc - 1, maxMines)) }
  }

  function onReveal(r: number, c: number) {
    if (status === 'won' || status === 'lost') return

    let nextBoard = board
    if (!firstClickDone) {
      nextBoard = prepareBoardWithMines(rows, cols, mines, { row: r, col: c })
      setFirstClickDone(true)
      setStatus('running')
    }

    const res = revealCell(nextBoard, r, c)
    nextBoard = res.board

    if (res.hitMine) {
      // reveal all mines
      const revealMines = nextBoard.map((row) =>
        row.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell))
      )
      setBoard(revealMines)
      setStatus('lost')
      return
    }

    if (checkWin(nextBoard, mines)) {
      setBoard(nextBoard)
      setStatus('won')
      if (difficultyKey !== 'custom') {
        const key = getBestKey(difficultyKey)
        const prev = localStorage.getItem(key)
        if (!prev || parseInt(prev, 10) > elapsed) localStorage.setItem(key, String(elapsed))
      }
      return
    }

    setBoard(nextBoard)
  }

  function onToggleFlag(r: number, c: number) {
    if (status === 'lost' || status === 'won') return
    if (!firstClickDone) setStatus('running')
    setFirstClickDone(true)
    setBoard((b) => toggleMark(b, r, c))
  }

  function onChord(r: number, c: number) {
    if (status !== 'running') return
    const res = chord(board, r, c)
    if (res.hitMine) {
      const revealMines = res.board.map((row) =>
        row.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell))
      )
      setBoard(revealMines)
      setStatus('lost')
      return
    }
    if (checkWin(res.board, mines)) {
      setBoard(res.board)
      setStatus('won')
      if (difficultyKey !== 'custom') {
        const key = getBestKey(difficultyKey)
        const prev = localStorage.getItem(key)
        if (!prev || parseInt(prev, 10) > elapsed) localStorage.setItem(key, String(elapsed))
      }
      return
    }
    setBoard(res.board)
  }

  function changeDifficulty(key: DifficultyKey) {
    setDifficultyKey(key)
  }

  function handleCustomStart() {
    const v = validateCustom(rows, cols, mines)
    setRows(v.rows)
    setCols(v.cols)
    setMines(v.mines)
    resetGame(v.rows, v.cols)
  }

  const running = status === 'running'

  return (
    <div className="app">
      <div className="container">
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
        />

        {difficultyKey === 'custom' && (
          <div className="controls" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <label>
              Rows
              <input
                className="input"
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
                className="input"
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
                className="input"
                type="number"
                min={1}
                max={rows * cols - 1}
                value={mines}
                onChange={(e) => setMines(parseInt(e.target.value || '0', 10))}
              />
            </label>
            <button className="button" onClick={handleCustomStart}>
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

        <div className="footer" role="status" aria-live="polite">
          {status === 'won' && 'You win!'}
          {status === 'lost' && 'Boom! You hit a mine.'}
        </div>
      </div>
    </div>
  )
}
