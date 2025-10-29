import { describe, it, expect } from 'vitest'
import {
  calculateNumbers,
  checkWin,
  chord,
  createEmptyBoard,
  placeMines,
  revealCell,
  toggleMark,
  countFlags
} from '../board'
import { createSeededRng } from '../utils'

describe('board generation and logic', () => {
  it('places the correct number of mines and numbers', () => {
    const base = createEmptyBoard(5, 5)
    const rng = createSeededRng(123)
    const board = placeMines(base, 5, { row: 0, col: 0 }, rng)
    // count mines
    let mines = 0
    for (const row of board) for (const cell of row) if (cell.isMine) mines++
    expect(mines).toBe(5)
    // numbers valid
    const withNums = calculateNumbers(board)
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = withNums[r][c]
        if (!cell.isMine) {
          expect(cell.adjacentMines).toBeGreaterThanOrEqual(0)
          expect(cell.adjacentMines).toBeLessThanOrEqual(8)
        }
      }
    }
  })

  it('reveals empty area via flood fill', () => {
    // Create a board with no mines
    let board = createEmptyBoard(3, 3)
    board = calculateNumbers(board)
    const res = revealCell(board, 1, 1)
    expect(res.hitMine).toBe(false)
    // all revealed
    let revealed = 0
    for (const row of res.board) for (const cell of row) if (cell.isRevealed) revealed++
    expect(revealed).toBe(9)
  })

  it('flag toggling cycles flag -> question -> clear', () => {
    const board = createEmptyBoard(2, 2)
    const b1 = toggleMark(board, 0, 0)
    expect(b1[0][0].isFlagged).toBe(true)
    const b2 = toggleMark(b1, 0, 0)
    expect(b2[0][0].isFlagged).toBe(false)
    expect(b2[0][0].isQuestion).toBe(true)
    const b3 = toggleMark(b2, 0, 0)
    expect(b3[0][0].isFlagged).toBe(false)
    expect(b3[0][0].isQuestion).toBe(false)
  })

  it('win detection works', () => {
    // 2x2 board with 1 mine
    let board = createEmptyBoard(2, 2)
    board[0][0].isMine = true
    board = calculateNumbers(board)
    // reveal other three
    let r = revealCell(board, 0, 1)
    r = revealCell(r.board, 1, 0)
    r = revealCell(r.board, 1, 1)
    expect(checkWin(r.board, 1)).toBe(true)
  })

  it('chording reveals neighbors when flags match number', () => {
    // Construct small board where center has 1 mine neighbor
    // Place a mine at (0,0)
    let board = createEmptyBoard(3, 3)
    board[0][0].isMine = true
    board = calculateNumbers(board)
    // reveal center
    let res = revealCell(board, 1, 1)
    board = res.board
    // flag the mine
    board[0][0].isFlagged = true
    // chord on center should reveal remaining neighbors
    res = chord(board, 1, 1)
    let revealed = 0
    for (const row of res.board) for (const cell of row) if (cell.isRevealed) revealed++
    expect(revealed).toBeGreaterThan(1)
  })

  it('counts flags', () => {
    let board = createEmptyBoard(2, 2)
    board = toggleMark(board, 0, 0)
    board = toggleMark(board, 1, 1)
    expect(countFlags(board)).toBe(2)
  })
})
