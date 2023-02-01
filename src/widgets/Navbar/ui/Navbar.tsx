import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"
import { IconButton, Paper } from "@mui/material"
import { Stack } from "@mui/system"
import { Link } from "react-router-dom"
import HomeIcon from "@mui/icons-material/Home"
import styles from "./Navbar.module.scss"

export const Navbar = () => {
  return (
    <Paper square className={styles.NavbarContainer}>
      <Stack
        className={styles.stack}
        justifyContent="space-between"
        spacing={4}
      >
        <Stack alignItems="center" spacing={2}>
          <Link to={AppRoutes.INDEX} aria-label="home">
            <IconButton>
              <HomeIcon />
            </IconButton>
          </Link>
        </Stack>

        <div>xs=8</div>
      </Stack>
    </Paper>
  )
}
