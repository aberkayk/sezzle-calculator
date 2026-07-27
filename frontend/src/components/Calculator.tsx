import { useState, type FormEvent } from 'react'
import { calculate, CalculatorApiError, UNARY_OPERATIONS, type Operation } from '../api/calculatorClient'
import './Calculator.css'

const OPERATIONS: { value: Operation; label: string; symbol: string }[] = [
  { value: 'add', label: 'Addition', symbol: '+' },
  { value: 'subtract', label: 'Subtraction', symbol: '−' },
  { value: 'multiply', label: 'Multiplication', symbol: '×' },
  { value: 'divide', label: 'Division', symbol: '÷' },
  { value: 'exponentiate', label: 'Exponentiation', symbol: 'a^b' },
  { value: 'sqrt', label: 'Square Root', symbol: '√a' },
  { value: 'percentage', label: 'Percentage', symbol: 'b% of a' },
]

export function Calculator() {
  const [operation, setOperation] = useState<Operation>('add')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isUnary = UNARY_OPERATIONS.has(operation)

  function validate(): string | null {
    if (a.trim() === '' || Number.isNaN(Number(a))) {
      return 'Please enter a valid number for the first value.'
    }
    if (!isUnary && (b.trim() === '' || Number.isNaN(Number(b)))) {
      return 'Please enter a valid number for the second value.'
    }
    return null
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setResult(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const value = await calculate(operation, Number(a), isUnary ? undefined : Number(b))
      setResult(value)
    } catch (err) {
      const message = err instanceof CalculatorApiError ? err.message : 'Could not reach the calculator service.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="calculator">
      <h1>Calculator</h1>

      <form onSubmit={handleSubmit} className="calculator-form">
        <label className="field">
          <span>Operation</span>
          <select
            value={operation}
            onChange={(event) => {
              setOperation(event.target.value as Operation)
              setResult(null)
              setError(null)
            }}
          >
            {OPERATIONS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label} ({op.symbol})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{isUnary ? 'Value' : 'First value'}</span>
          <input
            type="number"
            inputMode="decimal"
            value={a}
            onChange={(event) => setA(event.target.value)}
            placeholder="e.g. 10"
          />
        </label>

        {!isUnary && (
          <label className="field">
            <span>Second value</span>
            <input
              type="number"
              inputMode="decimal"
              value={b}
              onChange={(event) => setB(event.target.value)}
              placeholder="e.g. 4"
            />
          </label>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Calculating…' : 'Calculate'}
        </button>
      </form>

      {error && (
        <p className="message message-error" role="alert">
          {error}
        </p>
      )}

      {result !== null && !error && (
        <p className="message message-result" data-testid="result">
          Result: <strong>{result}</strong>
        </p>
      )}
    </div>
  )
}
