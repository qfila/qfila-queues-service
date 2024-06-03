export enum UserRole {
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export class User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  role: UserRole;
}
