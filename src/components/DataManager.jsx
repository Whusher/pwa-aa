import { useState, useEffect } from 'react'
import { usePWA } from '../context/PWAContext'

const DataManager = () => {
  const { state, actions } = usePWA()
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    // Load cached data on component mount
    actions.loadCachedData()
  }, [])

  const handleLoadRemoteData = async () => {
    setDataLoading(true)
    try {
      await actions.loadRemoteData()
    } catch (error) {
      // Fallback to cached data
      actions.loadCachedData()
    }
    setDataLoading(false)
  }

  const renderDataItems = (items, title) => (
    <div className="data-section">
      <h3>{title} ({items.length})</h3>
      {items.length === 0 ? (
        <p>No hay datos disponibles</p>
      ) : (
        <div className="data-items">
          {items.map((item, index) => (
            <div key={item.id || index} className="data-item">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <small>Actualizado: {new Date(item.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="data-manager card">
      <h2>📊 Gestión de Datos</h2>
      <div className="data-controls">
        <button 
          onClick={handleLoadRemoteData}
          disabled={dataLoading || !state.isOnline}
          className="btn btn-primary"
        >
          {dataLoading ? '🔄 Cargando...' : '🌐 Cargar datos remotos'}
        </button>
        <button 
          onClick={actions.loadCachedData}
          className="btn btn-secondary"
        >
          💾 Mostrar datos en caché
        </button>
      </div>

      {state.data.remote.length > 0 && renderDataItems(state.data.remote, 'Datos remotos')}
      {state.data.cached.length > 0 && renderDataItems(state.data.cached, 'Datos en caché')}
      {state.data.local.length > 0 && renderDataItems(state.data.local, 'Datos locales')}
    </section>
  )
}

export default DataManager