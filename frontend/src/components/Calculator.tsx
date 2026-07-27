import { useState, type FormEvent } from 'react'
import { calculate, CalculatorApiError, UNARY_OPERATIONS, type Operation } from '../api/calculatorClient'
import { ThemeToggle } from './ThemeToggle'
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

function getPreview(operation: Operation, a: string, b: string): string {
  switch (operation) {
    case 'add':
      return `${a} + ${b}`
    case 'subtract':
      return `${a} − ${b}`
    case 'multiply':
      return `${a} × ${b}`
    case 'divide':
      return `${a} ÷ ${b}`
    case 'exponentiate':
      return `${a} ^ ${b}`
    case 'sqrt':
      return `√${a}`
    case 'percentage':
      return `${b}% of ${a}`
  }
}

interface CalculatorProps {
  /** Called every time the Calculate button is pressed, before validation. */
  onCalculate?: () => void
}

export function Calculator({ onCalculate }: CalculatorProps) {
  const [operation, setOperation] = useState<Operation>('add')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [resultExpression, setResultExpression] = useState<string | null>(null)
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
    onCalculate?.()
    setResult(null)
    setResultExpression(null)

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
      setResultExpression(getPreview(operation, a, b))
    } catch (err) {
      const message = err instanceof CalculatorApiError ? err.message : 'Could not reach the calculator service.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const preview = getPreview(operation, a || '0', b || '0')

  return (
    <div className="calculator">
      <div className="calculator-header">
        <div>
          <p className="calculator-eyebrow">Calc / rev. 01</p>
          <h1>Calculator</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="screen" key={error ?? result ?? 'idle'}>
        {error ? (
          <p className="screen-line screen-line--error" role="alert">
            {error}
          </p>
        ) : result !== null ? (
          <p className="screen-line screen-line--result" data-testid="result">
            {resultExpression} = <strong>{result}</strong>
          </p>
        ) : (
          <p className="screen-line screen-line--idle">
            {preview}
            <span className="screen-cursor" aria-hidden="true" />
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="calculator-form">
        <label className="field">
          <span>Operation</span>
          <select
            value={operation}
            onChange={(event) => {
              setOperation(event.target.value as Operation)
              setResult(null)
              setResultExpression(null)
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

        <div className="field-row">
          <label className="field">
            <span>{isUnary ? 'Value' : 'First value'}</span>
            <input
              type="number"
              inputMode="decimal"
              value={a}
              onChange={(event) => setA(event.target.value)}
              placeholder="0"
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
                placeholder="0"
              />
            </label>
          )}
        </div>

        <button type="submit" className="equals-key" disabled={isLoading}>
          {isLoading ? 'Calculating…' : 'Calculate'}
        </button>
      </form>
    </div>
  )
}
