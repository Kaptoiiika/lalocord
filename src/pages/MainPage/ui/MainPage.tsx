import { VirtualWindow, VirtualWindowContainer } from "@/features/VirtualWindow"
import { PageWrapper } from "@/widgets/Page"
import { Paper } from "@mui/material"

import icon from "@/shared/assets/icons/DefaultAudioIcon.png"

export const MainPage = () => {
  return (
    <PageWrapper>
      <VirtualWindowContainer>
        <VirtualWindow>
          <img style={{ width: "100%", height: "100%" }} src={icon}></img>
        </VirtualWindow>

        <VirtualWindow>
          Minim sunt exercitation fugiat occaecat fugiat tempor sunt ipsum
          officia laboris eiusmod.
        </VirtualWindow>
      </VirtualWindowContainer>
    </PageWrapper>
  )
}
