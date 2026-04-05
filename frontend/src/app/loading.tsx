import { LottieAnimation } from "@/components/lottie-animation";
import { LOTTIE } from "@/lib/lottie-assets";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          <LottieAnimation
            src={LOTTIE.greenLoader}
            loop
            className="w-full h-full"
          />
        </div>
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
