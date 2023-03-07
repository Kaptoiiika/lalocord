import { memo } from "react"
import { useTheme } from "@/shared/lib/hooks/useTheme/useTheme"
import { IconButton } from "@mui/material"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"

export const ThemeSwitcher = memo(function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <IconButton onClick={toggleTheme} aria-label="change theme">
      {theme === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  )
})