import { PageWrapper } from "@/widgets/Page"

import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"

const panels = new Array(3).fill(0)

export const MainPage = () => {
  return (
    <PageWrapper>
      <StreamViewer>
        {panels.map((num, index) => (
          <div style={{ fontSize: 64 }} key={index}>
            {index}
          </div>
        ))}
      </StreamViewer>
    </PageWrapper>
  )
}
