"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/auth/auth.store";
import { useDeleteAccount } from "@/users/users.hooks";
import { useResendVerification } from "@/auth/auth.hooks";
import { useSuccessToastStore } from "@/stores/useSuccessToastStore";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-900 font-medium text-right">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const showSuccess = useSuccessToastStore((s) => s.show);
  const deleteAccount = useDeleteAccount();
  const resend = useResendVerification();
  const [confirming, setConfirming] = useState(false);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-neutral-900 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 text-center px-6">
          <p className="text-neutral-600">Please sign in to manage your account.</p>
          <Link
            href="/login?redirect=/settings"
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition"
          >
            Sign in
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleResend = async () => {
    try {
      await resend.mutateAsync();
      showSuccess("Verification email sent.");
    } catch {
      /* surfaced globally */
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      setUser(null);
      showSuccess("Your account has been deleted.");
      router.push("/");
    } catch {
      /* surfaced globally */
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-10">Settings</h1>

        <section className="mb-12">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Account</h2>
          <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            <Row label="Name" value={user.name} />
            <Row
              label="Email"
              value={
                <span className="flex items-center gap-2 justify-end">
                  {user.email}
                  {user.emailVerified ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resend.isPending}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                    >
                      {resend.isPending ? "Sending…" : "Unverified — resend"}
                    </button>
                  )}
                </span>
              }
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-red-600 mb-4">Danger zone</h2>
          <div className="rounded-2xl border border-red-200 p-6">
            <p className="text-neutral-600 mb-4">
              Permanently delete your account and all your projects, images, and
              collections. This cannot be undone.
            </p>
            {confirming ? (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleDelete}
                  disabled={deleteAccount.isPending}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleteAccount.isPending ? "Deleting…" : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="border border-red-300 text-red-600 px-5 py-2.5 rounded-full font-medium hover:bg-red-50 transition"
              >
                Delete account
              </button>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
