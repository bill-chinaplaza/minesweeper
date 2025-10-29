import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'
import { describe, it, expect } from 'vitest'

// Basic integration tests for main interactions

describe('Minesweeper App', () => {
  it('renders and allows cell reveal', () => {
    render(<App />)
    const grid = screen.getByRole('grid', { name: /minesweeper board/i })
    expect(grid).toBeInTheDocument()
    const cells = screen.getAllByRole('gridcell')
    const first = cells[0]
    // Left click reveal
    fireEvent.click(first)
    // After reveal, it should not be hidden anymore
    expect(first).not.toHaveClass('hidden')
  })

  it('right-click toggles flag', () => {
    render(<App />)
    const cell = screen.getAllByRole('gridcell')[1]
    fireEvent.contextMenu(cell)
    expect(cell).toHaveTextContent('🚩')
    fireEvent.contextMenu(cell)
    expect(cell).toHaveTextContent('❓')
    fireEvent.contextMenu(cell)
    expect(cell).toHaveTextContent('')
  })
})
