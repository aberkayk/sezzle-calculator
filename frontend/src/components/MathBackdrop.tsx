import { useEffect, useState, type CSSProperties } from 'react'
import './MathBackdrop.css'

const EXPRESSIONS = [
  '3 + 5',
  '12 − 7',
  '6 × 9',
  '81 ÷ 3',
  '2 ^ 5',
  '√49',
  '15% of 60',
  '100 − 42',
  '7 × 8',
  '9 + 16',
  '√121',
  '4 ^ 3',
]

interface Item {
  id: number
  text: string
  top: number
  left: number
  duration: number
  delay: number
  driftX: number
  driftY: number
  rotate: number
  burstDirection: 'left' | 'right'
}

function randomItems(generation: number): Item[] {
  return EXPRESSIONS.map((text, index) => ({
    id: generation * EXPRESSIONS.length + index,
    text,
    top: Math.random() * 88,
    left: Math.random() * 88,
    duration: 18 + Math.random() * 16,
    delay: Math.random() * -20,
    driftX: (Math.random() - 0.5) * 50,
    driftY: (Math.random() - 0.5) * 50,
    rotate: (Math.random() - 0.5) * 18,
    burstDirection: index % 2 === 0 ? 'left' : 'right',
  }))
}

interface MathBackdropProps {
  /** Bump this number to trigger a scatter; the value itself is only used to detect change. */
  burstSignal: number
}

export function MathBackdrop({ burstSignal }: MathBackdropProps) {
  const [items, setItems] = useState<Item[]>(() => randomItems(0))
  const [isBursting, setIsBursting] = useState(false)

  useEffect(() => {
    if (burstSignal === 0) return

    setIsBursting(true)
    const timeout = setTimeout(() => {
      setItems(randomItems(burstSignal))
      setIsBursting(false)
    }, 550)

    return () => clearTimeout(timeout)
  }, [burstSignal])

  return (
    <div className="math-backdrop" aria-hidden="true">
      {items.map((item) => {
        const style = {
          top: `${item.top}%`,
          left: `${item.left}%`,
          '--duration': `${item.duration}s`,
          '--delay': `${item.delay}s`,
          '--drift-x': `${item.driftX}px`,
          '--drift-y': `${item.driftY}px`,
          '--rotate': `${item.rotate}deg`,
        } as CSSProperties

        return (
          <span
            key={item.id}
            className={
              isBursting ? `math-backdrop-item is-bursting burst-${item.burstDirection}` : 'math-backdrop-item'
            }
            style={style}
          >
            {item.text}
          </span>
        )
      })}
    </div>
  )
}
