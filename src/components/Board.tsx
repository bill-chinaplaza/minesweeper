import type React from 'react'
import type { Board as BoardT } from '../lib/board'
import Cell from './Cell'

interface BoardProps {
  board: BoardT
  onReveal: (r: number, c: number) => void
  onToggleFlag: (r: number, c: number) => void
  onChord: (r: number, c: number) => void
  gameOver: boolean
  focused: { row: number; col: number }
  setFocused: (pos: { row: number; col: number }) => void
}

export default function Board({
  board,
  onReveal,
  onToggleFlag,
  onChord,
  gameOver,
  focused,
  setFocused
}: BoardProps) {
  const rows = board.length
  const cols = board[0]?.length ?? 0

  function moveFocus(dr: number, dc: number) {
    const nr = (focused.row + dr + rows) % rows
    const nc = (focused.col + dc + cols) % cols
    setFocused({ row: nr, col: nc })
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        moveFocus(-1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        moveFocus(1, 0)
        break
      case 'ArrowLeft':
        e.preventDefault()
        moveFocus(0, -1)
        break
      case 'ArrowRight':
        e.preventDefault()
        moveFocus(0, 1)
        break
    }
  }

  return (
    <div
      className="board"
      role="grid"
      aria-label="Minesweeper board"
      onKeyDown={onKeyDown}
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridAutoFlow: 'row'
      }}
    >
      {board.map((row, r) => (
        <div key={r} role="row" className="row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              onReveal={onReveal}
              onToggleFlag={onToggleFlag}
              onChord={onChord}
              disabled={gameOver}
              focused={focused.row === r && focused.col === c}
              onFocus={() => setFocused({ row: r, col: c })}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
