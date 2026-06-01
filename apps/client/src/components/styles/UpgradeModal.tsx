"use client";

import React, { useEffect } from 'react';
import { X, Clock, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useCheckout } from '@/billing/billing.hooks';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  currentPlan: 'PRO' | 'PRO_PLUS' | null | undefined; 
}

export default function UpgradeModal({
  isOpen,
  onCancel,
  currentPlan,
}: Props) {
  const { mutate, isPending } = useCheckout();
  const isNavigating = isPending;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isNavigating) onCancel();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel, isNavigating]);

  if (!isOpen) return null;

  const isMaxPlan = currentPlan === 'PRO_PLUS';

  const handleNavigate = () => {
    // Upgrade to the next tier up and go straight to Stripe Checkout.
    const targetPlan: 'PRO' | 'PRO_PLUS' =
      currentPlan === 'PRO' ? 'PRO_PLUS' : 'PRO';
    mutate(targetPlan);
  };

  return (
    <section 
      className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center p-4 pt-20"
      onClick={() => !isNavigating && onCancel()}
    >
      <div 
        className="bg-white w-full max-w-115 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close "X" button */}
        <button 
          onClick={onCancel}
          disabled={isNavigating}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {/* Content Section */}
        <div className="p-8 md:p-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
            {isMaxPlan ? (
              <Clock size={22} className="text-[#949ba6]" strokeWidth={1.5} />
            ) : (
              <Star size={22} className="text-[#949ba6]" strokeWidth={1.5} />
            )}
          </div>

          <h2 className="text-[32px] font-luxury-serif leading-tight mb-3 tracking-tight">
            {isMaxPlan ? "Limit Reached" : "Upgrade Your Plan"}
          </h2>
          <p className="text-base text-[#8e94a0] mb-8 max-w-75 leading-relaxed font-sans">
            {isMaxPlan 
              ? "You've used all your credits for this billing period. Please wait for your quota to refresh to continue generating styles."
              : "You've run out of credits to generate new styles. Upgrade your subscription to keep transforming your spaces."}
          </p>

          {/* Action Buttons */}
          <div className="w-full mt-2 flex flex-col gap-3">
            {!isMaxPlan && (
              <button
                onClick={handleNavigate}
                disabled={isNavigating}
                className="w-full py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-lg bg-[#2d2d2d] text-white hover:bg-black active:scale-[0.98] disabled:bg-gray-400 disabled:active:scale-100 disabled:cursor-not-allowed"
              >
                {isNavigating ? (
                  <>
                    Loading...
                    <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
                  </>
                ) : (
                  <>
                    Upgrade Now
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onCancel}
              disabled={isNavigating}
              className={`py-1 font-bold text-sm transition-colors ${
                isMaxPlan 
                  ? "w-full py-4 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed" 
                  : "text-[#8e94a0] hover:text-black mt-2 disabled:opacity-50 disabled:hover:text-[#8e94a0] disabled:cursor-not-allowed"
              }`}
            >
              {isMaxPlan ? "Got it" : "Maybe later"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}