import React from 'react'
import { createRoot } from 'react-dom/client'

import { AppRouterProvider } from 'src/app/providers/Router'
import { ThemeProvider } from 'src/app/providers/ThemeProvider'

import App from './app/App'
import { DebugModeProvider } from './shared/lib/hooks/useDebugMode/useDebugModeProvider'
import { ErrorBoundary } from './shared/ui/ErrorBoundary'

import 'src/app/styles/index.scss'

if (window.electron) {
  import('electron/renderer/electronInit').then(({ initElectron }) => {
    initElectron()
  })
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Контейнер root не найден. Не удалось вмонтировать реакт приложение')
}

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ErrorBoundary errorText="App is down">
      <AppRouterProvider>
        <ThemeProvider>
          <DebugModeProvider>
            <App />
          </DebugModeProvider>
        </ThemeProvider>
      </AppRouterProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

