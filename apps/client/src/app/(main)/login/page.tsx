"use client";

import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { useLogin } from "@/auth/auth.hooks";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, SubmitEvent } from "react";
import { ApiError } from "shared";

function LoginForm() {
  const { mutateAsync, error } = useLogin();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    await mutateAsync({ email, password });
    router.push(redirectPath);
  }

  const err = error instanceof ApiError && {
    message: error.message,
    code: error.code,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-2">
              Welcome back
            </h1>
            <p className="text-neutral-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {err && err.code !== "email" && err.code !== "password" && (
              <p className="text-red-500 text-sm text-center" role="alert">
                {err.message}
              </p>
            )}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-neutral-900 block"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
              />
              {err && err.code === "email" && (
                <p className="mt-1 text-red-500 text-sm">{err.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-neutral-900 block"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
              />
              {err && err.code === "password" && (
                <p className="mt-1 text-red-500 text-sm">{err.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-neutral-800 transition shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5 duration-300"
            >
              Sign in
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${searchParams.has("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
              className="text-neutral-900 font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
