import { useEffect, useRef } from 'react'
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

const SPEED_MIN = 10 // px/s
const SPEED_MAX = 24 // px/s
const BURST_SPEED_MIN = 900 // px/s
const BURST_SPEED_MAX = 1300 // px/s
const BURST_DURATION_MS = 550

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  angularVelocity: number
}

function randomVelocity(min: number, max: number): { vx: number; vy: number } {
  const angle = Math.random() * Math.PI * 2
  const speed = min + Math.random() * (max - min)
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }
}

interface MathBackdropProps {
  /** Bump this number to trigger a scatter; the value itself is only used to detect change. */
  burstSignal: number
}

export function MathBackdrop({ burstSignal }: MathBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([])
  const particlesRef = useRef<Particle[]>([])
  const isBurstingRef = useRef(false)

  // Set up the initial particles and the physics loop once.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const { width: cw, height: ch } = container.getBoundingClientRect()

    particlesRef.current = EXPRESSIONS.map((_, i) => {
      const el = itemRefs.current[i]
      const w = el?.offsetWidth ?? 60
      const h = el?.offsetHeight ?? 24
      const { vx, vy } = reducedMotion ? { vx: 0, vy: 0 } : randomVelocity(SPEED_MIN, SPEED_MAX)
      return {
        x: Math.random() * Math.max(cw - w, 0),
        y: Math.random() * Math.max(ch - h, 0),
        vx,
        vy,
        rotation: (Math.random() - 0.5) * 16,
        angularVelocity: reducedMotion ? 0 : (Math.random() - 0.5) * 6,
      }
    })

    if (reducedMotion) {
      particlesRef.current.forEach((p, i) => {
        const el = itemRefs.current[i]
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`
      })
      return
    }

    let frameId = 0
    let last = performance.now()

    function step(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const bursting = isBurstingRef.current
      const { width: cw2, height: ch2 } = container!.getBoundingClientRect()

      particlesRef.current.forEach((p, i) => {
        const el = itemRefs.current[i]
        if (!el) return

        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rotation += p.angularVelocity * dt

        if (!bursting) {
          const maxX = Math.max(cw2 - el.offsetWidth, 0)
          const maxY = Math.max(ch2 - el.offsetHeight, 0)

          if (p.x <= 0) {
            p.x = 0
            p.vx = Math.abs(p.vx)
          } else if (p.x >= maxX) {
            p.x = maxX
            p.vx = -Math.abs(p.vx)
          }

          if (p.y <= 0) {
            p.y = 0
            p.vy = Math.abs(p.vy)
          } else if (p.y >= maxY) {
            p.y = maxY
            p.vy = -Math.abs(p.vy)
          }
        }

        el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`
      })

      frameId = requestAnimationFrame(step)
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
    // Runs once: the physics loop reads refs every frame, it doesn't need to restart on prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // React to a burst: fling everything outward, then re-seed positions and let them drift again.
  useEffect(() => {
    if (burstSignal === 0) return

    const items = itemRefs.current
    isBurstingRef.current = true

    particlesRef.current.forEach((p, i) => {
      const direction = i % 2 === 0 ? -1 : 1
      const speed = BURST_SPEED_MIN + Math.random() * (BURST_SPEED_MAX - BURST_SPEED_MIN)
      p.vx = direction * speed
      p.vy = (Math.random() - 0.5) * 300
      items[i]?.classList.add('is-bursting')
    })

    const timeout = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const { width: cw, height: ch } = container.getBoundingClientRect()

      particlesRef.current.forEach((p, i) => {
        const el = items[i]
        const w = el?.offsetWidth ?? 60
        const h = el?.offsetHeight ?? 24
        p.x = Math.random() * Math.max(cw - w, 0)
        p.y = Math.random() * Math.max(ch - h, 0)
        const { vx, vy } = randomVelocity(SPEED_MIN, SPEED_MAX)
        p.vx = vx
        p.vy = vy
        el?.classList.remove('is-bursting')
      })

      isBurstingRef.current = false
    }, BURST_DURATION_MS)

    return () => clearTimeout(timeout)
  }, [burstSignal])

  return (
    <div className="math-backdrop" ref={containerRef} aria-hidden="true">
      {EXPRESSIONS.map((text, i) => (
        <span
          key={text}
          ref={(el) => {
            itemRefs.current[i] = el
          }}
          className="math-backdrop-item"
        >
          {text}
        </span>
      ))}
    </div>
  )
}
