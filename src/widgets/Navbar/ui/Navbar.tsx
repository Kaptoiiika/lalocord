import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import { IconButton } from "@mui/material"
import { Stack } from "@mui/material"
import { Link } from "react-router-dom"
import HomeIcon from "@mui/icons-material/Home"
import styles from "./Navbar.module.scss"
import { ThemeSwitcher } from "@/features/ThemeSwitcher"

const links = [
  {
    to: AppRoutes.MAIN_PAGE,
    label: "home",
    icon: <HomeIcon />,
  },
]

export const Navbar = () => {
  return (
    <nav className={styles.NavbarContainer}>
      <Stack
        className={styles.stack}
        justifyContent="space-between"
        alignItems="center"
        spacing={4}
      >
        <Stack alignItems="center" spacing={1}>
          <Link className={styles.headerLink} to={AppRoutes.MAIN_PAGE}>
            <IconButton aria-label="home">
              <HomeIcon />
            </IconButton>
          </Link>
        </Stack>

        <ThemeSwitcher />
      </Stack>
    </nav>
  )
}
