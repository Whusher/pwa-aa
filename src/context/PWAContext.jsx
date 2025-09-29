import { createContext, useContext, useReducer, useEffect } from 'react'

const PWAContext = createContext()

const initialState = {
  isOnline: navigator.onLine,
  notifications: {
    permission: 'default',
    enabled: false
  },
  deviceFeatures: {
    geolocation: 'unknown',
    camera: 'unknown',
    motion: 'unknown'
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
    // Setup online/offline listeners
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check notification permission on load
    if ('Notification' in window) {
      dispatch({ 
        type: 'SET_NOTIFICATION_PERMISSION', 
        payload: Notification.permission 
      })
    }

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_DATA') {
          // Handle background sync
          console.log('Background sync requested')
        }
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const actions = {
    // Notification actions
    requestNotificationPermission: async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        dispatch({ type: 'SET_NOTIFICATION_PERMISSION', payload: permission })
        dispatch({ type: 'ENABLE_NOTIFICATIONS', payload: permission === 'granted' })
        return permission
      }
    },

    showNotification: (title, options) => {
      if (state.notifications.permission === 'granted') {
        new Notification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options
        })
      }
    },

    // Device feature actions
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
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'geolocation', 
          status: 'granted' 
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        dispatch({ 
          type: 'UPDATE_DEVICE_FEATURE', 
          feature: 'camera', 
          status: 'granted' 
        })
        // Stop the stream immediately after permission check
        stream.getTracks().forEach(track => track.stop())
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

    // Data management actions
    loadLocalData: () => {
      const cached = localStorage.getItem('pwa-local-data')
      const localData = cached ? JSON.parse(cached) : []
      dispatch({ type: 'SET_DATA', dataType: 'local', payload: localData })
      return localData
    },

    saveLocalData: (data) => {
      localStorage.setItem('pwa-local-data', JSON.stringify(data))
      dispatch({ type: 'SET_DATA', dataType: 'local', payload: data })
    },

    loadRemoteData: async () => {
      if (!state.isOnline) {
        throw new Error('No internet connection')
      }

      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        const remoteData = [
          {
            id: 1,
            title: 'Server Data 1',
            description: 'This data comes from the server',
            timestamp: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Server Data 2', 
            description: 'Remote content synchronized',
            timestamp: new Date().toISOString()
          }
        ]
        
        dispatch({ type: 'SET_DATA', dataType: 'remote', payload: remoteData })
        // Cache the data
        localStorage.setItem('pwa-cached-data', JSON.stringify(remoteData))
        dispatch({ type: 'SET_LOADING', payload: false })
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