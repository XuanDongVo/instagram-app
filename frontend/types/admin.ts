export type AdminUser = {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  role?: string;
};

export type UpdateUserRolePayload = {
  role: "USER" | "ADMIN";
};