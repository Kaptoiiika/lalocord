import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import { IconButton } from "@mui/material"
import { Stack } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home"
import styles from "./Navbar.module.scss"
import { ThemeSwitcher } from "@/features/ThemeSwitcher"
import { Link } from "@/shared/ui/Link/Link"
// import { UserSettingsModal } from "@/entities/UserSettings"

// const links = [
//   {
//     to: AppRoutes.MAIN_PAGE,
//     label: "home",
//     icon: <HomeIcon />,
//   },
// ]

export const Navbar = () => {
  return (
    <nav className={styles.NavbarContainer}>
      <Stack
        className={styles.stack}
        justifyContent="space-between"
        alignItems="center"
        gap={4}
      >
        <Stack alignItems="center" gap={1}>
          <Link className={styles.headerLink} to={AppRoutes.MAIN_PAGE}>
            <IconButton aria-label="home page">
              <HomeIcon />
            </IconButton>
          </Link>
        </Stack>

        <Stack>
          {/* <UserSettingsModal /> */}
          <ThemeSwitcher />
        </Stack>
      </Stack>
    </nav>
  )
}
