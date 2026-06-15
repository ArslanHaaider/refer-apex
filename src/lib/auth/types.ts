export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
};
