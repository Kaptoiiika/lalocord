export type UserStatus = 'idle' | 'online' | 'offline';

export interface UserModel {
  id: string;
  username: string;
  avatarSrc?: string;
  
  status?: UserStatus;
}
