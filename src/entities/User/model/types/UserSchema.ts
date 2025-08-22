export interface UserSchema {
  localUser: UserModel;
  setLocalUsername: (value: string) => void;
  setLocalAvatar: (src: string) => void;
}

export interface UserModel {
  id: string;
  username: string;
  avatarSrc?: string;
}
