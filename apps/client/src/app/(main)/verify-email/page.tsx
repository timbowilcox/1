"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { useVerifyEmail } from "@/auth/auth.hooks";

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { mutateAsync } = useVerifyEmail();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against double-run consuming the token twice
    ran.current = true;
    if (!token) {
      setStatus("error");
      return;
    }
    mutateAsync(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token, mutateAsync]);

  if (status === "verifying") {
    return <p className="text-neutral-500">Verifying your email…</p>;
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif text-neutral-900">Email verified</h1>
        <p className="text-neutral-600">Your email is confirmed. You&apos;re all set.</p>
        <Link
          href="/dashboard"
          className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-serif text-neutral-900">Verification failed</h1>
      <p className="text-neutral-600">This link is invalid or has expired.</p>
      <Link href="/login" className="text-neutral-900 font-medium hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-md">
          <Suspense fallback={null}>
            <VerifyInner />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
