import { useMutation } from "@tanstack/react-query";
import { updateAvatarApi, deleteAccountApi } from "./users.api";

export function useUpdateAvatar() {
  return useMutation({
    mutationFn: updateAvatarApi,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccountApi,
  });
}
