import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculate, CalculatorApiError } from './calculatorClient'

describe('calculate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the result on a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 8 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await calculate('add', 5, 3)

    expect(result).toBe(8)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/calculate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ operation: 'add', a: 5, b: 3 }),
      }),
    )
  })

  it('omits b when not provided (unary operations)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 4 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await calculate('sqrt', 16)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ body: JSON.stringify({ operation: 'sqrt', a: 16, b: undefined }) }),
    )
  })

  it('throws a CalculatorApiError with the server message on failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'division by zero' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(calculate('divide', 1, 0)).rejects.toThrow(CalculatorApiError)
    await expect(calculate('divide', 1, 0)).rejects.toThrow('division by zero')
  })
})
