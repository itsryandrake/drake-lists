"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

const LISTS = [
  { slug: "shopping", label: "Shopping + Grocery", icon: "🛒" },
  { slug: "errands", label: "Errands / Out and About", icon: "🚶" },
  { slug: "home", label: "Home / Property", icon: "🏠" },
  { slug: "online-orders", label: "Online / Orders", icon: "📦" },
  { slug: "admin", label: "Admin", icon: "📋" },
  { slug: "later", label: "Low-pressure / Later", icon: "🌱" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen glass-bg bg-zinc-50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl animate-blob-slow" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-amber-100/15 rounded-full blur-3xl animate-blob-slower" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Crest */}
        <div className="mb-6">
          <Image
            src="/crest.png"
            alt="Drake Household Crest"
            width={120}
            height={120}
            className="drop-shadow-[0_0_30px_rgba(218,165,32,0.2)]"
            priority
          />
        </div>

        <h1 className="text-4xl font-serif font-bold text-zinc-800 mb-2 tracking-wide">
          Drake Lists
        </h1>
        <p className="text-zinc-400 text-sm mb-10">Your household, organised.</p>

        {/* Ryan's lists */}
        <div className="glass rounded-2xl p-5 w-full max-w-sm mb-4">
          <h2 className="text-sm font-semibold text-amber-600 mb-3 uppercase tracking-wider">Ryan</h2>
          <div className="space-y-1">
            {LISTS.map((list) => (
              <button
                key={`ryan-${list.slug}`}
                onClick={() => router.push(`/ryan/${list.slug}`)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-amber-50/50 transition-colors flex items-center gap-3 group"
              >
                <span className="text-lg">{list.icon}</span>
                <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{list.label}</span>
                <svg className="ml-auto w-4 h-4 text-zinc-300 group-hover:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Emily's lists */}
        <div className="glass rounded-2xl p-5 w-full max-w-sm">
          <h2 className="text-sm font-semibold text-rose-500 mb-3 uppercase tracking-wider">Emily</h2>
          <div className="space-y-1">
            {LISTS.map((list) => (
              <button
                key={`emily-${list.slug}`}
                onClick={() => router.push(`/emily/${list.slug}`)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-50/50 transition-colors flex items-center gap-3 group"
              >
                <span className="text-lg">{list.icon}</span>
                <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{list.label}</span>
                <svg className="ml-auto w-4 h-4 text-zinc-300 group-hover:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <p className="text-zinc-400 text-xs mt-10">
          Message Donna to add items. She handles the rest.
        </p>
      </div>
    </div>
  );
}
