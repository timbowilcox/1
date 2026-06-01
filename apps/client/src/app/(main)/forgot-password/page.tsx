"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { useForgotPassword } from "@/auth/auth.hooks";
import { ApiError } from "shared";

export default function ForgotPasswordPage() {
  const { mutateAsync, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await mutateAsync(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-2">
              Reset your password
            </h1>
            <p className="text-neutral-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-neutral-700">
                If an account exists for <strong>{email}</strong>, a reset link is on
                its way. Check your inbox.
              </p>
              <Link href="/login" className="text-neutral-900 font-medium hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              {error && (
                <p className="text-red-500 text-sm text-center" role="alert">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-900 block">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-black text-white py-3.5 rounded-full font-medium hover:bg-neutral-800 transition disabled:opacity-60"
              >
                {isPending ? "Sending..." : "Send reset link"}
              </button>
              <div className="text-center text-sm text-neutral-500">
                <Link href="/login" className="text-neutral-900 font-medium hover:underline">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
