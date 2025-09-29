// src/context/PWAContext.jsx - Versión mejorada para notificaciones móviles
import { createContext, useContext, useReducer, useEffect } from 'react'

const PWAContext = createContext()

const initialState = {
  isOnline: navigator.onLine,
  notifications: {
    permission: 'default',
    enabled: false,
    supported: false,
    pushEnabled: false
  },
  deviceFeatures: {
    geolocation: 'unknown',
    camera: 'unknown',
    motion: 'unknown'
  },
  device: {
    type: 'unknown',
    isPWAInstalled: false,
    supportsInstall: false
  },
  data: {
    local: [],
    remote: [],
    cached: []
  },
  ui: {
    loading: false,
    error: null
  }
}

function pwaReducer(state, action) {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }
    
    case 'SET_NOTIFICATION_PERMISSION':
      return {
        ...state,
        notifications: { ...state.notifications, permission: action.payload }
      }
    
    case 'ENABLE_NOTIFICATIONS':
      return {
        ...state,
        notifications: { ...state.notifications, enabled: action.payload }
      }

    case 'SET_NOTIFICATION_SUPPORT':
      return {
        ...state,
        notifications: { ...state.notifications, supported: action.payload }
      }

    case 'SET_PUSH_ENABLED':
      return {
        ...state,
        notifications: { ...state.notifications, pushEnabled: action.payload }
      }

    case 'SET_DEVICE_INFO':
      return {
        ...state,
        device: { ...state.device, ...action.payload }
      }
    
    case 'UPDATE_DEVICE_FEATURE':
      return {
        ...state,
        deviceFeatures: {
          ...state.deviceFeatures,
          [action.feature]: action.status
        }
      }
    
    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, [action.dataType]: action.payload }
      }
    
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } }
    
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } }
    
    default:
      return state
  }
}

