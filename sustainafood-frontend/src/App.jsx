import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Log from './pages/log.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Log />
    </>
  )
}

export default App
