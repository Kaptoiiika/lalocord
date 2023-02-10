import styles from "./Test3dPage.module.scss"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef, useState } from "react"

type Test3dPageProps = {}
export const CanvasComponent = (props: Test3dPageProps) => {
  const {} = props

  const ref = useRef<THREE.Mesh>(null)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (ref.current) return (ref.current.rotation.x += delta)
  })

  return (
    <>
      <ambientLight />
      <mesh
        ref={ref}
        scale={clicked ? 1.5 : 1}
        onClick={() => click(!clicked)}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
      </mesh>
    </>
  )
}

export const Test3dPage = () => {
  return (
    <div className={styles.Test3dPage}>
      <Canvas>
        <CanvasComponent />
      </Canvas>
    </div>
  )
}
