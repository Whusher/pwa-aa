import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import HomePage from './pages/HomePage'
import OfflinePage from './pages/OfflinePage'
import DeviceFeaturesPage from './pages/DeviceFeaturesPage'
import { PWAProvider } from './context/PWAContext'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <PWAProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="/device" element={<DeviceFeaturesPage />} />
          </Routes>
        </div>
      </Router>
    </PWAProvider>
  )
}

export default App