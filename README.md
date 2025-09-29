# Progressive Web App con React + Vite

Esta PWA implementa a buen nivel las funcionalidades asociadas a una PWA mostrando lo que se puede logar e implementar desde ellas e incluso desde mi perspectiva personal si lo combinas con buen background en conocimientos de servicios se pueden hacer aplicaciones complejas y para una disponibilidad bastante buena trabajando con bases de datos locales y sincronizaciones remotas.

# Acceso a la aplicacion
Visita https://anaya-pwa.vercel.app/ para ver la aplicacion en vivo

## 🚀 Características Desarrolladas

### ✅ Pantallas de Splash y Home
- **Splash Screen**: Animación de carga con logo y transición suave
- **Home Screen**: Pantalla principal con navegación y funcionalidades principales
- **Diseño responsivo**: Optimizado para móviles y desktop

### ✅ Renderizado Híbrido (SSR/CSR)
- **Client-Side Rendering**: Contenido dinámico e interactivo
- **Server-Side Rendering**: Pre-renderizado para SEO y carga rápida
- **Hidratación**: Combinación de ambos enfoques
- **React Router**: Navegación del lado del cliente

### ✅ Gestión de Datos Completa
- **Datos Locales**: LocalStorage para persistencia offline
- **Datos Remotos**: API calls con manejo de errores
- **Datos Offline**: Cache con Service Worker
- **Sincronización**: Automática cuando hay conexión
- **Estrategias de Cache**: Network First, Cache First, Stale While Revalidate

### ✅ Sistema de Notificaciones
- **Push Notifications**: Notificaciones nativas del navegador
- **Permisos**: Gestión de permisos de notificación
- **Background Sync**: Sincronización en segundo plano
- **Notificaciones Interactivas**: Con acciones personalizadas

### ✅ Funciones del Hardware
- **Geolocalización**: Obtención de coordenadas GPS
- **Cámara**: Acceso a la cámara del dispositivo
- **Sensores**: Acelerómetro y giroscopio
- **Vibración**: Vibración del dispositivo
- **Batería**: Estado y nivel de batería
- **Compartir**: API nativa de compartir

## 📦 Instalación y Configuración

### 1. Ejecutar el proyecto
```
npm install

npm run dev
```

### 2. Estructura de archivos
```
src/
├── components/
│   ├── SplashScreen.jsx
│   ├── Navigation.jsx
│   ├── DataManager.jsx
│   └── NotificationManager.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── OfflinePage.jsx
│   └── DeviceFeaturesPage.jsx
├── context/
│   └── PWAContext.jsx
├── App.jsx
├── main.jsx
└── index.css

public/
├── sw.js
├── manifest.json
├── pwa-192x192.png
├── pwa-512x512.png
└── index.html
```

### 3. Comandos de desarrollo y producción
```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Despliegue (Vercel)
npm run deploy
```

## 🛠️ Configuraciones de PWA implementadas

### Service Worker Personalizado
El Service Worker incluye:
- Cache de recursos estáticos
- Estrategias de cache dinámicas
- Background sync
- Push notifications
- Actualización automática

### Manifest.json
Configuración completa para PWA:
- Iconos adaptativos
- Pantalla de inicio personalizada
- Tema y colores
- Atajos de aplicación
- Screenshots para tiendas

### Estrategias de Cache
1. **Network First**: Para datos dinámicos (APIs)
2. **Cache First**: Para recursos estáticos (CSS, JS, imágenes)
3. **Stale While Revalidate**: Para HTML y contenido semi-dinámico

## 🌐 Funcionalidades Implementadas

### 1. Pantalla de Splash
- Animación de carga con logo
- Duración personalizable (3 segundos por defecto)
- Transición suave a la aplicación principal
- Indicador de carga con puntos animados

### 2. Gestión de Estado Global
Context API para manejar:
- Estado de conexión (online/offline)
- Permisos de notificaciones
- Estado de funciones del dispositivo
- Datos locales, remotos y en caché
- Estados de carga y errores

### 3. Páginas Principales

