import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { authByUsernameSliceReducer } from "@/features/AuthByUsername/model/slice/AuthByUsernameSlice"
import { getAuthData } from "@/entities/User"
import { LoginForm } from "../LoginForm/LoginForm"
import { RegistrationForm } from "../RegistrationForm/RegistrationForm"
import styles from "./AuthorizationByUsername.module.scss"
import { useDynamicModuleLoader } from "@/shared/lib/useDynamicModuleLoader/useDynamicModuleLoader"
import { Button, Paper } from "@mui/material"
import { AppRoutes } from "@/shared/config/routeConfig/routeConfig"

export const AuthorizationByUsername = () => {
  useDynamicModuleLoader({
    reducers: { authByUsername: authByUsernameSliceReducer },
  })
  const authData = useSelector(getAuthData)
  const navigate = useNavigate()
  const [isLoginSelect, selIsLoginSelect] = useState(true)

  const hundleSelectLogin = useCallback(() => {
    selIsLoginSelect(true)
  }, [])

  const hundleSelectRegistration = useCallback(() => {
    selIsLoginSelect(false)
  }, [])

  useEffect(() => {
    if (authData) navigate(AppRoutes.PROFILE)
  }, [authData, navigate])

  return (
    <Paper className={styles.AuthorizationByUsername}>
      <div className={styles.selectTypeAuth}>
        <Button onClick={hundleSelectRegistration}>Registration</Button>
        <Button onClick={hundleSelectLogin}>Login</Button>
      </div>
      <div className={styles.content}>
        {isLoginSelect ? <LoginForm /> : <RegistrationForm />}
      </div>
    </Paper>
  )
}
