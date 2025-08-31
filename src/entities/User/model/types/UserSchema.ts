export type UserStatus = 'idle' | 'online' | 'offline';

export interface UserModel {
  id: number;
  username: string;
  avatar?: string;
  
  status?: UserStatus;
}
