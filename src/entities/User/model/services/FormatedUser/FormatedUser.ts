import { FormateAtributesFile } from "@/shared/lib/formaters/FormateAtributesFile/FormateAtributesFile"
import { UserModel } from "../../types/userSchema"

export const FormateAtributedUser = (user: any): UserModel => {
  return {
    id: user.id,
    username: user.attributes.username,
    email: user.attributes.email,
    avatar: user.attributes.avatar?.data
      ? FormateAtributesFile(user.attributes.avatar.data)
      : undefined,
  }
}
