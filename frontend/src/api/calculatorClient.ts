export type Operation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'exponentiate'
  | 'sqrt'
  | 'percentage'

/** Operations that only use the first operand; the UI hides the second input for these. */
export const UNARY_OPERATIONS: ReadonlySet<Operation> = new Set(['sqrt'])

export class CalculatorApiError extends Error {}

interface CalculateResponse {
  result: number
}

interface CalculateErrorResponse {
  error: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Calls the backend calculate endpoint. `b` is ignored by the server for
 * unary operations (currently only `sqrt`) and may be omitted.
 */
export async function calculate(operation: Operation, a: number, b?: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/v1/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, a, b }),
  })

  const body = await response.json()

  if (!response.ok) {
    const { error } = body as CalculateErrorResponse
    throw new CalculatorApiError(error ?? 'Something went wrong while calculating.')
  }

  return (body as CalculateResponse).result
}