export const PWAProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pwaReducer, initialState)

  useEffect(() => {
    // Detectar información del dispositivo
    const detectDeviceInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      let deviceType = 'desktop'
      
      if (/android/.test(userAgent)) {
        deviceType = 'android'
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        deviceType = 'ios'
      }

      const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://')

      const supportsInstall = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window

      dispatch({
        type: 'SET_DEVICE_INFO',
        payload: { type: deviceType, isPWAInstalled, supportsInstall }
      })
    }

    // Verificar soporte de notificaciones
    const checkNotificationSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator
      dispatch({ type: 'SET_NOTIFICATION_SUPPORT', payload: supported })

      if (supported) {
        dispatch({ 
          type: 'SET_NOTIFICATION_PERMISSION', 
          payload: Notification.permission 
        })
        dispatch({ 
          type: 'ENABLE_NOTIFICATIONS', 
          payload: Notification.permission === 'granted' 
        })
      }
    }

    // Setup online/offline listeners
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
      // Intentar sincronizar datos pendientes
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          return registration.sync.register('background-sync-data')
        }).catch(console.error)
      }
    }

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false })
    }

    // Listener para mensajes del Service Worker
    const handleSWMessage = (event) => {
      if (event.data.type === 'SYNC_DATA') {
        console.log('Background sync requested from SW')
        // Realizar sincronización de datos
      }
    }

    detectDeviceInfo()
    checkNotificationSupport()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
      }
    }
  }, [])

  const actions = {
    // Notification actions mejoradas
    requestNotificationPermission: async () => {
      if (!state.notifications.supported) {
        throw new Error('Notifications not supported')
      }

      // Verificar instalación PWA en iOS
      if (state.device.type === 'ios' && !state.device.isPWAInstalled) {
        throw new Error('iOS_PWA_REQUIRED')
      }

      const permission = await Notification.requestPermission()
      dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: permission })
      dispatch({ type: 'ENABLE_NOTIFICATIONS', payload: permission === 'granted' })
      
      // Si se otorgan permisos, intentar configurar push notifications
      if (permission === 'granted') {
        await actions.setupPushNotifications()
      }
      
      return permission
    },

    setupPushNotifications: async () => {
      if (!('serviceWorker' in navigator && 'PushManager' in window)) {
        console.warn('Push notifications not supported')
        return false
      }

      try {
        const registration = await navigator.serviceWorker.ready
        
        // Verificar si ya hay una suscripción
        let subscription = await registration.pushManager.getSubscription()
        
        if (!subscription) {
          // Crear nueva suscripción
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(getVAPIDKey())
          })
        }

        // Guardar suscripción
        await savePushSubscription(subscription)
        dispatch({ type: 'SET_PUSH_ENABLED', payload: true })
        
        return true
      } catch (error) {
        console.error('Failed to setup push notifications:', error)
        dispatch({ type: 'SET_PUSH_ENABLED', payload: false })
        return false
      }
    },

    showNotification: (title, options = {}) => {
      if (!state.notifications.enabled) {
        console.warn('Notifications not enabled')
        return
      }

      const defaultOptions = {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        requireInteraction: state.device.type !== 'desktop', // Importante para móviles
        vibrate: state.device.type !== 'desktop' ? [100, 50, 100] : undefined,
        timestamp: Date.now(),
        ...options
      }

      // Usar Service Worker para notificaciones más confiables en móviles
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          return registration.showNotification(title, defaultOptions)
        }).catch(error => {
          console.error('SW notification failed, trying direct:', error)
          // Fallback a notificación directa
          new Notification(title, defaultOptions)
        })
      } else {
        new Notification(title, defaultOptions)
      }
    },

    scheduleNotification: (title, options = {}, delay = 5000) => {
      if (!state.notifications.enabled) {
        console.warn('Notifications not enabled')
        return
      }

      setTimeout(() => {
        actions.showNotification(title, {
          ...options,
          tag: 'scheduled-notification',
          body: options.body || `Notificación programada para ${new Date().toLocaleTimeString()}`
        })
      }, delay)
    },

    // Device feature actions mejoradas
    requestGeolocation: async () => {
      if (!navigator.geolocation) {
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'geolocation', 
          status: 'unsupported' 
        })
        return null
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          )
        })
        
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'geolocation', 
          status: 'granted' 
        })
        
        // Mostrar notificación con la ubicación
        actions.showNotification('📍 Ubicación obtenida', {
          body: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          icon: '/pwa-192x192.png'
        })
        
        return position
      } catch (error) {
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'geolocation', 
          status: 'denied' 
        })
        return null
      }
    },

    requestCamera: async () => {
      if (!navigator.mediaDevices) {
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'camera', 
          status: 'unsupported' 
        })
        return null
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'camera', 
          status: 'granted' 
        })
        
        // Detener el stream inmediatamente después de obtener permisos
        stream.getTracks().forEach(track => track.stop())
        
        actions.showNotification('📷 Cámara accesible', {
          body: 'Permisos de cámara concedidos correctamente'
        })
        
        return stream
      } catch (error) {
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'camera', 
          status: 'denied' 
        })
        return null
      }
    },

    // Data management actions mejoradas
    loadLocalData: () => {
      const cached = localStorage.getItem('pwa-local-data')
      const localData = cached ? JSON.parse(cached) : []
      dispatch({ type: 'SET_DATA', dataType: 'local', payload: localData })
      return localData
    },

    saveLocalData: (data) => {
      localStorage.setItem('pwa-local-data', JSON.stringify(data))
      dispatch({ type: 'SET_DATA', dataType: 'local', payload: data })
      
      // Programar sincronización en background si está offline
      if (!state.isOnline && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          return registration.sync.register('background-sync-data')
        }).catch(console.error)
      }
    },

    loadRemoteData: async () => {
      if (!state.isOnline) {
        throw new Error('No internet connection')
      }

      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        // Simular API call con mejor handling
        await new Promise(resolve => setTimeout(resolve, 1000))
        const remoteData = [
          {
            id: Date.now(),
            title: 'Datos del servidor',
            description: 'Información sincronizada desde el servidor',
            timestamp: new Date().toISOString(),
            synced: true
          },
          {
            id: Date.now() + 1,
            title: 'Contenido remoto actualizado',
            description: 'Última información disponible en el servidor',
            timestamp: new Date().toISOString(),
            synced: true
          }
        ]
        
        dispatch({ type: 'SET_DATA', dataType: 'remote', payload: remoteData })
        
        // Cache the data
        localStorage.setItem('pwa-cached-data', JSON.stringify(remoteData))
        dispatch({ type: 'SET_DATA', dataType: 'cached', payload: remoteData })
        
        dispatch({ type: 'SET_LOADING', payload: false })
        
        // Notificar datos cargados
        actions.showNotification('🌐 Datos actualizados', {
          body: `${remoteData.length} elementos cargados desde el servidor`
        })
        
        return remoteData
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        dispatch({ type: 'SET_LOADING', payload: false })
        throw error
      }
    },

    loadCachedData: () => {
      const cached = localStorage.getItem('pwa-cached-data')
      const cachedData = cached ? JSON.parse(cached) : []
      dispatch({ type: 'SET_DATA', dataType: 'cached', payload: cachedData })
      return cachedData
    },

    // Utilidades adicionales
    vibrate: (pattern = [100, 50, 100]) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern)
        actions.showNotification('📳 Vibración activada', {
          body: 'El dispositivo ha vibrado correctamente'
        })
        return true
      }
      return false
    },

    share: async (data = {}) => {
      const shareData = {
        title: 'React PWA',
        text: 'Descubre esta increíble Progressive Web App',
        url: window.location.origin,
        ...data
      }

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
          actions.showNotification('🔗 Contenido compartido', {
            body: 'El contenido se compartió exitosamente'
          })
          return true
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error)
          }
        }
      }
      
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareData.url)
        actions.showNotification('📋 Enlace copiado', {
          body: 'El enlace se copió al portapapeles'
        })
        return true
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        return false
      }
    }
  }

  return (
    <PWAContext.Provider value={{ state, actions }}>
      {children}
    </PWAContext.Provider>
  )
}

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
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
  // En producción, obtén esto de tus variables de entorno
  // Esta es una clave de ejemplo - no usar en producción
  return 'BMqSvZTU-qhqm7Oe8MkbTWdMLVcNNNqhiWqVSwGHh3_3w7c3B4LZ9qBAqjdPXmgIwWPEdjPz0vZsYJLqr7g-OaE'
}

async function savePushSubscription(subscription) {
  try {
    // En producción, envía esto a tu servidor
    const response = await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    })
    
    if (!response.ok) {
      throw new Error('Failed to save push subscription')
    }
  } catch (error) {
    // Fallback: guardar localmente para desarrollo
    localStorage.setItem('pushSubscription', JSON.stringify(subscription))
    console.log('Push subscription saved locally:', subscription)
  }
}