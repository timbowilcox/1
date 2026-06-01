import api from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { UserDTO } from "./auth.dto";
import { LoginDTO, RegisterDTO } from "shared";

export const loginApi = async (data: LoginDTO) =>
  fetcher<UserDTO>(api.post("/api/auth/login", data));

export const registerApi = async (data: RegisterDTO) =>
  fetcher<UserDTO>(api.post("/api/auth/register", data));

export const logoutApi = async () =>
  fetcher<null>(api.post("/api/auth/logout"));

export const meApi = async () => {
  const response = await api.get("/api/auth/me", {
    ignore401: true,
  } as any);

  return response.data;
};

export const forgotPasswordApi = async (email: string) =>
  fetcher<{ ok: boolean }>(api.post("/api/auth/forgot-password", { email }));

export const resetPasswordApi = async (data: { token: string; password: string }) =>
  fetcher<{ ok: boolean }>(api.post("/api/auth/reset-password", data));

export const verifyEmailApi = async (token: string) =>
  fetcher<{ verified: boolean }>(
    api.post("/api/auth/verify-email", { token }, { ignore401: true } as any),
  );

export const resendVerificationApi = async () =>
  fetcher<{ sent: boolean }>(api.post("/api/auth/resend-verification"));
