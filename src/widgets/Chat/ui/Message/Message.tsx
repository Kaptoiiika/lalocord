import { Link, Typography } from "@mui/material"
import Linkify from "react-linkify"
import styles from "./Message.module.scss"

type MessageProps = {
  message: string
  className?: string
}

function checkURLisImageLink(url: string) {
  return (
    url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null
  )
}

export const Message = (props: MessageProps) => {
  const { message, className } = props

  return (
    <Typography component="p" className={className}>
      <Linkify
        componentDecorator={(href, text, key) => {
          if (checkURLisImageLink(href))
            return <img alt="" src={href} className={styles.image} />

          return (
            <Link key={key} href={href} target="_blank" rel="noreferrer">
              {text}
            </Link>
          )
        }}
      >
        {message}
      </Linkify>
    </Typography>
  )
}
