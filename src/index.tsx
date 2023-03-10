import React from "react"
import { createRoot } from "react-dom/client"
import { StoreProvider } from "@/app/providers/StoreProvider"
import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { AppRouterProvider } from "@/app/providers/Router"
import "@/app/styles/index.scss"
import App from "./app/App"
import { ErrorBoundary } from "./shared/ui/ErrorBoundary"

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
    <StoreProvider>
      <AppRouterProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AppRouterProvider>
    </StoreProvider>
  </ErrorBoundary>
  // </React.StrictMode>
)

__webpack_nonce__ = "<%=nonce%>"
navigator.serviceWorker?.register("/service-worker.js")
