import { RNG, createSeededRng } from './utils'

export type Cell = {
  row: number
  col: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  isQuestion: boolean
  isExploded: boolean
  adjacentMines: number
}

export type Board = Cell[][]

export type Coords = { row: number; col: number }

export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      isQuestion: false,
      isExploded: false,
      adjacentMines: 0
    }))
  )
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

export function inBounds(board: Board, r: number, c: number): boolean {
  return r >= 0 && r < board.length && c >= 0 && c < board[0].length
}

export function neighbors(board: Board, r: number, c: number): Coords[] {
  const res: Coords[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (inBounds(board, nr, nc)) res.push({ row: nr, col: nc })
    }
  }
  return res
}

export function placeMines(board: Board, mineCount: number, avoid?: Coords, rng?: RNG): Board {
  const rows = board.length
  const cols = board[0].length
  const total = rows * cols
  const available: number[] = []
  for (let i = 0; i < total; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    if (avoid && avoid.row === r && avoid.col === c) continue
    available.push(i)
  }
  const random = rng ?? Math.random
  // Fisher-Yates shuffle partial for first mineCount
  for (let i = 0; i < mineCount; i++) {
    const j = i + Math.floor(random() * (available.length - i))
    const tmp = available[i]
    available[i] = available[j]
    available[j] = tmp
  }
  const positions = new Set<number>(available.slice(0, mineCount))
  const next = cloneBoard(board)
  positions.forEach((idx) => {
    const r = Math.floor(idx / cols)
    const c = idx % cols
    next[r][c].isMine = true
  })
  return calculateNumbers(next)
}

export function calculateNumbers(board: Board): Board {
  const next = cloneBoard(board)
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = next[r][c]
      if (cell.isMine) {
        cell.adjacentMines = -1
        continue
      }
      let count = 0
      for (const n of neighbors(board, r, c)) {
        if (board[n.row][n.col].isMine) count++
      }
      cell.adjacentMines = count
    }
  }
  return next
}

export type RevealResult = {
  board: Board
  hitMine: boolean
  revealed: number
}

export function revealCell(board: Board, r: number, c: number): RevealResult {
  const next = cloneBoard(board)
  const start = next[r][c]
  if (start.isRevealed || start.isFlagged) {
    return { board: next, hitMine: false, revealed: 0 }
  }
  if (start.isMine) {
    start.isRevealed = true
    start.isExploded = true
    return { board: next, hitMine: true, revealed: 1 }
  }
  let revealed = 0
  const queue: Coords[] = [{ row: r, col: c }]
  const visited = new Set<string>()
  const key = (x: number, y: number) => `${x},${y}`
  while (queue.length) {
    const { row, col } = queue.shift()!
    const cell = next[row][col]
    if (cell.isRevealed || cell.isFlagged) continue
    cell.isRevealed = true
    cell.isExploded = false
    revealed++
    if (cell.adjacentMines === 0) {
      for (const n of neighbors(next, row, col)) {
        const k = key(n.row, n.col)
        if (!visited.has(k)) {
          visited.add(k)
          const neighborCell = next[n.row][n.col]
          if (!neighborCell.isRevealed && !neighborCell.isFlagged) {
            queue.push(n)
          }
        }
      }
    }
  }
  return { board: next, hitMine: false, revealed }
}

export function toggleMark(board: Board, r: number, c: number): Board {
  const next = cloneBoard(board)
  const cell = next[r][c]
  if (cell.isRevealed) return next
  if (!cell.isFlagged && !cell.isQuestion) {
    cell.isFlagged = true
  } else if (cell.isFlagged) {
    cell.isFlagged = false
    cell.isQuestion = true
  } else if (cell.isQuestion) {
    cell.isQuestion = false
  }
  return next
}

export function chord(board: Board, r: number, c: number): RevealResult {
  const start = board[r][c]
  if (!start.isRevealed || start.adjacentMines <= 0) {
    return { board: cloneBoard(board), hitMine: false, revealed: 0 }
  }
  const neigh = neighbors(board, r, c)
  const flagged = neigh.filter((n) => board[n.row][n.col].isFlagged).length
  if (flagged !== start.adjacentMines) {
    return { board: cloneBoard(board), hitMine: false, revealed: 0 }
  }
  // reveal all non-flagged neighbors
  let next = cloneBoard(board)
  let totalRevealed = 0
  let hitMine = false
  for (const n of neigh) {
    const cell = next[n.row][n.col]
    if (!cell.isFlagged && !cell.isRevealed) {
      const res = revealCell(next, n.row, n.col)
      next = res.board
      totalRevealed += res.revealed
      if (res.hitMine) hitMine = true
    }
  }
  return { board: next, hitMine, revealed: totalRevealed }
}

export function checkWin(board: Board, mineCount: number): boolean {
  const rows = board.length
  const cols = board[0].length
  let revealed = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isRevealed) revealed++
    }
  }
  return revealed === rows * cols - mineCount
}

export function countFlags(board: Board): number {
  let flags = 0
  for (const row of board) {
    for (const cell of row) if (cell.isFlagged) flags++
  }
  return flags
}

export function prepareBoardWithMines(
  rows: number,
  cols: number,
  mines: number,
  firstClick: Coords,
  seed?: number
): Board {
  const base = createEmptyBoard(rows, cols)
  const rng = seed != null ? createSeededRng(seed) : undefined
  return placeMines(base, mines, firstClick, rng)
}
