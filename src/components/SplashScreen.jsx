import { useState, useEffect } from 'react'
const SplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-logo">
        <img src="giant-main.svg" alt="pwa-icon" height={90} width={90} ></img>
      </div>
      <h1 className="splash-title">Angel Anaya</h1>
      <p className="splash-subtitle">Progressive Web Application</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

export default SplashScreen