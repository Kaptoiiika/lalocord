import { useState } from 'react'

import { useMediaQuery } from 'src/shared/lib/hooks/useMediaQuery/useMediaQuery'
import { TextLink } from 'src/shared/ui'

export const AppFooter = () => {
  const [buildVersionIsDate, setBuildVersion] = useState(false)
  const isSmallScreen = useMediaQuery('(max-width:385px)')

  const handleChangeVersion = () => {
    setBuildVersion((prev) => !prev)
  }

  const versionAlignClassName = isSmallScreen ? 'text-left' : 'text-right'

  return (
    <footer className="bg-background flex justify-between p-2 [border-top:var(--box-border)] max-[385px]:flex-col max-[385px]:items-start">
      <div>
        <h2 className="text-lg font-semibold">Contact</h2>
        <ul>
          <li>
            <TextLink href="mailto:nikita.ozhegov8@mail.ru">nikita.ozhegov8@mail.ru</TextLink>
          </li>
        </ul>
      </div>
      <div onClick={handleChangeVersion}>
        <h2 className="text-lg font-semibold">Build version</h2>
        <p className={versionAlignClassName}>{buildVersionIsDate ? __BUILD_DATE_VERSION__ : __BUILD_VERSION__}</p>
      </div>
    </footer>
  )
}
