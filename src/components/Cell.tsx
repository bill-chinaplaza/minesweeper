import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { Cell as CellType } from '../lib/board'
import styles from '../styles/index.module.css'

interface CellProps {
  cell: CellType
  onReveal: (r: number, c: number) => void
  onToggleFlag: (r: number, c: number) => void
  onChord: (r: number, c: number) => void
  disabled?: boolean
  focused?: boolean
  onFocus?: () => void
}

export default function Cell({
  cell,
  onReveal,
  onToggleFlag,
  onChord,
  disabled,
  focused,
  onFocus
}: CellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [longPress, setLongPress] = useState(false)
  const longPressRef = useRef<number | null>(null)

  useEffect(() => {
    if (focused) ref.current?.focus()
  }, [focused])

  const isHidden = !cell.isRevealed
  const isMine = cell.isMine && cell.isRevealed
  const isExploded = cell.isExploded
  const numberClass =
    cell.isRevealed && cell.adjacentMines > 0 ? styles[`num-${cell.adjacentMines}`] ?? '' : ''
  const classNames = [
    styles.cell,
    isHidden ? styles.hidden : styles.revealed,
    isMine ? styles.mine : '',
    isExploded ? styles.exploded : '',
    numberClass
  ]
    .filter(Boolean)
    .join(' ')

  const label = (() => {
    if (!cell.isRevealed) {
      if (cell.isFlagged) return 'Flagged cell'
      if (cell.isQuestion) return 'Question cell'
      return 'Hidden cell'
    }
    if (cell.isMine) {
      return cell.isExploded ? 'Exploded mine' : 'Mine'
    }
    return cell.adjacentMines === 0 ? 'Empty cell' : `Cell with ${cell.adjacentMines} mines around`
  })()

  function handleClick() {
    if (disabled) return
    if (!cell.isRevealed && !cell.isFlagged) onReveal(cell.row, cell.col)
  }

  function handleContext(e: React.MouseEvent) {
    e.preventDefault()
    if (disabled) return
    if (!cell.isRevealed) onToggleFlag(cell.row, cell.col)
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (disabled) return
    // Middle click or simultaneous left+right click triggers chord
    if (e.button === 1 || e.buttons === 3) {
      e.preventDefault()
      onChord(cell.row, cell.col)
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    if (disabled) return
    e.preventDefault()
    if (cell.isRevealed) onChord(cell.row, cell.col)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      if (cell.isRevealed && cell.adjacentMines > 0) {
        onChord(cell.row, cell.col)
      } else if (!cell.isRevealed && !cell.isFlagged) {
        onReveal(cell.row, cell.col)
      }
    } else if (e.key.toLowerCase() === 'f') {
      if (!cell.isRevealed) onToggleFlag(cell.row, cell.col)
    }
  }

  function onTouchStart() {
    if (disabled) return
    setLongPress(false)
    longPressRef.current = window.setTimeout(() => {
      setLongPress(true)
      onToggleFlag(cell.row, cell.col)
    }, 350)
  }

  function onTouchEnd() {
    if (disabled) return
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
    if (!longPress) handleClick()
  }

  return (
    <div
      ref={ref}
      role="gridcell"
      aria-label={label}
      tabIndex={focused ? 0 : -1}
      className={classNames}
      onClick={handleClick}
      onContextMenu={handleContext}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onFocus={onFocus}
    >
      {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 ? cell.adjacentMines : null}
      {!cell.isRevealed && cell.isFlagged ? '🚩' : null}
      {!cell.isRevealed && !cell.isFlagged && cell.isQuestion ? '❓' : null}
      {cell.isRevealed && cell.isMine ? (cell.isExploded ? '💥' : '💣') : null}
    </div>
  )
}
