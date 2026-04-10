"use client";

import { LottieAnimation } from "@/components/lottie-animation";
import { LOTTIE } from "@/lib/lottie-assets";

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
      <div className="w-28 h-28">
        <LottieAnimation
          src={LOTTIE.hourglass}
          loop
          className="w-full h-full"
        />
      </div>
      {message && (
        <p className="text-sm text-slate-400">{message}</p>
      )}
    </div>
  );
}
