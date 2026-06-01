"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { useResetPassword } from "@/auth/auth.hooks";
import { ApiError } from "shared";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const { mutateAsync, isPending } = useResetPassword();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await mutateAsync({ token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  if (!token) {
    return (
      <p className="text-center text-neutral-700">
        This reset link is invalid.{" "}
        <Link href="/forgot-password" className="underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-neutral-700">Your password has been reset.</p>
        <button
          onClick={() => router.push("/login")}
          className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p className="text-red-500 text-sm text-center" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-neutral-900 block">
          New password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="At least 8 characters"
          className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-neutral-800 transition disabled:opacity-60"
      >
        {isPending ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-2">
              Choose a new password
            </h1>
          </div>
          <Suspense fallback={null}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
