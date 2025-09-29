import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePWA } from '../context/PWAContext'
import Navigation from '../components/Navigation'

const DeviceFeaturesPage = () => {
  const { state, actions } = usePWA()
  const [locationData, setLocationData] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [motionData, setMotionData] = useState(null)
  const [batteryInfo, setBatteryInfo] = useState(null)

  useEffect(() => {
    // Check battery status
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging
        })
      })
    }

    // Listen for device motion
    if (window.DeviceMotionEvent) {
      const handleMotion = (event) => {
        setMotionData({
          acceleration: event.acceleration,
          rotationRate: event.rotationRate
        })
      }
      
      window.addEventListener('devicemotion', handleMotion)
      return () => window.removeEventListener('devicemotion', handleMotion)
    }
  }, [])

  const handleRequestLocation = async () => {
    const position = await actions.requestGeolocation()
    if (position) {
      setLocationData({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
      actions.showNotification('Ubicación obtenida', 
        `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`)
    }
  }

  const handleRequestCamera = async () => {
    const stream = await actions.requestCamera()
    if (stream) {
      setCameraStream(stream)
      actions.showNotification('Cámara accesible', 'Permisos de cámara concedidos')
    }
  }

  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 30, 100, 30, 100])
      actions.showNotification('Vibración activada', 'El dispositivo está vibrando')
    } else {
      actions.showNotification('Vibración no soportada', 'Este dispositivo no soporta vibración')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'React PWA',
          text: 'Mira esta increíble Progressive Web App',
          url: window.location.origin
        })
        actions.showNotification('Compartido', 'Contenido compartido exitosamente')
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin)
      actions.showNotification('Enlace copiado', 'El enlace se copió al portapapeles')
    }
  }

  return (
    <div className="page">
      <Navigation />
      
      <main className="container">
        <section className="page-header">
          <h1>📱 Funciones del Dispositivo</h1>
          <p>Prueba las capacidades nativas de tu dispositivo</p>
          <Link to="/" className="back-btn">← Volver al inicio</Link>
        </section>

        <section className="device-features">
          <div className="feature-section card">
            <h2>🌍 Geolocalización</h2>
            <p>Estado: <span className={`status ${state.deviceFeatures.geolocation}`}>
              {state.deviceFeatures.geolocation}
            </span></p>
            {locationData && (
              <div className="location-data">
                <p><strong>Latitud:</strong> {locationData.latitude.toFixed(6)}</p>
                <p><strong>Longitud:</strong> {locationData.longitude.toFixed(6)}</p>
                <p><strong>Precisión:</strong> {locationData.accuracy}m</p>
              </div>
            )}
            <button onClick={handleRequestLocation} className="btn">
              📍 Obtener ubicación
            </button>
          </div>

          <div className="feature-section card">
            <h2>📹 Cámara</h2>
            <p>Estado: <span className={`status ${state.deviceFeatures.camera}`}>
              {state.deviceFeatures.camera}
            </span></p>
            <button onClick={handleRequestCamera} className="btn">
              📷 Acceder a cámara
            </button>
          </div>

          <div className="feature-section card">
            <h2>📳 Vibración</h2>
            <p>Prueba la función de vibración del dispositivo</p>
            <button onClick={handleVibrate} className="btn">
              📳 Vibrar
            </button>
          </div>

          <div className="feature-section card">
            <h2>🔋 Batería</h2>
            {batteryInfo ? (
              <div className="battery-info">
                <p><strong>Nivel:</strong> {batteryInfo.level}%</p>
                <p><strong>Estado:</strong> {batteryInfo.charging ? '🔌 Cargando' : '🔋 En uso'}</p>
                <div className="battery-indicator">
                  <div 
                    className="battery-level" 
                    style={{ width: `${batteryInfo.level}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p>Información de batería no disponible</p>
            )}
          </div>

          <div className="feature-section card">
            <h2>🚀 Compartir</h2>
            <p>Usa la API nativa de compartir del dispositivo</p>
            <button onClick={handleShare} className="btn">
              🔗 Compartir app
            </button>
          </div>

          {motionData && (
            <div className="feature-section card">
              <h2>📱 Sensores de movimiento</h2>
              <div className="motion-data">
                <p><strong>Aceleración X:</strong> {motionData.acceleration?.x?.toFixed(2) || 'N/A'}</p>
                <p><strong>Aceleración Y:</strong> {motionData.acceleration?.y?.toFixed(2) || 'N/A'}</p>
                <p><strong>Aceleración Z:</strong> {motionData.acceleration?.z?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default DeviceFeaturesPage