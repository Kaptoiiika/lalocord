import {
  Button,
  CircularProgress,
  Dialog,
  Grow,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material"
import { Suspense } from "react"
import { UserSettingsLazy } from "../UserSettings/UserSettings.lazy"
import SettingsIcon from "@mui/icons-material/Settings"
import { useSearchParams } from "react-router-dom"

type UserSettingsmodalProps = {}

const settingkey = "setting"
export const UserSettingsModal = (props: UserSettingsmodalProps) => {
  const {} = props
  const [search, setSearch] = useSearchParams()

  const handleOpenSettings = () => {
    setSearch((prev) => {
      const params = Object.fromEntries(prev)
      params[settingkey] = "true"
      return { ...params }
    })
  }

  const handleCloseSettings = () => {
    setSearch((prev) => {
      const params = Object.fromEntries(prev)
      delete params[settingkey]
      return { ...params }
    })
  }

  const open = !!search.get(settingkey)

  return (
    <>
      <Tooltip title={"Settings"} describeChild placement="right-start">
        <IconButton onClick={handleOpenSettings} aria-label="app settigns">
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        fullScreen
        open={open}
        TransitionComponent={Grow}
        TransitionProps={{ style: { transformOrigin: "0 0" } }}
        onClose={handleCloseSettings}
        PaperProps={{
          style: { background: "var(--bg-app)" },
        }}
      >
        <Suspense
          fallback={
            <Stack alignItems="center" justifyContent="center">
              <Button onClick={handleCloseSettings}>Close</Button>
              <CircularProgress />
            </Stack>
          }
        >
          <UserSettingsLazy onClose={handleCloseSettings} />
        </Suspense>
      </Dialog>
    </>
  )
}
