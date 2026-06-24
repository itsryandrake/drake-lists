"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      {/* Crest */}
      <div className="mb-8">
        <Image
          src="/crest.png"
          alt="Drake Household Crest"
          width={160}
          height={160}
          className="drop-shadow-[0_0_40px_rgba(218,165,32,0.3)]"
          priority
        />
      </div>

      <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-wide">
        Drake Lists
      </h1>
      <p className="text-zinc-400 text-lg mb-12">Your household, organised.</p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/ryan/shopping")}
          className="px-10 py-4 bg-gradient-to-br from-amber-500 to-amber-600 text-black font-semibold rounded-2xl text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
        >
          Ryan
        </button>
        <button
          onClick={() => router.push("/emily/shopping")}
          className="px-10 py-4 bg-gradient-to-br from-rose-400 to-rose-500 text-white font-semibold rounded-2xl text-lg hover:from-rose-300 hover:to-rose-400 transition-all shadow-lg shadow-rose-500/20"
        >
          Emily
        </button>
      </div>

      <p className="text-zinc-600 text-sm mt-16">
        Message Donna to add items. She handles the rest.
      </p>
    </div>
  );
}
