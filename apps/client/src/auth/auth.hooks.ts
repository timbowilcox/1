"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  loginApi,
  logoutApi,
  meApi,
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
  verifyEmailApi,
  resendVerificationApi,
} from "./auth.api";
import { useAuthStore } from "./auth.store";
import { useSuccessToastStore } from "@/stores/useSuccessToastStore";
import {
  ApiError,
  ForgotPasswordSchema,
  LoginDTO,
  LoginSchema,
  RegisterDTO,
  RegisterSchema,
  ResetPasswordSchema,
  zodParseOrThrow,
} from "shared";
import { UserDTO } from "./auth.dto";
import { useEffect } from "react";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<UserDTO, ApiError | Error, LoginDTO>({
    mutationFn: async (data) => {
      zodParseOrThrow(LoginSchema, data);
      return loginApi(data);
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<UserDTO, ApiError | Error, RegisterDTO>({
    mutationFn: async (data) => {
      zodParseOrThrow(RegisterSchema, data);
      return registerApi(data);
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });
}

export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const showSuccess = useSuccessToastStore((s) => s.show);

  return async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      showSuccess("Successfully logged out");
      router.push("/");
    }
  };
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (isSuccess && data) setUser(data);
    else setUser(null);
  }, [data, isSuccess, setUser]);

  return {
    isLoading,
    user: data,
  };
}

export function useForgotPassword() {
  return useMutation<{ ok: boolean }, ApiError | Error, string>({
    mutationFn: async (email) => {
      zodParseOrThrow(ForgotPasswordSchema, { email });
      return forgotPasswordApi(email);
    },
  });
}

export function useResetPassword() {
  return useMutation<
    { ok: boolean },
    ApiError | Error,
    { token: string; password: string }
  >({
    mutationFn: async (data) => {
      zodParseOrThrow(ResetPasswordSchema, data);
      return resetPasswordApi(data);
    },
  });
}

export function useVerifyEmail() {
  return useMutation<{ verified: boolean }, ApiError | Error, string>({
    mutationFn: (token) => verifyEmailApi(token),
  });
}

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerificationApi });
}
