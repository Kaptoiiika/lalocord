import { ChangeEvent, useCallback } from "react"
import { useSelector } from "react-redux"
import { registrationByUsername } from "@/features/AuthByUsername/model/services/registrationByUsernameAndEmail/registrationByUsernameAndEmail"
import { authByUsernameSliceActions } from "@/features/AuthByUsername/model/slice/AuthByUsernameSlice"
import { useAppDispatch } from "@/shared/lib/hooks/useAppDispatch/useAppDispatch"
import { getAuthByUsernameState } from "../../model/selectors/getAuthByUsernameState/getAuthByUsernameState"
import styles from "./RegistrationFrom.module.scss"
import { Button, TextField, Typography } from "@mui/material"

export const RegistrationForm = () => {
  const { username, email, password, registrationError, isloading } =
    useSelector(getAuthByUsernameState)
  const dispatch = useAppDispatch()

  const changeUsername = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(authByUsernameSliceActions.setUsername(e.currentTarget.value))
    },
    [dispatch]
  )

  const changePassword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(authByUsernameSliceActions.setPassword(e.currentTarget.value))
    },
    [dispatch]
  )

  const changeEmail = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(authByUsernameSliceActions.setEmail(e.currentTarget.value))
    },
    [dispatch]
  )

  const hundleRegistration = () => {
    dispatch(registrationByUsername({ password, username, email: email || "" }))
  }

  return (
    <form className={styles.RegistrationForm}>
      <TextField
        onChange={changeUsername}
        label="Username"
        type="name"
        value={username}
      />
      <TextField
        onChange={changeEmail}
        label="Email"
        type="email"
        value={email}
      />
      <TextField
        onChange={changePassword}
        label="Password"
        type="password"
        value={password}
      />
      {!!registrationError && <Typography>{registrationError}</Typography>}
      <Button
        variant="contained"
        disabled={isloading}
        onClick={hundleRegistration}
      >
        Registration
      </Button>
    </form>
  )
}
