import { startViewTransition } from "@/shared/lib/utils/ViewTransition/ViewTransition"
import { ComponentProps } from "react"
import { useNavigate } from "react-router-dom"

type LinkProps = { to: string } & Omit<ComponentProps<"a">, "href">

export const Link = (props: LinkProps) => {
  const { to, ...linkProps } = props
  const navigate = useNavigate()

  const handleNavigate = async (e: React.UIEvent) => {
    e.preventDefault()
    await startViewTransition()
    navigate(to)
  }

  return <a href={to} onClick={handleNavigate} {...linkProps} />
}
