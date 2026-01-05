import { useState } from 'react'

import { Link as MUILink, Typography, useMediaQuery } from '@mui/material'

import styles from './AppFooter.module.scss'

export const AppFooter = () => {
  const [buildVersionIsDate, setBuildVersion] = useState(false)
  const isSmallScreen = useMediaQuery('(max-width:385px)')

  const handleChangeVersion = () => {
    setBuildVersion((prev) => !prev)
  }

  return (
    <footer className={styles.footer}>
      <div>
        <Typography variant="h6">Contact</Typography>
        <ul>
          <MUILink href="mailto:nikita.ozhegov8@mail.ru">nikita.ozhegov8@mail.ru</MUILink>
        </ul>
      </div>
      <div onClick={handleChangeVersion}>
        <Typography variant="h6">Build version</Typography>
        <Typography align={isSmallScreen ? 'left' : 'right'}>
          {buildVersionIsDate ? __BUILD_DATE_VERSION__ : __BUILD_VERSION__}
        </Typography>
      </div>
    </footer>
  )
}
