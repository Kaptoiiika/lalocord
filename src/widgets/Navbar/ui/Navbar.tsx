import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import { IconButton } from "@mui/material"
import { Stack } from "@mui/material"
import { Link } from "react-router-dom"
import HomeIcon from "@mui/icons-material/Home"
import styles from "./Navbar.module.scss"

const links = [
  {
    to: AppRoutes.INDEX,
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
        spacing={4}
      >
        <Stack alignItems="center" spacing={1}>
          <Link className={styles.headerLink} to={AppRoutes.INDEX}>
            <IconButton aria-label="home">
              <HomeIcon />
            </IconButton>
          </Link>

          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              <IconButton aria-label={link.label}>{link.icon}</IconButton>
            </Link>
          ))}
        </Stack>

        <Link className={styles.headerLink} to={AppRoutes.AUTH}>
          <IconButton aria-label="home">
            <HomeIcon />
          </IconButton>
        </Link>
      </Stack>
    </nav>
  )
}
