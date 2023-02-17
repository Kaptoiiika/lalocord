import { ChangeEvent, useCallback } from "react"
import { useSelector } from "react-redux"
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch/useAppDispatch"
import { getAuthByUsernameState } from "../../model/selectors/getAuthByUsernameState/getAuthByUsernameState"
import { loginByUsernameOrEmail } from "../../model/services/loginByUsernameOrEmail/loginByUsernameOrEmail"
import { authByUsernameSliceActions } from "../../model/slice/AuthByUsernameSlice"
import styles from "./LoginForm.module.scss"
import { Button, TextField, Typography } from "@mui/material"

export const LoginForm = () => {
  const { identifier, password, loginError, isloading } = useSelector(
    getAuthByUsernameState
  )
  const dispatch = useAppDispatch()

  const changeIdentifier = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(authByUsernameSliceActions.setIdentifier(e.currentTarget.value))
    },
    [dispatch]
  )

  const changePassword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(authByUsernameSliceActions.setPassword(e.currentTarget.value))
    },
    [dispatch]
  )

  const hundleLogin = () => {
    dispatch(loginByUsernameOrEmail({ password, identifier }))
  }

  return (
    <form className={styles.LoginForm}>
      <TextField
        onChange={changeIdentifier}
        label={"Username or email"}
        type="email"
        value={identifier}
      />
      <TextField
        onChange={changePassword}
        label={"Password"}
        type="password"
        value={password}
      />
      {!!loginError && <Typography>{loginError}</Typography>}
      <Button variant="contained" onClick={hundleLogin} disabled={isloading}>
        Login
      </Button>
    </form>
  )
}
