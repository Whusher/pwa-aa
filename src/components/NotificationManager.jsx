import { usePWA } from '../context/PWAContext'

const NotificationManager = () => {
  const { state, actions } = usePWA()

  const handleToggleNotifications = () => {
    if (state.notifications.permission === 'granted') {
      actions.showNotification(
        'Notificaciones activas',
        'Las notificaciones están funcionando correctamente'
      )
    } else {
      actions.requestNotificationPermission()
    }
  }

  const getNotificationStatus = () => {
    switch (state.notifications.permission) {
      case 'granted':
        return { text: 'Permitidas', color: 'success' }
      case 'denied':
        return { text: 'Denegadas', color: 'error' }
      default:
        return { text: 'No configuradas', color: 'warning' }
    }
  }

  const status = getNotificationStatus()

  return (
    <div className="notification-manager">
      <p>Estado: <span className={`status ${status.color}`}>{status.text}</span></p>
      <button onClick={handleToggleNotifications} className="btn">
        🔔 {state.notifications.permission === 'granted' ? 'Probar' : 'Activar'} Notificaciones
      </button>
    </div>
  )
}

export default NotificationManager