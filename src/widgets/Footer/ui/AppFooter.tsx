import styles from "./AppFooter.module.scss"
import MUILink from "@mui/material/Link/Link"
import Typography from "@mui/material/Typography"
import { useState } from "react"

type AppFooterProps = {}

export const AppFooter = (props: AppFooterProps) => {
  const {} = props
  const [buildVersionIsDate, setBuildVersion] = useState(false)

  const handleChangeVersion = () => {
    setBuildVersion((prev) => !prev)
  }

  return (
    <footer className={styles.footer}>
      <div>
        <Typography variant="h6">Contact</Typography>
        <ul>
          <MUILink href="mailto:nikita.ozhegov8@mail.ru">
            nikita.ozhegov8@mail.ru
          </MUILink>
        </ul>
      </div>
      <div onClick={handleChangeVersion}>
        <Typography variant="h6">Build version</Typography>
        <Typography align="right">
          {buildVersionIsDate ? __BUILD_DATE_VERSION__ : __BUILD_VERSION__}
        </Typography>
      </div>
    </footer>
  )
}
