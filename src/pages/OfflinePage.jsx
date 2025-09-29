import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePWA } from '../context/PWAContext'
import Navigation from '../components/Navigation'

const OfflinePage = () => {
  const { state, actions } = usePWA()
  const [localData, setLocalData] = useState([])
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')

  useEffect(() => {
    const data = actions.loadLocalData()
    setLocalData(data)
  }, [])

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return

    const newItem = {
      id: Date.now(),
      title: newItemTitle,
      description: newItemDescription,
      timestamp: new Date().toISOString(),
      synced: state.isOnline
    }

    const updatedData = [...localData, newItem]
    setLocalData(updatedData)
    actions.saveLocalData(updatedData)
    
    setNewItemTitle('')
    setNewItemDescription('')
    
    actions.showNotification('Datos guardados', 'Nuevo elemento agregado localmente')
  }

  const handleSync = async () => {
    if (!state.isOnline) {
      actions.showNotification('Sin conexión', 'Conecta a internet para sincronizar')
      return
    }

    try {
      // Simulate sync with server
      await new Promise(resolve => setTimeout(resolve, 1500))
      const syncedData = localData.map(item => ({ ...item, synced: true }))
      setLocalData(syncedData)
      actions.saveLocalData(syncedData)
      actions.showNotification('Sincronización completa', 'Todos los datos se sincronizaron')
    } catch (error) {
      actions.showNotification('Error', 'No se pudo sincronizar')
    }
  }

  const handleClearData = () => {
    setLocalData([])
    actions.saveLocalData([])
    actions.showNotification('Datos eliminados', 'Todos los datos locales fueron eliminados')
  }

  return (
    <div className="page">
      <Navigation />
      
      <main className="container">
        <section className="page-header">
          <h1>💾 Gestión de Datos Offline</h1>
          <p>Administra datos locales que funcionan sin conexión a internet</p>
          <Link to="/" className="back-btn">← Volver al inicio</Link>
        </section>

        <section className="data-form card">
          <h2>Agregar nuevo elemento</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Título del elemento"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              placeholder="Descripción (opcional)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddItem} className="btn btn-primary">
              ➕ Agregar elemento
            </button>
            <button 
              onClick={handleSync} 
              className="btn btn-secondary"
              disabled={!state.isOnline}
            >
              🔄 Sincronizar ({localData.filter(item => !item.synced).length})
            </button>
            <button onClick={handleClearData} className="btn btn-danger">
              🗑️ Limpiar todo
            </button>
          </div>
        </section>

        <section className="data-list">
          <h2>Elementos guardados localmente ({localData.length})</h2>
          {localData.length === 0 ? (
            <div className="empty-state">
              <p>No hay elementos guardados localmente</p>
              <p>Agrega algunos elementos arriba para comenzar</p>
            </div>
          ) : (
            <div className="data-items">
              {localData.map((item) => (
                <div key={item.id} className="data-item">
                  <div className="data-header">
                    <h3>{item.title}</h3>
                    <span className={`sync-status ${item.synced ? 'synced' : 'pending'}`}>
                      {item.synced ? '✅' : '⏳'}
                    </span>
                  </div>
                  {item.description && <p>{item.description}</p>}
                  <div className="data-meta">
                    <small>Creado: {new Date(item.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default OfflinePage