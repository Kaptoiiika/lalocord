module.exports = (componentName) => `import { memo } from "react"
import { classNames } from "shared/lib/classNames/classNames"
import styles from "./${componentName}.module.scss"

type ${componentName}Props = {
  className?: string
}

export const ${componentName} = memo((props: ${componentName}Props) => {
  const { className } = props

  return <div className={classNames([styles.${componentName}, className])}>
      
  </div>
})
`;
