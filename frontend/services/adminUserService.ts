import { ApiService, ApiResponse } from "./api";
import { AdminUser, UpdateUserRolePayload } from "../types/admin";

function unwrap<T>(res: any): T {
  return res && typeof res === "object" && "data" in res ? (res.data as T) : (res as T);
}

const API_URL = "/v1/admin/users";


const getAllUsers = async (): Promise<AdminUser[]> => {
  const res = await ApiService.get<ApiResponse<AdminUser[]>>(API_URL);
  return unwrap<AdminUser[]>(res) || [];
};

const updateUserRole = async (id: string, role: "USER" | "ADMIN"): Promise<AdminUser> => {
  const body: UpdateUserRolePayload = { role };
  const res = await ApiService.put<ApiResponse<AdminUser>>(`${API_URL}/${id}/role`, body);
  return unwrap<AdminUser>(res);
};

const deleteUser = async (id: string): Promise<void> => {
  await ApiService.delete<ApiResponse<void>>(`${API_URL}/${id}`, null);
};


export const adminUserService = {
  getAllUsers,
  updateUserRole,
  deleteUser,
};
