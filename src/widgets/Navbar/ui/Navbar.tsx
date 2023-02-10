import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import { IconButton, Paper } from "@mui/material"
import { Stack } from "@mui/system"
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
    <Paper square className={styles.NavbarContainer}>
      <Stack
        className={styles.stack}
        justifyContent="space-between"
        spacing={4}
      >
        <Stack alignItems="center" spacing={1}>
          {links.map((link) => (
            <Link key={link.to} to={link.to} aria-label={link.label}>
              <IconButton>{link.icon}</IconButton>
            </Link>
          ))}
        </Stack>

        <div>xs=8</div>
      </Stack>
    </Paper>
  )
}
