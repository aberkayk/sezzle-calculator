import { useState } from 'react'
import { Calculator } from './components/Calculator'
import { MathBackdrop } from './components/MathBackdrop'
import './App.css'

function App() {
  const [burstSignal, setBurstSignal] = useState(0)

  return (
    <main className="app-shell">
      <MathBackdrop burstSignal={burstSignal} />
      <Calculator onCalculate={() => setBurstSignal((count) => count + 1)} />
    </main>
  )
}

export default App
