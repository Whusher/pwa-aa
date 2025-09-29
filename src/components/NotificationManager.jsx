// src/components/NotificationManager.jsx - Versión mejorada
import { useState, useEffect } from 'react'
import { usePWA } from '../context/PWAContext'

const NotificationManager = () => {
  const { state, actions } = usePWA()
  const [isSupported, setIsSupported] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState('unknown')

  useEffect(() => {
    // Detectar soporte de notificaciones
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
    
    // Detectar si PWA está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://')
    setIsPWAInstalled(isInstalled)
    
    // Detectar tipo de dispositivo
    const userAgent = navigator.userAgent.toLowerCase()
    if (/android/.test(userAgent)) {
      setDeviceType('android')
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios')
    } else {
      setDeviceType('desktop')
    }
  }, [])

  const handleRequestPermission = async () => {
    if (!isSupported) {
      alert('Las notificaciones no están soportadas en este navegador')
      return
    }

    // En iOS, las notificaciones solo funcionan si la PWA está instalada
    if (deviceType === 'ios' && !isPWAInstalled) {
      alert('En iOS, primero debes instalar la aplicación en tu pantalla de inicio. Usa el botón "Compartir" → "Agregar a pantalla de inicio"')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        // Registrar para push notifications si es posible
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready
          
          // Intentar suscribirse a push notifications
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(getVAPIDKey())
            })
            
            console.log('Push subscription:', subscription)
            
            // Guardar la suscripción en el servidor (simulado)
            await savePushSubscription(subscription)
            
            actions.showNotification(
              '✅ ¡Notificaciones activadas!',
              'Ahora recibirás notificaciones push de la aplicación'
            )
          } catch (pushError) {
            console.warn('Push subscription failed:', pushError)
            // Aún podemos mostrar notificaciones locales
            actions.showNotification(
              '📱 Notificaciones básicas activadas',
              'Las notificaciones locales están funcionando'
            )
          }
        } else {
          actions.showNotification(
            '📱 Notificaciones activadas',
            'Las notificaciones están funcionando correctamente'
          )
        }
      } else if (permission === 'denied') {
        alert('Notificaciones denegadas. Puedes activarlas desde la configuración de tu navegador.')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      alert('Error al solicitar permisos de notificación')
    }
  }

  const handleTestNotification = async () => {
    if (state.notifications.permission !== 'granted') {
      alert('Primero debes activar las notificaciones')
      return
    }

    try {
      // Notification básica
      const notification = new Notification('🚀 ¡Notificación de prueba!', {
        body: `Enviada desde ${deviceType} a las ${new Date().toLocaleTimeString()}`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
        renotify: true,
        requireInteraction: true, // Importante para móviles
        actions: [
          {
            action: 'view',
            title: '👀 Ver',
            icon: '/pwa-192x192.png'
          },
          {
            action: 'dismiss',
            title: '❌ Cerrar',
            icon: '/pwa-192x192.png'
          }
        ],
        data: {
          url: window.location.origin,
          timestamp: Date.now()
        }
      })

      // Manejar clicks en la notificación
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto-cerrar después de 10 segundos si no es interactiva
      setTimeout(() => {
        notification.close()
      }, 10000)

    } catch (error) {
      console.error('Error showing notification:', error)
      
      // Fallback para dispositivos que no soportan notificaciones avanzadas
      if (navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('🚀 Notificación via Service Worker', {
            body: 'Esta notificación viene del Service Worker',
            icon: '/pwa-192x192.png',
            tag: 'sw-notification'
          })
        })
      }
    }
  }

  const handleScheduleNotification = () => {
    if (state.notifications.permission !== 'granted') {
      alert('Primero debes activar las notificaciones')
      return
    }

    // Programar notificación para dentro de 5 segundos
    setTimeout(() => {
      actions.showNotification(
        '⏰ Notificación programada',
        'Esta notificación fue programada hace 5 segundos'
      )
    }, 5000)

    alert('Notificación programada para dentro de 5 segundos')
  }

  const getNotificationStatus = () => {
    if (!isSupported) {
      return { text: 'No soportado', color: 'error' }
    }

    switch (state.notifications.permission) {
      case 'granted':
        return { text: 'Permitidas ✅', color: 'success' }
      case 'denied':
        return { text: 'Denegadas ❌', color: 'error' }
      default:
        return { text: 'No configuradas ⚠️', color: 'warning' }
    }
  }

  const status = getNotificationStatus()

  const renderDeviceSpecificInfo = () => {
    switch (deviceType) {
      case 'ios':
        return (
          <div className="device-info ios">
            <h4>📱 Información para iOS:</h4>
            <ul>
              <li>Las notificaciones solo funcionan si la app está <strong>instalada</strong></li>
              <li>Usa Safari → Compartir → "Agregar a pantalla de inicio"</li>
              <li>Estado de instalación: {isPWAInstalled ? '✅ Instalada' : '❌ No instalada'}</li>
              <li>Las notificaciones push tienen limitaciones en iOS</li>
            </ul>
          </div>
        )
      case 'android':
        return (
          <div className="device-info android">
            <h4>🤖 Información para Android:</h4>
            <ul>
              <li>Soporte completo para notificaciones push</li>
              <li>Funciona tanto en navegador como PWA instalada</li>
              <li>Estado de instalación: {isPWAInstalled ? '✅ Instalada como PWA' : '🌐 En navegador'}</li>
              <li>Se recomienda instalar como PWA para mejor experiencia</li>
            </ul>
          </div>
        )
      case 'desktop':
        return (
          <div className="device-info desktop">
            <h4>💻 Información para Desktop:</h4>
            <ul>
              <li>Soporte completo para notificaciones</li>
              <li>Aparecen como notificaciones del sistema</li>
              <li>Funcionan incluso con el navegador cerrado</li>
            </ul>
          </div>
        )
      default:
        return null
    }
  }

  if (!isSupported) {
    return (
      <div className="notification-manager">
        <div className="notification-error">
          <h3>❌ Notificaciones no soportadas</h3>
          <p>Tu navegador o dispositivo no soporta notificaciones web.</p>
          <p>Intenta usar un navegador más reciente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notification-manager">
      <div className="notification-status">
        <p><strong>Estado:</strong> <span className={`status ${status.color}`}>{status.text}</span></p>
        <p><strong>Dispositivo:</strong> {deviceType}</p>
        <p><strong>PWA instalada:</strong> {isPWAInstalled ? '✅ Sí' : '❌ No'}</p>
      </div>

      <div className="notification-controls">
        {state.notifications.permission === 'granted' ? (
          <>
            <button onClick={handleTestNotification} className="btn btn-primary">
              🔔 Probar notificación
            </button>
            <button onClick={handleScheduleNotification} className="btn btn-secondary">
              ⏰ Notificación en 5s
            </button>
          </>
        ) : (
          <button onClick={handleRequestPermission} className="btn btn-primary">
            🔔 Activar notificaciones
          </button>
        )}
      </div>

      {renderDeviceSpecificInfo()}

      {state.notifications.permission === 'denied' && (
        <div className="notification-help">
          <h4>🔧 Para reactivar notificaciones:</h4>
          <ul>
            <li><strong>Chrome:</strong> Configuración → Privacidad → Configuración del sitio → Notificaciones</li>
            <li><strong>Safari:</strong> Preferencias → Sitios web → Notificaciones</li>
            <li><strong>Firefox:</strong> Preferencias → Privacidad → Permisos → Notificaciones</li>
          </ul>
        </div>
      )}
    </div>
  )
}

// Utilidades para push notifications
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function getVAPIDKey() {
  // Esta debería ser tu clave VAPID real
  // Para desarrollo, puedes usar una clave de prueba
  return 'BMqSvZTU-qhqm7Oe8MkbTWdMLVcNNNqhiWqVSwGHh3_3w7c3B4LZ9qBAqjdPXmgIwWPEdjPz0vZsYJLqr7g-OaE'
}

async function savePushSubscription(subscription) {
  // Aquí enviarías la suscripción a tu servidor
  // Para este ejemplo, solo la guardamos en localStorage
  localStorage.setItem('pushSubscription', JSON.stringify(subscription))
  console.log('Push subscription saved:', subscription)
}

export default NotificationManager