import React from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { AppRouterProvider } from "@/app/providers/Router"
import "@/app/styles/index.scss"
import App from "./app/App"
import { ErrorBoundary } from "./shared/ui/ErrorBoundary"
import { ContextMenuProvider } from "./app/providers/ContextMenuProvider"

const container = document.getElementById("root")

if (!container) {
  throw new Error(
    "Контейнер root не найден. Не удалось вмонтировать реакт приложение"
  )
}

const root = createRoot(container)

root.render(
  // <React.StrictMode>
  <ErrorBoundary>
    <AppRouterProvider>
      <ThemeProvider>
        <ContextMenuProvider>
          <App />
        </ContextMenuProvider>
      </ThemeProvider>
    </AppRouterProvider>
  </ErrorBoundary>
  // </React.StrictMode>
)

if (__IS_ELECTRON__ === false) {
  navigator.serviceWorker?.register("/service-worker.js")
}
