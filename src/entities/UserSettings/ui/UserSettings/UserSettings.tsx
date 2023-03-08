import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./UserSettings.module.scss"
import { PropsWithChildren, ReactNode, useState } from "react"
import { Broadcasting } from "../Broadcasting/Broadcasting"

type UserSettingsProps = {
  onClose?: () => void
}

type TabPanelProps = {
  index: number
  value: number
} & PropsWithChildren
function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props

  if (value !== index) return <></>

  return <div className={styles.panel}>{children}</div>
}

type AvailableSettings = {
  label: string
  component: ReactNode
}
const availableSettings: AvailableSettings[] = [
  { label: "broadcasting", component: <Broadcasting /> },
  { label: "text", component: <>text</> },
]

export const UserSettings = (props: UserSettingsProps) => {
  const { onClose } = props
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <div className={styles.mainWrapper}>
      <AppBar className={styles.header} position="static">
        <Toolbar className={styles.wrapper} variant="dense">
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Settings
          </Typography>
          {onClose && (
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <div className={styles.wrapper}>
        <div className={styles.container}>
          <Tabs
            className={styles.tabs}
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            {availableSettings.map((tab, index) => (
              <Tab className={styles.tab} key={index} label={tab.label} />
            ))}
          </Tabs>
          {availableSettings.map((tab, index) => (
            <TabPanel key={index} value={value} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </div>
      </div>
    </div>
  )
}
