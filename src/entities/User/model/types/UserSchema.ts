export type UserStatus = 'idle' | 'online' | 'offline';

export interface UserModel {
  id: number;
  username: string;
  avatarSrc?: string;
  
  status?: UserStatus;
}
