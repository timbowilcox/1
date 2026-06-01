import { z } from "zod";

const emailField = z.email({ message: "Invalid email format" });

// Strength is enforced when a password is *created* (register / reset), not at
// login (login just compares against the stored hash).
const strongPassword = z
  .string({ message: "Password is required." })
  .min(8, { message: "The password must be at least 8 characters." })
  .max(64, { message: "The password must be shorter than 64 characters." });

export const LoginSchema = z.object({
  email: emailField,
  password: z
    .string({ message: "Password is required." })
    .min(1, { message: "Password is required." })
    .max(64, { message: "The password must be shorter than 64 characters." }),
});

export const RegisterSchema = z.object({
  name: z
    .string({ message: "Name is required." })
    .min(3, { message: "The name must be longer than 3 characters." })
    .max(24, { message: "The name must be shorter than 24 characters." }),
  email: emailField,
  password: strongPassword,
});

export const ForgotPasswordSchema = z.object({
  email: emailField,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required." }),
  password: strongPassword,
});
