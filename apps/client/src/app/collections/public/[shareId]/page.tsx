"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useGetPublicCollection } from "@/collections/collections.hooks";

// Public, unauthenticated client-facing view for a shared collection.
// Rendered outside the (main)/(protected) groups so it carries no app chrome.
export default function PublicCollectionPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const { data: collection, isLoading, isError } = useGetPublicCollection(shareId);

  if (isLoading) {
    return (
      <div className="bg-[#f8f8f7] min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#2d2d2d] animate-spin mb-4" />
        <p className="text-[10px] font-black text-[#8e94a0] uppercase tracking-[0.15em]">
          Loading collection...
        </p>
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="bg-[#f8f8f7] min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-luxury-serif text-3xl text-[#1a1a1a]">Collection not found</h1>
        <p className="text-[#8e94a0] max-w-md">
          This share link may have been removed or is no longer active.
        </p>
        <Link
          href="/"
          className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b1b5bd] hover:text-[#1a1a1a]"
        >
          RealStyler
        </Link>
      </div>
    );
  }

  const agent = collection.agentProfile;

  return (
    <div className="bg-[#f8f8f7] min-h-screen text-[#1a1a1a]">
      {/* Agent / company branding */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-400 mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {agent?.logoUrl && (
              <Image
                src={agent.logoUrl}
                alt={agent.companyName || "Logo"}
                width={48}
                height={48}
                unoptimized
                className="rounded-xl object-cover w-12 h-12"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-[22px] font-luxury-serif truncate">
                {agent?.companyName || collection.name}
              </h1>
              {agent?.contactInfo && (
                <p className="text-[13px] text-[#8e94a0] truncate">{agent.contactInfo}</p>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b1b5bd] hover:text-[#1a1a1a] shrink-0"
          >
            RealStyler
          </Link>
        </div>
      </header>

      <main className="max-w-400 mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-[34px] font-luxury-serif leading-none tracking-tight mb-2">
            {collection.name}
          </h2>
          {collection.project && (
            <div className="flex items-center gap-1.5 text-[#8e94a0] text-[14px]">
              <MapPin size={15} className="text-[#b1b5bd] shrink-0" />
              <span className="truncate">
                {collection.project.name}
                {collection.project.address ? ` • ${collection.project.address}` : ""}
              </span>
            </div>
          )}
        </div>

        {collection.items && collection.items.length > 0 ? (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 pb-16">
            {collection.items.map((item) => (
              <div
                key={item.id}
                className="relative break-inside-avoid mb-6 rounded-3xl overflow-hidden shadow-sm bg-white group"
              >
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.metadata?.aesthetic || item.type}
                    width={item.width || 1200}
                    height={item.height || 800}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div
                  className={`absolute top-4 right-4 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full shadow-sm ${
                    item.type === "ORIGINAL"
                      ? "bg-black/70 text-white"
                      : "bg-white/90 text-[#1a1a1a]"
                  }`}
                >
                  {item.type === "ORIGINAL"
                    ? "Original"
                    : item.metadata?.aesthetic || "Restyled"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-4xl p-12 text-center min-h-100 flex items-center justify-center">
            <p className="text-[#8e94a0]">This collection has no images yet.</p>
          </div>
        )}
      </main>

      <footer className="py-10 text-center">
        <Link href="/" className="text-[12px] text-[#b1b5bd] hover:text-[#1a1a1a] transition-colors">
          Made with <span className="font-luxury-serif">RealStyler</span>
        </Link>
      </footer>
    </div>
  );
}
