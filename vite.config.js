import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'React PWA Application',
        short_name: 'ReactPWA',
        description: 'Progressive Web App con React y Vite',
        theme_color: '#667eea',
        background_color: '#667eea',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ],
        screenshots: [
          {
            "src": "/screenshot-wide.png",
            "sizes": "1280x720",
            "type": "image/png",
            "form_factor": "wide",
            "label": "Vista principal de la aplicación"
          },
          {
            "src": "/screenshot-mobile.png",
            "sizes": "750x1334",
            "type": "image/png",
            "form_factor": "narrow",
            "label": "Vista móvil de la aplicación"
          }
        ],
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            "name": "Datos offline",
            "short_name": "Offline",
            "description": "Acceder a datos guardados localmente",
            "url": "/offline",
            "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
          },
          {
            "name": "Funciones del dispositivo",
            "short_name": "Hardware",
            "description": "Probar funciones del hardware",
            "url": "/device",
            "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})