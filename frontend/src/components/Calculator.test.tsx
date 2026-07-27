import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Calculator } from './Calculator'

function mockFetchOnce(response: { ok: boolean; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    json: async () => response.body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('Calculator', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits the selected operation and displays the result', async () => {
    const user = userEvent.setup()
    mockFetchOnce({ ok: true, body: { result: 42 } })

    render(<Calculator />)

    await user.type(screen.getByLabelText(/first value/i), '35')
    await user.type(screen.getByLabelText(/second value/i), '7')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Result: 42')
    })
  })

  it('hides the second input for unary operations like square root', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    await user.selectOptions(screen.getByLabelText(/operation/i), 'sqrt')

    expect(screen.queryByLabelText(/second value/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/value/i)).toBeInTheDocument()
  })

  it('shows a validation error instead of calling the API when input is invalid', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchOnce({ ok: true, body: { result: 0 } })

    render(<Calculator />)

    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid number/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('displays the server error message when the API rejects the request', async () => {
    const user = userEvent.setup()
    mockFetchOnce({ ok: false, body: { error: 'division by zero' } })

    render(<Calculator />)

    await user.type(screen.getByLabelText(/first value/i), '10')
    await user.type(screen.getByLabelText(/second value/i), '0')
    await user.selectOptions(screen.getByLabelText(/operation/i), 'divide')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('division by zero')
  })
})
