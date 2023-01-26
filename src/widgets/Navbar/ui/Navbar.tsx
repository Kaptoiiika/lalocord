import { Paper } from "@mui/material"
import { Stack } from "@mui/system"
import styles from "./Navbar.module.scss"

export const Navbar = () => {
  return (
    <Paper square className={styles.NavbarContainer}>
      <Stack
        className={styles.stack}
        justifyContent="space-between"
        spacing={4}
      >
        <Stack spacing={2}>
          <div>xs=8</div>
          <div>xs=8</div>
          <div>xs=8</div>
          <div>xs=8</div>
        </Stack>

        <div>xs=8</div>
      </Stack>
    </Paper>
  )
}
