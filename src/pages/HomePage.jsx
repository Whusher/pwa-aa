import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePWA } from '../context/PWAContext'
import Navigation from '../components/Navigation'
import DataManager from '../components/DataManager'
import NotificationManager from '../components/NotificationManager'

const HomePage = () => {
  const { state, actions } = usePWA()
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.choiceResult
      if (result.outcome === 'accepted') {
        setInstallPrompt(null)
        actions.showNotification('PWA Instalada', 'La aplicación se instaló correctamente')
      }
    }
  }

  return (
    <div className="page">
      <Navigation />
      
      <main className="container">
        <section className="hero-section">
          <h1>🏠 Pantalla de Inicio</h1>
          <p>Bienvenido a nuestra Progressive Web App desarrollada con React y Vite</p>
          <div className="status-indicators">
            <span className={`status ${state.isOnline ? 'online' : 'offline'}`}>
              {state.isOnline ? '🟢 En línea' : '🔴 Sin conexión'}
            </span>
            {installPrompt && (
              <button className="install-btn" onClick={handleInstallPWA}>
                📱 Instalar App
              </button>
            )}
          </div>
        </section>

        <section className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Datos Híbridos</h3>
            <p>Gestión de datos locales, remotos y offline con sincronización automática</p>
            <Link to="/offline" className="btn">Ver Gestión</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notificaciones</h3>
            <p>Sistema de notificaciones push nativas del navegador</p>
            <NotificationManager />
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Hardware</h3>
            <p>Acceso a funcionalidades nativas del dispositivo</p>
            <Link to="/device" className="btn">Probar Funciones</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Renderizado SSR/CSR</h3>
            <p>Renderizado híbrido del lado del servidor y cliente</p>
            <button className="btn" onClick={() => window.location.reload()}>
              Demostrar SSR
            </button>
          </div>
        </section>

        <DataManager />
      </main>
    </div>
  )
}

export default HomePage