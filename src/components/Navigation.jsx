import { usePWA } from '../context/PWAContext'

const Navigation = () => {
  const { state, actions } = usePWA()

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-title">React PWA</div>
        <div className="nav-buttons">
          <button 
            className="nav-btn" 
            onClick={() => actions.showNotification('Test', 'Notificación de prueba')}
            title="Notificaciones"
          >
            🔔
          </button>
          <button 
            className="nav-btn" 
            onClick={() => window.location.reload()}
            title="Actualizar"
          >
            🔄
          </button>
          <span className={`connection-indicator ${state.isOnline ? 'online' : 'offline'}`}>
            {state.isOnline ? '🟢' : '🔴'}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navigation