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

type TypeObject = {
  price: string
}
type ActionType = "rating" | "price" | "energy"

export const Message = (props: MessageProps) => {
  const { message, className } = props

  const fn = (field: ActionType) => {}
  const myobject: TypeObject = {
    price: "brat",
  }
  Object.entries(myobject).forEach(([key, value] ) => {
    fn(key as keyof typeof myobject)
  })

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