#### HomePage
- Vista general de funcionalidades
- Estado de conexión en tiempo real
- Botón de instalación PWA
- Acceso rápido a todas las funciones

#### OfflinePage
- Gestión de datos locales
- Formulario para agregar elementos
- Sincronización con servidor
- Indicadores de estado de sincronización

#### DeviceFeaturesPage
- Prueba de geolocalización
- Acceso a cámara
- Vibración del dispositivo
- Estado de batería
- Compartir nativo
- Sensores de movimiento

### 4. Componentes Reutilizables

#### Navigation
- Barra de navegación fija
- Indicador de conexión
- Botones de acción rápida

#### DataManager
- Carga de datos remotos
- Manejo de datos en caché
- Estados de carga
- Fallback a datos offline

#### NotificationManager
- Solicitud de permisos
- Envío de notificaciones de prueba
- Estados visuales de permisos

## 📱 Funciones Nativas implementadas

### Geolocalización
```javascript
const position = await actions.requestGeolocation()
// Obtiene latitud, longitud y precisión
```

### Cámara
```javascript
const stream = await actions.requestCamera()
// Acceso a la cámara del dispositivo
```

### Notificaciones
```javascript
actions.showNotification('Título', {
  body: 'Descripción',
  icon: '/pwa-192x192.png',
  actions: [...]
})
```

### Vibración
```javascript
navigator.vibrate([100, 30, 100, 30, 100])
// Patrón de vibración personalizado
```

### Batería
```javascript
const battery = await navigator.getBattery()
// Nivel y estado de carga
```

### Compartir
```javascript
await navigator.share({
  title: 'Título',
  text: 'Descripción',
  url: 'https://example.com'
})
```

## 🔄 Gestión de Datos Offline

### LocalStorage
- Datos persistentes offline
- Sincronización pendiente
- Estados de modificación

### Service Worker Cache
- Cache de respuestas API
- Estrategias dinámicas (cache-first)
- Expiración automática

## 🔔 Sistema de Notificaciones

### Push Notifications
```javascript
// Solicitar permisos
await Notification.requestPermission()

// Mostrar notificación
new Notification('Título', {
  body: 'Mensaje',
  icon: '/icon.png',
  badge: '/badge.png',
  actions: [
    { action: 'view', title: 'Ver' },
    { action: 'dismiss', title: 'Cerrar' }
  ]
})
```

### Background Sync
```javascript
// Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData())
  }
})
```

## 🎨 Diseño y UX

### Glassmorphism
- Fondos translúcidos
- Efectos de desenfoque
- Bordes suaves
- Sombras modernas

### Responsive Design
- Mobile first
- Breakpoints optimizados
- Navegación táctil
- Componentes adaptativos

### Animaciones
- Transiciones suaves
- Efectos hover
- Estados de carga
- Micro-interacciones

## 🚀 Optimizaciones

### Performance
- Code splitting
- Lazy loading
- Resource hints
- Critical CSS

### SEO
- Meta tags
- Open Graph
- Structured data
- Sitemap

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

## 📋 Pruebas de funcionamiento (evidencia)
- Notificaciones nativas del dispositivo
![alt text](<evidence/Screenshot 2025-09-29 010749.png>)
![alt text](<evidence/image.png>)

- Compartir nativo
![alt text](<evidence/Screenshot 2025-09-29 020727.png>)

- Funcionalidades de hardware
![alt text](<evidence/Battery.png>)
![alt text](<evidence/Screenshot 2025-09-29 025242.png>)


## 📚 Recursos Adicionales

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🏆 Conclusión

Esta PWA implementa todas las características modernas requeridas:

✅ **Splash Screen**: Experiencia de carga profesional
- ✅ **Renderizado Híbrido**: SSR + CSR optimizado
- ✅ **Datos Offline**: Gestión completa de datos
- ✅ **Notificaciones**: Sistema push nativo
- ✅ **Hardware**: Acceso a funciones del dispositivo
- ✅ **Performance**: Optimizada para producción
- ✅ **UX**: Interfaz moderna y responsiva
