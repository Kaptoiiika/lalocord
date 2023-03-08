import {
  CircularProgress,
  Dialog,
  Grow,
  IconButton,
  Tooltip,
} from "@mui/material"
import { forwardRef, Suspense } from "react"
import { UserSettingsLazy } from "../UserSettings/UserSettings.lazy"
import SettingsIcon from "@mui/icons-material/Settings"
import { useSearchParams } from "react-router-dom"
import { TransitionProps } from "@mui/material/transitions"

type UserSettingsmodalProps = {}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return (
    <Grow style={{ transformOrigin: "0 0" }} ref={ref} {...props}>
      {props.children}
    </Grow>
  )
})

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
        TransitionComponent={Transition}
        onClose={handleCloseSettings}
        PaperProps={{
          style: { background: "var(--bg-app)" },
        }}
      >
        <Suspense fallback={<CircularProgress />}>
          <UserSettingsLazy onClose={handleCloseSettings} />
        </Suspense>
      </Dialog>
    </>
  )
}
