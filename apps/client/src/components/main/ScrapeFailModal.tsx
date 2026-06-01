"use client";

import React, { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onUploadManually: () => void;
}

export default function ScrapeFailModal({
  isOpen,
  onCancel,
  onUploadManually,
}: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
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
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <section 
      className="fixed inset-0 z-60 bg-white/60 backdrop-blur-md flex items-center justify-center p-4 pt-20 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close "X" button */}
        <button 
          onClick={onCancel}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </button>

        {/* Content Section */}
        <div className="p-8 md:p-10 flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6 border border-red-100">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-[32px] font-serif leading-tight mb-3 tracking-tight">
            Images Not Found
          </h2>
          <p className="text-base text-[#8e94a0] mb-8 max-w-75 leading-relaxed font-sans">
            We couldn&apos;t extract any images from the provided URL. The site might be protected or have no compatible images.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={onUploadManually}
              className="w-full py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition shadow-lg active:scale-[0.98] bg-[#2d2d2d] text-white hover:bg-black"
            >
              Upload Manually
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={onCancel}
              className="py-2 text-[#8e94a0] font-bold text-sm hover:text-black transition-colors"
            >
              Try Another URL
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}