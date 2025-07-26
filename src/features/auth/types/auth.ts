export type User = {
  id: string;
  name: string;
  email: string;
  oncApiToken: string | null;
};

export type Role = 'User' | 'Admin';

export type AuthResponse = {
  jwt: string;
  roles: Role[];
  user: User;
};
